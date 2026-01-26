/**
 * Data Loaders for Monthly Performance Analysis
 *
 * Loads and validates the 5 source Excel files using xlsx library
 */

import * as XLSX from 'xlsx';
import type {
  ProFormaProject,
  CompensationRecord,
  HoursRecord,
  ExpenseRecord,
  PnLAccount,
} from './types';
import { CATEGORY_MAPPING, PNL_ACCOUNT_TAGS } from './config';

/**
 * Normalize contract code for consistent joins
 */
export function normalizeContractCode(code: unknown): string {
  if (code === null || code === undefined) {
    throw new Error('Contract code is missing');
  }

  let normalized = String(code).trim();
  normalized = normalized.replace(/\u00a0/g, ' '); // Remove non-breaking spaces
  normalized = normalized.replace(/\s+/g, ' '); // Collapse whitespace

  if (!normalized) {
    throw new Error('Contract code is empty after normalization');
  }

  return normalized;
}

/**
 * Find column by candidate names (case-insensitive)
 */
function findColumn(
  headers: string[],
  candidates: string[],
  required: boolean = false
): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex(
      (h) => String(h).trim().toLowerCase() === candidate.toLowerCase()
    );
    if (idx >= 0) return idx;
  }
  if (required) {
    throw new Error(`Required column not found. Tried: ${candidates.join(', ')}`);
  }
  return -1;
}

/**
 * Parse month string like "November2025" to get month range
 */
function parseMonthRange(month: string): { start: Date; end: Date } {
  const match = month.match(/([A-Za-z]+)(\d{4})/);
  if (!match) {
    throw new Error(`Invalid month format: ${month}. Expected e.g. 'November2025'`);
  }

  const [, monthName, yearStr] = match;
  const year = parseInt(yearStr);

  const monthDate = new Date(`${monthName} 1, ${year}`);
  if (isNaN(monthDate.getTime())) {
    throw new Error(`Invalid month name: ${monthName}`);
  }

  const monthNum = monthDate.getMonth();
  const start = new Date(year, monthNum, 1);
  const end = new Date(year, monthNum + 1, 0); // Last day of month

  return { start, end };
}

/**
 * Load Pro Forma revenue file
 */
