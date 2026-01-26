/**
 * Overhead Allocation for Monthly Performance Analysis
 *
 * Allocates three overhead pools pro-rata by revenue:
 * 1. SG&A - All revenue centers
 * 2. Data Infrastructure - Data-tagged revenue centers only
 * 3. Workplace Well-being - Wellness-tagged revenue centers only
 */

import type {
  PnLAccount,
  CostCenter,
  RevenueCenter,
  OverheadPools,
} from './types';

const DEFAULT_TOLERANCE = 0.01;

/**
 * Calculate overhead pools from P&L and cost centers
 */
export function calculatePools(
  pnlAccounts: PnLAccount[],
  costCenters: CostCenter[],
  includeCC: boolean = true
): OverheadPools {
  // Sum P&L buckets
  const dataPnl = pnlAccounts
    .filter(a => a.bucket === 'DATA')
    .reduce((sum, a) => sum + a.amount, 0);

  const workplacePnl = pnlAccounts
    .filter(a => a.bucket === 'WORKPLACE')
    .reduce((sum, a) => sum + a.amount, 0);

  const sgaPnl = pnlAccounts
    .filter(a => a.bucket === 'SGA')
    .reduce((sum, a) => sum + a.amount, 0);

  const nilExcluded = pnlAccounts
    .filter(a => a.bucket === 'NIL')
    .reduce((sum, a) => sum + a.amount, 0);

  let dataPool = dataPnl;
  let sgaPool = sgaPnl;
  let dataFromCc = 0;
  let sgaFromCc = 0;

  // Add cost center overhead if enabled
  if (includeCC && costCenters.length > 0) {
    const dataCcCost = costCenters
      .filter(cc => cc.pool === 'DATA')
      .reduce((sum, cc) => sum + cc.totalCost, 0);

    const sgaCcCost = costCenters
      .filter(cc => cc.pool === 'SGA')
      .reduce((sum, cc) => sum + cc.totalCost, 0);

    dataPool += dataCcCost;
    sgaPool += sgaCcCost;
    dataFromCc = dataCcCost;
    sgaFromCc = sgaCcCost;
  }

  return {
    sgaPool,
    dataPool,
    workplacePool: workplacePnl,
    sgaFromPnl: sgaPnl,
    dataFromPnl: dataPnl,
    workplaceFromPnl: workplacePnl,
    nilExcluded,
    sgaFromCc,
    dataFromCc,
  };
}

/**
 * Allocate SG&A pool across all revenue centers pro-rata by revenue
 */
export function allocateSGA(
  revenueCenters: RevenueCenter[],
  sgaPool: number,
  tolerance: number = DEFAULT_TOLERANCE
): RevenueCenter[] {
  const totalRevenue = revenueCenters.reduce((sum, rc) => sum + rc.revenue, 0);

  if (totalRevenue <= 0) {
    return revenueCenters.map(rc => ({ ...rc, sgaAllocation: 0 }));
  }

  const result = revenueCenters.map(rc => ({
    ...rc,
    sgaAllocation: (rc.revenue / totalRevenue) * sgaPool,
  }));

  // Verify reconciliation
  const totalAllocated = result.reduce((sum, rc) => sum + rc.sgaAllocation, 0);
  if (Math.abs(totalAllocated - sgaPool) > tolerance) {
    throw new Error('SG&A allocation does not reconcile to pool within tolerance');
  }

  return result;
}

/**
 * Allocate Data Infrastructure pool to Data-tagged revenue centers only
 */
export function allocateData(
  revenueCenters: RevenueCenter[],
  dataPool: number,
  tolerance: number = DEFAULT_TOLERANCE
): RevenueCenter[] {
  const dataTagged = revenueCenters.filter(rc => rc.allocationTag === 'Data');
  const dataRevenue = dataTagged.reduce((sum, rc) => sum + rc.revenue, 0);

  if (dataRevenue <= 0) {
    return revenueCenters.map(rc => ({ ...rc, dataAllocation: 0 }));
  }

  const result = revenueCenters.map(rc => {
    if (rc.allocationTag === 'Data') {
      return {
        ...rc,
        dataAllocation: (rc.revenue / dataRevenue) * dataPool,
      };
    }
    return { ...rc, dataAllocation: 0 };
  });

  // Verify reconciliation
  const totalAllocated = result.reduce((sum, rc) => sum + rc.dataAllocation, 0);
  if (Math.abs(totalAllocated - dataPool) > tolerance) {
    throw new Error('Data allocation does not reconcile to pool within tolerance');
  }

  return result;
}

/**
 * Allocate Workplace Well-being pool to Wellness-tagged revenue centers only
 */
export function allocateWorkplace(
  revenueCenters: RevenueCenter[],
  workplacePool: number,
  tolerance: number = DEFAULT_TOLERANCE
): RevenueCenter[] {
  const wellnessTagged = revenueCenters.filter(rc => rc.allocationTag === 'Wellness');
  const wellnessRevenue = wellnessTagged.reduce((sum, rc) => sum + rc.revenue, 0);

  if (wellnessRevenue <= 0) {
    return revenueCenters.map(rc => ({ ...rc, workplaceAllocation: 0 }));
  }

  const result = revenueCenters.map(rc => {
    if (rc.allocationTag === 'Wellness') {
      return {
        ...rc,
        workplaceAllocation: (rc.revenue / wellnessRevenue) * workplacePool,
      };
    }
    return { ...rc, workplaceAllocation: 0 };
  });

  // Verify reconciliation
  const totalAllocated = result.reduce((sum, rc) => sum + rc.workplaceAllocation, 0);
  if (Math.abs(totalAllocated - workplacePool) > tolerance) {
    throw new Error('Workplace allocation does not reconcile to pool within tolerance');
  }

  return result;
}

/**
 * Calculate final margins
 */
export function calculateMargins(revenueCenters: RevenueCenter[]): RevenueCenter[] {
  return revenueCenters.map(rc => {
    const marginDollars =
      rc.revenue -
      rc.laborCost -
      rc.expenseCost -
      rc.sgaAllocation -
      rc.dataAllocation -
      rc.workplaceAllocation;

    const marginPercent = rc.revenue > 0 ? (marginDollars / rc.revenue) * 100 : 0;

    return {
      ...rc,
      marginDollars,
      marginPercent,
    };
  });
}

/**
 * Get revenue totals by allocation tag
 */
export function getTaggedRevenue(revenueCenters: RevenueCenter[]): {
  totalRevenue: number;
  dataTaggedRevenue: number;
  wellnessTaggedRevenue: number;
} {
  const totalRevenue = revenueCenters.reduce((sum, rc) => sum + rc.revenue, 0);
  const dataTaggedRevenue = revenueCenters
    .filter(rc => rc.allocationTag === 'Data')
    .reduce((sum, rc) => sum + rc.revenue, 0);
  const wellnessTaggedRevenue = revenueCenters
    .filter(rc => rc.allocationTag === 'Wellness')
    .reduce((sum, rc) => sum + rc.revenue, 0);

  return {
    totalRevenue,
    dataTaggedRevenue,
    wellnessTaggedRevenue,
  };
}
