/**
 * Validation Rules for Monthly Performance Analysis
 *
 * Implements FAIL and WARN validation checks
 */

import type {
  ValidationItem,
  RevenueCenter,
  CostCenter,
  NonRevenueClient,
  ProFormaProject,
  OverheadPools,
  HoursRecord,
  ExpenseRecord,
  CompensationRecord,
  PnLAccount,
} from './types';

export interface ValidationResult {
  passes: string[];
  warnings: string[];
  failures: string[];
}

export function createValidationResult(): ValidationResult {
  return { passes: [], warnings: [], failures: [] };
}

export function hasFailures(result: ValidationResult): boolean {
  return result.failures.length > 0;
}

export function getSummary(result: ValidationResult): string {
  return `PASS: ${result.passes.length} | WARN: ${result.warnings.length} | FAIL: ${result.failures.length}`;
}

export function toValidationItems(result: ValidationResult): ValidationItem[] {
  const items: ValidationItem[] = [];

  for (const msg of result.passes) {
    items.push({ type: 'pass', message: msg });
  }
  for (const msg of result.warnings) {
    items.push({ type: 'warn', message: msg });
  }
  for (const msg of result.failures) {
    items.push({ type: 'fail', message: msg });
  }

  return items;
}

export interface ValidationData {
  revenueCenters: RevenueCenter[];
  costCenters: CostCenter[];
  nonRevenueClients: NonRevenueClient[];
  proforma: ProFormaProject[];
  pools: OverheadPools;
  hours: HoursRecord[];
  expenses: ExpenseRecord[];
  compensation: CompensationRecord[];
  pnl: PnLAccount[];
}

/**
 * Validate data completeness
 */
function validateDataCompleteness(data: ValidationData, result: ValidationResult): void {
  if (data.revenueCenters.length === 0) {
    result.failures.push('No revenue centers found');
  } else {
    result.passes.push('Revenue centers loaded');
  }

  if (data.pools.sgaPool !== undefined && data.pools.dataPool !== undefined && data.pools.workplacePool !== undefined) {
    result.passes.push('Overhead pools calculated');
  } else {
    result.failures.push('Overhead pools missing required values');
  }

  if (data.compensation.length === 0) {
    result.failures.push('Compensation data missing or empty');
  } else {
    result.passes.push('Compensation loaded');
  }

  if (data.hours.length === 0) {
    result.warnings.push('Harvest Hours is empty');
  }

  if (data.expenses.length === 0) {
    result.warnings.push('Harvest Expenses is empty');
  }
}

/**
 * Validate key integrity
 */
function validateKeyIntegrity(data: ValidationData, result: ValidationResult): void {
  // Check for duplicate last names in compensation
  const staffKeys = data.compensation.map(c => c.staffKey);
  const duplicates = staffKeys.filter((key, idx) => staffKeys.indexOf(key) !== idx);

  if (duplicates.length > 0) {
    const uniqueDups = [...new Set(duplicates)].sort();
    result.failures.push(`Duplicate Last Names in Compensation: ${uniqueDups.join(', ')}`);
  } else if (data.compensation.length > 0) {
    result.passes.push('Unique Last Names in Compensation');
  }

  // Check if hours staff have compensation records
  if (data.hours.length > 0 && data.compensation.length > 0) {
    const compStaff = new Set(data.compensation.map(c => c.staffKey));
    const hoursStaff = new Set(data.hours.map(h => h.staffKey));
    const missingStaff = [...hoursStaff].filter(s => !compStaff.has(s));

    if (missingStaff.length > 0) {
      result.warnings.push(`Harvest Hours staff missing in Compensation: ${missingStaff.sort().join(', ')}`);
    } else {
      result.passes.push('All Harvest Hours staff have compensation records');
    }
  }

  // Check for revenue/cost center conflicts
  const revCodes = new Set(data.revenueCenters.map(rc => rc.contractCode));
  const ccCodes = new Set(data.costCenters.map(cc => cc.contractCode));
  const conflicts = [...revCodes].filter(c => ccCodes.has(c));

  if (conflicts.length > 0) {
    result.failures.push(`Codes appear as both revenue and cost centers: ${conflicts.sort().join(', ')}`);
  } else {
    result.passes.push('No revenue/cost center code conflicts');
  }
}

/**
 * Validate overhead pool sizes are reasonable
 */
