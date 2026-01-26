/**
 * Cost Computations for Monthly Performance Analysis
 *
 * Computes labor costs, expense costs, and merges into project tables
 */

import type {
  HoursRecord,
  ExpenseRecord,
  CompensationRecord,
  RevenueCenter,
  CostCenter,
  NonRevenueClient,
  HoursDetail,
  ExpenseDetail,
} from './types';

interface LaborSummary {
  contractCode: string;
  hours: number;
  laborCost: number;
}

interface ExpenseSummary {
  contractCode: string;
  expenseCost: number;
}

/**
 * Calculate labor costs by joining hours with compensation rates
 */
export function calculateLaborCosts(
  hoursRecords: HoursRecord[],
  compRecords: CompensationRecord[]
): {
  laborSummary: LaborSummary[];
  hoursDetail: HoursDetail[];
  logs: string[];
} {
  const logs: string[] = [];

  // Create compensation lookup
  const compLookup = new Map<string, number>();
  for (const c of compRecords) {
    compLookup.set(c.staffKey, c.hourlyCost);
  }

  // Join hours with compensation
  const joinedRecords: Array<HoursRecord & { hourlyCost: number; laborCost: number }> = [];
  const missingStaff = new Set<string>();
  let missingHours = 0;

  for (const h of hoursRecords) {
    const hourlyCost = compLookup.get(h.staffKey);

    if (hourlyCost === undefined) {
      missingStaff.add(h.staffKey);
      missingHours += h.hours;
      continue;
    }

    joinedRecords.push({
      ...h,
      hourlyCost,
      laborCost: h.hours * hourlyCost,
    });
  }

  if (missingStaff.size > 0) {
    logs.push(
      `${missingStaff.size} staff missing compensation records (${missingHours.toFixed(1)} hours excluded)`
    );
  }

  // Create hours detail (for drill-down) - aggregate by contract_code + staff_key
  const detailMap = new Map<string, HoursDetail>();
  for (const r of joinedRecords) {
    const key = `${r.contractCode}|${r.staffKey}`;
    const existing = detailMap.get(key);

    if (existing) {
      existing.hours += r.hours;
      existing.laborCost += r.laborCost;
    } else {
      detailMap.set(key, {
        contractCode: r.contractCode,
        staffKey: r.staffKey,
        hours: r.hours,
        hourlyCost: r.hourlyCost,
        laborCost: r.laborCost,
      });
    }
  }

  const hoursDetail = Array.from(detailMap.values());

  // Aggregate by project for summary
  const summaryMap = new Map<string, LaborSummary>();
  for (const r of joinedRecords) {
    const existing = summaryMap.get(r.contractCode);

    if (existing) {
      existing.hours += r.hours;
      existing.laborCost += r.laborCost;
    } else {
      summaryMap.set(r.contractCode, {
        contractCode: r.contractCode,
        hours: r.hours,
        laborCost: r.laborCost,
      });
    }
  }

  const laborSummary = Array.from(summaryMap.values());

  return { laborSummary, hoursDetail, logs };
}

/**
 * Calculate expense costs (already filtered to non-reimbursable)
 */
export function calculateExpenseCosts(
  expenseRecords: ExpenseRecord[]
): {
  expenseSummary: ExpenseSummary[];
  expenseDetail: ExpenseDetail[];
} {
  // Keep detail for drill-down
  const expenseDetail: ExpenseDetail[] = expenseRecords.map(e => ({
    contractCode: e.contractCode,
    expenseDate: e.date,
    amount: e.amount,
    notes: e.notes,
  }));

  // Aggregate by project
  const summaryMap = new Map<string, number>();
  for (const e of expenseRecords) {
    const existing = summaryMap.get(e.contractCode) || 0;
    summaryMap.set(e.contractCode, existing + e.amount);
  }

  const expenseSummary: ExpenseSummary[] = Array.from(summaryMap.entries()).map(
    ([contractCode, expenseCost]) => ({ contractCode, expenseCost })
  );

  return { expenseSummary, expenseDetail };
}

/**
 * Merge direct costs into revenue centers table
 */
