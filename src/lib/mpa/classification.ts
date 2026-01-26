/**
 * Project Classification for Monthly Performance Analysis
 *
 * Classifies all activity into three mutually exclusive categories:
 * 1. Revenue Centers - In Pro Forma with revenue > 0
 * 2. Cost Centers - Listed in config or starts with 'THS-'
 * 3. Non-Revenue Clients - Has activity but not revenue or cost center
 */

import type {
  ProFormaProject,
  HoursRecord,
  ExpenseRecord,
  RevenueCenter,
  CostCenter,
  NonRevenueClient,
} from './types';
import { COST_CENTERS, getCostCenterCodes } from './config';

export interface ClassificationResult {
  revenueCenters: RevenueCenter[];
  costCenters: CostCenter[];
  nonRevenueClients: NonRevenueClient[];
}

/**
 * Classify a single project code
 */
export function classifyProject(
  projectCode: string,
  isRevenueCenter: boolean,
  costCenterCodes: Set<string>
): 'revenue_center' | 'cost_center' | 'non_revenue_client' {
  const isInConfig = costCenterCodes.has(projectCode);
  const isThsInternal = projectCode.startsWith('THS-') && !isRevenueCenter;
  const isCostCenter = isInConfig || isThsInternal;

  // Check for conflict: can't be both revenue and cost center (from config)
  if (isRevenueCenter && isInConfig) {
    throw new Error(
      `Classification conflict for '${projectCode}': Code appears as both ` +
      "Revenue Center (Pro Forma) and Cost Center (config). Please resolve."
    );
  }

  if (isRevenueCenter) {
    return 'revenue_center';
  } else if (isCostCenter) {
    return 'cost_center';
  } else {
    return 'non_revenue_client';
  }
}

/**
 * Classify all activity from all sources
 */
export function classifyAllActivity(
  proformaProjects: ProFormaProject[],
  hoursRecords: HoursRecord[],
  expenseRecords: ExpenseRecord[]
): ClassificationResult {
  const costCenterCodes = getCostCenterCodes();

  // Get all codes from different sources
  const revenueCodes = new Set(proformaProjects.map(p => p.contractCode));
  const hoursCodes = new Set(hoursRecords.map(h => h.contractCode));
  const expenseCodes = new Set(expenseRecords.map(e => e.contractCode));

  const activityCodes = new Set([...hoursCodes, ...expenseCodes]);
  const allCodes = new Set([...revenueCodes, ...activityCodes, ...costCenterCodes]);

  // Classify each code
  const classifications = new Map<string, 'revenue_center' | 'cost_center' | 'non_revenue_client'>();
  for (const code of allCodes) {
    classifications.set(code, classifyProject(code, revenueCodes.has(code), costCenterCodes));
  }

  // Build revenue centers from Pro Forma
  const revenueCenterCodes = new Set(
    [...classifications.entries()]
      .filter(([, cls]) => cls === 'revenue_center')
      .map(([code]) => code)
  );

  const revenueCenters: RevenueCenter[] = proformaProjects
    .filter(p => revenueCenterCodes.has(p.contractCode))
    .map(p => ({
      contractCode: p.contractCode,
      projectName: p.projectName,
      proformaSection: p.proformaSection,
      analysisCategory: p.analysisCategory,
      allocationTag: p.allocationTag,
      revenue: p.revenue,
      hours: 0,
      laborCost: 0,
      expenseCost: 0,
      sgaAllocation: 0,
      dataAllocation: 0,
      workplaceAllocation: 0,
      marginDollars: 0,
      marginPercent: 0,
    }));

  // Build cost centers from config + auto-classified THS codes
  const costCenterCls = [...classifications.entries()]
    .filter(([, cls]) => cls === 'cost_center')
    .map(([code]) => code);

  const costCenters: CostCenter[] = [];
  for (const code of costCenterCls) {
    const configEntry = COST_CENTERS.find(cc => cc.code === code);

    if (configEntry) {
      costCenters.push({
        contractCode: code,
        description: configEntry.description,
        pool: configEntry.pool,
        hours: 0,
        laborCost: 0,
        expenseCost: 0,
        totalCost: 0,
      });
    } else {
      // Auto-classified THS code - get project name from hours if available
      let projectName = code;
      const hoursWithName = hoursRecords.find(h => h.contractCode === code && h.projectName);
      if (hoursWithName?.projectName) {
        projectName = hoursWithName.projectName;
      }

      costCenters.push({
        contractCode: code,
        description: projectName,
        pool: 'SGA', // Default for auto-classified
        hours: 0,
        laborCost: 0,
        expenseCost: 0,
        totalCost: 0,
      });
    }
  }

  // Build non-revenue clients
  const nonRevCodes = [...classifications.entries()]
    .filter(([, cls]) => cls === 'non_revenue_client')
    .map(([code]) => code)
    .sort();

  const nonRevenueClients: NonRevenueClient[] = nonRevCodes.map(code => {
    let projectName = code;
    const hoursWithName = hoursRecords.find(h => h.contractCode === code && h.projectName);
    if (hoursWithName?.projectName) {
      projectName = hoursWithName.projectName;
    }

    return {
      contractCode: code,
      projectName,
      hours: 0,
      laborCost: 0,
      expenseCost: 0,
      totalCost: 0,
    };
  });

  return {
    revenueCenters,
    costCenters,
    nonRevenueClients,
  };
}