export function loadProForma(
  buffer: Buffer,
  month: string
): { data: ProFormaProject[]; logs: string[] } {
  const logs: string[] = [];
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const sheetName = 'PRO FORMA 2025';
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet '${sheetName}' not found in Pro Forma workbook`);
  }

  const sheet = workbook.Sheets[sheetName];
  const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Find header row (contains Jan, Feb, Mar)
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const rowText = (data[i] || []).join(' ');
    if (rowText.includes('Jan') && rowText.includes('Feb') && rowText.includes('Mar')) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) {
    throw new Error("Cannot find header row with month sequence (Jan, Feb, Mar)");
  }

  const header = data[headerRowIdx] as string[];

  // Find month column - extract just month name from "November2025"
  const monthMatch = month.match(/([A-Za-z]+)/);
  const monthName = monthMatch ? monthMatch[1] : month;
  const monthAbbrev = monthName.slice(0, 3);

  let monthColIdx = -1;
  for (let i = 0; i < header.length; i++) {
    const val = String(header[i] || '').trim();
    if (val === monthName || val === monthAbbrev || val.toLowerCase() === monthName.toLowerCase()) {
      monthColIdx = i;
      break;
    }
  }
  if (monthColIdx === -1) {
    throw new Error(`Cannot find month column for '${monthName}' in header`);
  }

  // Find total revenue row
  let totalRevenueRowIdx = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const colB = String(data[i]?.[1] || '').toLowerCase();
    if (colB.includes('base revenue') || colB.includes('forecasted revenue')) {
      totalRevenueRowIdx = i;
      break;
    }
  }
  if (totalRevenueRowIdx === -1) {
    throw new Error("Cannot find total revenue row (Base Revenue or Forecasted Revenue)");
  }

  const totalRevenue = Number(data[totalRevenueRowIdx][monthColIdx]) || 0;

  // Parse projects
  const projects: ProFormaProject[] = [];
  let currentSection: string | null = null;

  for (let idx = headerRowIdx + 1; idx < data.length; idx++) {
    const row = data[idx] || [];
    const colA = row[0];
    const colB = row[1];
    const colC = row[2];
    const revenueVal = row[monthColIdx];

    // Skip empty rows
    if (!colB && !colC) continue;

    // Section header (col B filled, col C empty)
    if (colB && !colC) {
      currentSection = String(colB).trim();
      continue;
    }

    // Project row (both B and C filled)
    if (colB && colC) {
      const allocationTag = String(colA || '').trim();
      const validTag = ['Data', 'Wellness'].includes(allocationTag) ? allocationTag : '';

      projects.push({
        contractCode: normalizeContractCode(colC),
        projectName: String(colB).trim(),
        proformaSection: currentSection,
        analysisCategory: currentSection ? (CATEGORY_MAPPING[currentSection] || 'Unknown') : 'Unknown',
        allocationTag: validTag,
        revenue: Number(revenueVal) || 0,
      });
    }
  }

  if (projects.length === 0) {
    throw new Error("No projects found in Pro Forma after parsing");
  }

  // Aggregate duplicates
  const aggregated = aggregateProFormaDuplicates(projects, logs);

  // Verify revenue total
  const calculatedTotal = aggregated.reduce((sum, p) => sum + p.revenue, 0);
  if (Math.abs(calculatedTotal - totalRevenue) > 0.01) {
    throw new Error(
      `Revenue sum mismatch: calculated $${calculatedTotal.toFixed(2)} ` +
      `vs total $${totalRevenue.toFixed(2)} (diff: $${Math.abs(calculatedTotal - totalRevenue).toFixed(2)})`
    );
  }

  logs.push(`Pro Forma: ${aggregated.length} projects, revenue $${totalRevenue.toLocaleString()}`);
  const dataTagged = aggregated.filter(p => p.allocationTag === 'Data').length;
  const wellnessTagged = aggregated.filter(p => p.allocationTag === 'Wellness').length;
  const untagged = aggregated.filter(p => !p.allocationTag).length;
  logs.push(`Allocation tags: ${dataTagged} Data, ${wellnessTagged} Wellness, ${untagged} untagged`);

  return { data: aggregated, logs };
}

function aggregateProFormaDuplicates(
  projects: ProFormaProject[],
  logs: string[]
): ProFormaProject[] {
  // Check for allocation tag conflicts
  const byCode = new Map<string, ProFormaProject[]>();
  for (const p of projects) {
    const existing = byCode.get(p.contractCode) || [];
    existing.push(p);
    byCode.set(p.contractCode, existing);
  }

  for (const [code, rows] of byCode) {
    const tags = new Set(rows.map(r => r.allocationTag).filter(t => t));
    if (tags.has('Data') && tags.has('Wellness')) {
      throw new Error(
        `Allocation tag conflict for contract code '${code}': ` +
        "Found both 'Data' and 'Wellness' tags. Please fix Pro Forma."
      );
    }
  }

  // Aggregate
  const aggregated: ProFormaProject[] = [];
  for (const [code, rows] of byCode) {
    const tags = new Set(rows.map(r => r.allocationTag).filter(t => t));
    const reconcileTag = tags.has('Data') ? 'Data' : tags.has('Wellness') ? 'Wellness' : '';

    aggregated.push({
      contractCode: code,
      projectName: rows[0].projectName,
      proformaSection: rows[0].proformaSection,
      analysisCategory: rows[0].analysisCategory,
      allocationTag: reconcileTag,
      revenue: rows.reduce((sum, r) => sum + r.revenue, 0),
    });
  }

  const duplicatesCount = projects.length - aggregated.length;
  if (duplicatesCount > 0) {
    logs.push(`Aggregated ${duplicatesCount} duplicate contract codes`);
  }

  return aggregated;
}

/**
 * Load Compensation file
 */
export function loadCompensation(
  buffer: Buffer
): { data: CompensationRecord[]; logs: string[] } {
  const logs: string[] = [];
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) {
    throw new Error('Compensation file is empty');
  }

  const headers = Object.keys(rows[0]);

  // Find last name column
  const lastNameCol = findColumnByName(headers, ['Last Name', 'LastName']);
  if (!lastNameCol) {
    throw new Error("Required column 'Last Name' not found in Compensation file");
  }

  // Try Strategy A: Read Base Cost Per Hour directly
  const baseCostCol = findColumnByName(headers, ['Base Cost Per Hour', 'Base Cost/Hour', 'Hourly Cost']);

  let strategy: 'A' | 'B';
  const records: CompensationRecord[] = [];

  if (baseCostCol) {
    strategy = 'A';
    logs.push(`Strategy A: Read '${baseCostCol}' directly`);

    for (const row of rows) {
      const staffKey = String(row[lastNameCol] || '').trim();
      const hourlyCost = Number(row[baseCostCol]) || 0;

      if (staffKey) {
        records.push({ staffKey, hourlyCost, strategyUsed: 'A' });
      }
    }
  } else {
    strategy = 'B';
    logs.push('Strategy B: Computing hourly cost from components');

    const expectedHoursPerMonth = 216.6667;

    // Find Total or component columns
    const totalCol = findColumnByName(headers, ['Total', 'Total Compensation', 'Monthly Total']);

    for (const row of rows) {
      const staffKey = String(row[lastNameCol] || '').trim();
      if (!staffKey) continue;

      let monthlyCost = 0;
      if (totalCol) {
        monthlyCost = Number(row[totalCol]) || 0;
      } else {
        // Sum components
        const components = ['Base Compensation', 'Company Taxes Paid', 'ICHRA Contribution',
          '401k Match', 'Executive Assistant', 'Well Being Card', 'Travel & Expenses'];
        for (const comp of components) {
          const col = findColumnByName(headers, [comp]);
          if (col) {
            monthlyCost += Number(row[col]) || 0;
          }
        }
      }

      const hourlyCost = monthlyCost / expectedHoursPerMonth;
      records.push({ staffKey, hourlyCost, strategyUsed: 'B' });
    }
  }

  // Check for duplicate last names
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const r of records) {
    if (seen.has(r.staffKey)) {
      duplicates.push(r.staffKey);
    }
    seen.add(r.staffKey);
  }

  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate Last Names found in Compensation file: ${duplicates.join(', ')}. ` +
      "Cannot use Last Name as unique key."
    );
  }

  const avgRate = records.reduce((sum, r) => sum + r.hourlyCost, 0) / records.length;
  logs.push(`${records.length} staff members, avg $${avgRate.toFixed(2)}/hr`);

  return { data: records, logs };
}