function validatePoolReasonableness(data: ValidationData, result: ValidationResult): void {
  const totalRevenue = data.revenueCenters.reduce((sum, rc) => sum + rc.revenue, 0);

  if (totalRevenue > 0) {
    const sgaRatio = data.pools.sgaPool / totalRevenue;

    if (sgaRatio > 2.0) {
      result.failures.push(
        `SG&A pool ($${data.pools.sgaPool.toLocaleString()}) is ${sgaRatio.toFixed(1)}x revenue ` +
        `($${totalRevenue.toLocaleString()}) - likely P&L extraction error (income/subtotals included)`
      );
    } else if (sgaRatio > 1.0) {
      result.warnings.push(
        `SG&A pool ($${data.pools.sgaPool.toLocaleString()}) is ${sgaRatio.toFixed(1)}x revenue ` +
        `($${totalRevenue.toLocaleString()}) - verify this is expected`
      );
    } else {
      result.passes.push(`SG&A pool is ${(sgaRatio * 100).toFixed(1)}% of revenue (reasonable)`);
    }
  }
}

/**
 * Validate mathematical reconciliations
 */
function validateMathematical(data: ValidationData, result: ValidationResult, tolerance: number = 0.01): void {
  if (data.revenueCenters.length === 0) return;

  // Check revenue sum matches proforma
  if (data.proforma.length > 0) {
    const proformaTotal = data.proforma.reduce((sum, p) => sum + p.revenue, 0);
    const rcTotal = data.revenueCenters.reduce((sum, rc) => sum + rc.revenue, 0);
    const diffRev = Math.abs(rcTotal - proformaTotal);

    if (diffRev <= tolerance) {
      result.passes.push(`Revenue sum matches Pro Forma (+/-${tolerance})`);
    } else {
      result.failures.push(`Revenue sum does not match Pro Forma (diff $${diffRev.toFixed(2)})`);
    }
  }

  // Check allocation reconciliations
  const allocations: Array<{ col: string; key: keyof OverheadPools; getValue: (rc: RevenueCenter) => number }> = [
    { col: 'sga_allocation', key: 'sgaPool', getValue: rc => rc.sgaAllocation },
    { col: 'data_allocation', key: 'dataPool', getValue: rc => rc.dataAllocation },
    { col: 'workplace_allocation', key: 'workplacePool', getValue: rc => rc.workplaceAllocation },
  ];

  for (const { col, key, getValue } of allocations) {
    const allocated = data.revenueCenters.reduce((sum, rc) => sum + getValue(rc), 0);
    const pool = data.pools[key];
    const diff = Math.abs(allocated - pool);

    if (diff <= tolerance) {
      result.passes.push(`${col.replace(/_/g, ' ')} sums to pool (+/-${tolerance})`);
    } else {
      result.failures.push(`${col.replace(/_/g, ' ')} does not sum to pool (diff $${diff.toFixed(2)})`);
    }
  }
}

/**
 * Validate reasonableness (warnings only)
 */
function validateReasonableness(data: ValidationData, result: ValidationResult): void {
  // Check for revenue centers with no hours
  const noHours = data.revenueCenters.filter(rc => rc.hours === 0);
  if (noHours.length > 0) {
    const codes = noHours.slice(0, 5).map(rc => rc.contractCode).join(', ');
    result.warnings.push(`${noHours.length} revenue centers have revenue but no hours: ${codes}...`);
  }

  // Check for hours codes not in revenue or cost centers
  const revCodes = new Set(data.revenueCenters.map(rc => rc.contractCode));
  const ccCodes = new Set(data.costCenters.map(cc => cc.contractCode));
  const hoursCodes = new Set(data.hours.map(h => h.contractCode));
  const missingRev = [...hoursCodes].filter(c => !revCodes.has(c) && !ccCodes.has(c));

  if (missingRev.length > 0) {
    const codes = missingRev.slice(0, 5).join(', ');
    result.warnings.push(`${missingRev.length} codes have hours but no revenue (non-revenue clients): ${codes}...`);
  }

  // Check for unmatched P&L accounts
  const unmatched = data.pnl.filter(a => a.matchedBy === 'default' && a.bucket === 'SGA');
  if (unmatched.length > 0) {
    const accounts = unmatched.slice(0, 5).map(a => a.accountName).join(', ');
    result.warnings.push(`${unmatched.length} P&L accounts defaulted to SG&A (unmatched): ${accounts}...`);
  } else if (data.pnl.length > 0) {
    result.passes.push('All P&L accounts matched by tagging rules or assigned appropriately');
  }
}

/**
 * Run all validation checks
 */
export function runAllValidations(data: ValidationData, tolerance: number = 0.01): ValidationResult {
  const result = createValidationResult();

  validateDataCompleteness(data, result);
  validateKeyIntegrity(data, result);
  validatePoolReasonableness(data, result);
  validateMathematical(data, result, tolerance);
  validateReasonableness(data, result);

  return result;
}
