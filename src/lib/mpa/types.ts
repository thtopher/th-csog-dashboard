/**
 * MPA Types
 *
 * TypeScript types for Monthly Performance Analysis processing
 */

export interface ProFormaProject {
  contractCode: string;
  projectName: string;
  proformaSection: string | null;
  analysisCategory: string;
  allocationTag: string; // 'Data' | 'Wellness' | ''
  revenue: number;
}

export interface CompensationRecord {
  staffKey: string;
  hourlyCost: number;
  strategyUsed: 'A' | 'B';
}

export interface HoursRecord {
  date: Date;
  contractCode: string;
  staffKey: string;
  hours: number;
  projectName?: string;
}

export interface ExpenseRecord {
  date: Date;
  contractCode: string;
  amount: number;
  notes: string;
  wasReimbursable: boolean;
}

export interface PnLAccount {
  accountName: string;
  amount: number;
  bucket: 'DATA' | 'WORKPLACE' | 'NIL' | 'SGA';
  matchedBy: string;
}

export interface RevenueCenter {
  contractCode: string;
  projectName: string | null;
  proformaSection: string | null;
  analysisCategory: string;
  allocationTag: string;
  revenue: number;
  hours: number;
  laborCost: number;
  expenseCost: number;
  sgaAllocation: number;
  dataAllocation: number;
  workplaceAllocation: number;
  marginDollars: number;
  marginPercent: number;
}

export interface CostCenter {
  contractCode: string;
  description: string | null;
  pool: string;
  hours: number;
  laborCost: number;
  expenseCost: number;
  totalCost: number;
}

export interface NonRevenueClient {
  contractCode: string;
  projectName: string | null;
  hours: number;
  laborCost: number;
  expenseCost: number;
  totalCost: number;
}

export interface HoursDetail {
  contractCode: string;
  staffKey: string;
  hours: number;
  hourlyCost: number;
  laborCost: number;
}

export interface ExpenseDetail {
  contractCode: string;
  expenseDate: Date;
  amount: number;
  notes: string;
}

export interface OverheadPools {
  sgaPool: number;
  dataPool: number;
  workplacePool: number;
  sgaFromPnl: number;
  dataFromPnl: number;
  workplaceFromPnl: number;
  nilExcluded: number;
  sgaFromCc: number;
  dataFromCc: number;
}

export interface ValidationItem {
  type: 'pass' | 'warn' | 'fail';
  message: string;
}

export interface AnalysisSummary {
  totalRevenue: number;
  totalLaborCost: number;
  totalExpenseCost: number;
  totalMarginDollars: number;
  overallMarginPercent: number;
  sgaPool: number;
  dataPool: number;
  workplacePool: number;
  revenueCenterCount: number;
  costCenterCount: number;
  nonRevenueClientCount: number;
}