function findColumnByName(headers: string[], candidates: string[]): string | null {
  for (const candidate of candidates) {
    const found = headers.find(h => h.toLowerCase() === candidate.toLowerCase());
    if (found) return found;
  }
  return null;
}

/**
 * Load Harvest Hours file
 */
export function loadHarvestHours(
  buffer: Buffer,
  month: string
): { data: HoursRecord[]; logs: string[] } {
  const logs: string[] = [];
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) {
    logs.push('Harvest Hours is empty');
    return { data: [], logs };
  }

  const headers = Object.keys(rows[0]);
  const dateCol = findColumnByName(headers, ['Date', 'Spent Date', 'Work Date']);
  const codeCol = findColumnByName(headers, ['Project Code', 'Project', 'Code']);
  const hoursCol = findColumnByName(headers, ['Hours', 'Hours (h)', 'Hours (decimal)']);
  const nameCol = findColumnByName(headers, ['Last Name', 'LastName', 'Person']);
  const projectCol = findColumnByName(headers, ['Project', 'Project Name', 'Client', 'Client Name']);

  if (!dateCol) throw new Error("Required column 'Date' not found in Harvest Hours");
  if (!codeCol) throw new Error("Required column 'Project Code' not found in Harvest Hours");
  if (!hoursCol) throw new Error("Required column 'Hours' not found in Harvest Hours");
  if (!nameCol) throw new Error("Required column 'Last Name' not found in Harvest Hours");

  const { start, end } = parseMonthRange(month);
  const records: HoursRecord[] = [];
  let outsideMonthCount = 0;

  for (const row of rows) {
    const dateVal = row[dateCol];
    let date: Date;

    if (dateVal instanceof Date) {
      date = dateVal;
    } else if (typeof dateVal === 'number') {
      // Excel serial date
      date = XLSX.SSF.parse_date_code(dateVal) as unknown as Date;
      date = new Date((date as any).y, (date as any).m - 1, (date as any).d);
    } else {
      date = new Date(String(dateVal));
    }

    if (isNaN(date.getTime())) continue;

    // Filter by month
    if (date < start || date > end) {
      outsideMonthCount++;
      continue;
    }

    try {
      const record: HoursRecord = {
        date,
        contractCode: normalizeContractCode(row[codeCol]),
        staffKey: String(row[nameCol] || '').trim(),
        hours: Number(row[hoursCol]) || 0,
      };

      if (projectCol && row[projectCol]) {
        record.projectName = String(row[projectCol]).trim();
      }

      records.push(record);
    } catch {
      // Skip rows with invalid contract codes
    }
  }

  if (outsideMonthCount > 0) {
    logs.push(`${outsideMonthCount} Harvest Hours rows outside month range (excluded)`);
  }

  const totalHours = records.reduce((sum, r) => sum + r.hours, 0);
  logs.push(`Harvest Hours: ${records.length} rows, ${totalHours.toFixed(1)} total hours`);

  return { data: records, logs };
}