export function mergeDirectCostsToRevenueCenters(
  revenueCenters: RevenueCenter[],
  laborSummary: LaborSummary[],
  expenseSummary: ExpenseSummary[]
): RevenueCenter[] {
  const laborLookup = new Map<string, LaborSummary>();
  for (const l of laborSummary) {
    laborLookup.set(l.contractCode, l);
  }

  const expenseLookup = new Map<string, ExpenseSummary>();
  for (const e of expenseSummary) {
    expenseLookup.set(e.contractCode, e);
  }

  return revenueCenters.map(rc => {
    const labor = laborLookup.get(rc.contractCode);
    const expense = expenseLookup.get(rc.contractCode);

    return {
      ...rc,
      hours: labor?.hours ?? 0,
      laborCost: labor?.laborCost ?? 0,
      expenseCost: expense?.expenseCost ?? 0,
    };
  });
}

/**
 * Calculate costs for cost centers from hours and expenses
 */
export function calculateCostCenterCosts(
  costCenters: CostCenter[],
  hoursDetail: HoursDetail[],
  expenseDetail: ExpenseDetail[]
): CostCenter[] {
  const ccCodes = new Set(costCenters.map(cc => cc.contractCode));

  // Aggregate labor by cost center
  const laborByCC = new Map<string, { hours: number; laborCost: number }>();
  for (const h of hoursDetail) {
    if (!ccCodes.has(h.contractCode)) continue;

    const existing = laborByCC.get(h.contractCode) || { hours: 0, laborCost: 0 };
    existing.hours += h.hours;
    existing.laborCost += h.laborCost;
    laborByCC.set(h.contractCode, existing);
  }

  // Aggregate expenses by cost center
  const expensesByCC = new Map<string, number>();
  for (const e of expenseDetail) {
    if (!ccCodes.has(e.contractCode)) continue;

    const existing = expensesByCC.get(e.contractCode) || 0;
    expensesByCC.set(e.contractCode, existing + e.amount);
  }

  return costCenters.map(cc => {
    const labor = laborByCC.get(cc.contractCode);
    const expenses = expensesByCC.get(cc.contractCode) || 0;

    return {
      ...cc,
      hours: labor?.hours ?? 0,
      laborCost: labor?.laborCost ?? 0,
      expenseCost: expenses,
      totalCost: (labor?.laborCost ?? 0) + expenses,
    };
  });
}

/**
 * Calculate costs for non-revenue clients from hours and expenses
 */
export function calculateNonRevenueClientCosts(
  nonRevenueClients: NonRevenueClient[],
  hoursDetail: HoursDetail[],
  expenseDetail: ExpenseDetail[]
): NonRevenueClient[] {
  if (nonRevenueClients.length === 0) {
    return nonRevenueClients;
  }

  const nrcCodes = new Set(nonRevenueClients.map(nrc => nrc.contractCode));

  // Aggregate labor
  const laborByNRC = new Map<string, { hours: number; laborCost: number }>();
  for (const h of hoursDetail) {
    if (!nrcCodes.has(h.contractCode)) continue;

    const existing = laborByNRC.get(h.contractCode) || { hours: 0, laborCost: 0 };
    existing.hours += h.hours;
    existing.laborCost += h.laborCost;
    laborByNRC.set(h.contractCode, existing);
  }

  // Aggregate expenses
  const expensesByNRC = new Map<string, number>();
  for (const e of expenseDetail) {
    if (!nrcCodes.has(e.contractCode)) continue;

    const existing = expensesByNRC.get(e.contractCode) || 0;
    expensesByNRC.set(e.contractCode, existing + e.amount);
  }

  return nonRevenueClients.map(nrc => {
    const labor = laborByNRC.get(nrc.contractCode);
    const expenses = expensesByNRC.get(nrc.contractCode) || 0;

    return {
      ...nrc,
      hours: labor?.hours ?? 0,
      laborCost: labor?.laborCost ?? 0,
      expenseCost: expenses,
      totalCost: (labor?.laborCost ?? 0) + expenses,
    };
  });
}