/**
 * Load Harvest Expenses file
 */
export function loadHarvestExpenses(
  buffer: Buffer
): { data: ExpenseRecord[]; logs: string[] } {
  const logs: string[] = [];
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) {
    logs.push('Harvest Expenses is empty');
    return { data: [], logs };
  }

  const headers = Object.keys(rows[0]);
  const dateCol = findColumnByName(headers, ['Date', 'Spent Date', 'Expense Date']);
  const codeCol = findColumnByName(headers, ['Project Code', 'Project', 'Code']);
  const amountCol = findColumnByName(headers, ['Amount', 'Total Amount', 'Amount (USD)']);
  const billableCol = findColumnByName(headers, ['Billable', 'Is Billable', 'Billable?']);
  const notesCol = findColumnByName(headers, ['Notes', 'Description', 'Note', 'Memo']);

  if (!dateCol) throw new Error("Required column 'Date' not found in Harvest Expenses");
  if (!codeCol) throw new Error("Required column 'Project Code' not found in Harvest Expenses");
  if (!amountCol) throw new Error("Required column 'Amount' not found in Harvest Expenses");
  if (!billableCol) throw new Error("Required column 'Billable' not found in Harvest Expenses");

  const records: ExpenseRecord[] = [];
  let reimbursableCount = 0;
  let unknownBillableCount = 0;

  for (const row of rows) {
    const dateVal = row[dateCol];
    let date: Date;

    if (dateVal instanceof Date) {
      date = dateVal;
    } else if (typeof dateVal === 'number') {
      const parsed = XLSX.SSF.parse_date_code(dateVal) as unknown as any;
      date = new Date(parsed.y, parsed.m - 1, parsed.d);
    } else {
      date = new Date(String(dateVal));
    }

    if (isNaN(date.getTime())) continue;

    // Parse billable
    const billableVal = row[billableCol];
    let isBillable: boolean | null = null;

    if (billableVal !== null && billableVal !== undefined) {
      const s = String(billableVal).trim().toLowerCase();
      if (['yes', 'y', 'true', '1'].includes(s)) {
        isBillable = true;
      } else if (['no', 'n', 'false', '0'].includes(s)) {
        isBillable = false;
      }
    }

    // Filter: exclude reimbursable (billable=yes)
    if (isBillable === true) {
      reimbursableCount++;
      continue;
    }

    if (isBillable === null) {
      unknownBillableCount++;
    }

    try {
      records.push({
        date,
        contractCode: normalizeContractCode(row[codeCol]),
        amount: Number(row[amountCol]) || 0,
        notes: notesCol ? String(row[notesCol] || '').trim() : '',
        wasReimbursable: false,
      });
    } catch {
      // Skip rows with invalid contract codes
    }
  }

  if (unknownBillableCount > 0) {
    logs.push(`${unknownBillableCount} expenses have unknown Billable value (included as non-reimbursable)`);
  }
  if (reimbursableCount > 0) {
    logs.push(`Excluded ${reimbursableCount} reimbursable expenses (Billable=Yes)`);
  }

  return { data: records, logs };
}

/**
 * Load P&L file
 */
export function loadPnL(
  buffer: Buffer
): { data: PnLAccount[]; logs: string[] } {
  const logs: string[] = [];
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const sheetName = 'IncomeStatement';
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet '${sheetName}' not found in P&L workbook`);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (rows.length === 0) {
    throw new Error('P&L IncomeStatement sheet is empty');
  }

  // Find Total column
  const header = rows[0] as string[];
  let totalColIdx = header.findIndex(h => String(h || '').toLowerCase().includes('total'));
  if (totalColIdx === -1) {
    // Try last numeric column
    totalColIdx = header.length - 1;
  }

  const accounts: PnLAccount[] = [];
  const unmatched: string[] = [];
  const excluded: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const accountName = String(row[0] || '').trim();
    const amount = Number(row[totalColIdx]);

    if (!accountName || isNaN(amount) || amount === 0) continue;

    // Exclude income/subtotal lines
    if (shouldExcludePnLLine(accountName)) {
      excluded.push(accountName);
      continue;
    }

    const { bucket, matchedBy } = matchPnLAccount(accountName);

    if (bucket === 'SGA' && matchedBy === 'default') {
      unmatched.push(accountName);
    }

    accounts.push({
      accountName,
      amount,
      bucket,
      matchedBy,
    });
  }

  if (excluded.length > 0) {
    logs.push(`Excluded ${excluded.length} income/subtotal lines from overhead pools`);
  }
  if (unmatched.length > 0) {
    logs.push(`${unmatched.length} P&L accounts defaulted to SG&A (unmatched)`);
  }

  // Log bucket totals
  for (const bucket of ['DATA', 'WORKPLACE', 'NIL', 'SGA'] as const) {
    const bucketAccounts = accounts.filter(a => a.bucket === bucket);
    const bucketTotal = bucketAccounts.reduce((sum, a) => sum + a.amount, 0);
    logs.push(`${bucket}: $${bucketTotal.toLocaleString()} (${bucketAccounts.length} accounts)`);
  }

  return { data: accounts, logs };
}

function shouldExcludePnLLine(accountName: string): boolean {
  const lower = accountName.toLowerCase();

  // Exclude totals
  if (accountName.startsWith('Total - ') || accountName.startsWith('Total -')) {
    return true;
  }

  // Exclude income
  const incomeKeywords = [
    'sales', 'fixed fee', 'recurring revenue', 'other income',
    'interest income', 'dividend income',
  ];
  for (const keyword of incomeKeywords) {
    if (lower.includes(keyword)) return true;
  }

  if (lower === 'other') return true;

  // Exclude summary lines
  const summaryLines = [
    'gross profit', 'net income', 'net ordinary income', 'operating income',
    'total income', 'total expenses', 'total expense', 'total payroll',
    'total general', 'total administrative',
  ];
  for (const summary of summaryLines) {
    if (lower.includes(summary)) return true;
  }

  return false;
}

function matchPnLAccount(accountName: string): { bucket: 'DATA' | 'WORKPLACE' | 'NIL' | 'SGA'; matchedBy: string } {
  for (const rule of PNL_ACCOUNT_TAGS) {
    if (rule.matchType === 'exact') {
      if (accountName === rule.pattern) {
        return { bucket: rule.bucket, matchedBy: 'exact' };
      }
    } else if (rule.matchType === 'contains') {
      if (accountName.toLowerCase().includes(rule.pattern.toLowerCase())) {
        return { bucket: rule.bucket, matchedBy: 'contains' };
      }
    } else if (rule.matchType === 'regex') {
      if (new RegExp(rule.pattern, 'i').test(accountName)) {
        return { bucket: rule.bucket, matchedBy: 'regex' };
      }
    }
  }

  return { bucket: 'SGA', matchedBy: 'default' };
}
