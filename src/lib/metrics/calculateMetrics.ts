/**
 * Metric Calculation Functions
 * Processes uploaded XLSX data into scorecard metric values
 */

import * as XLSX from 'xlsx';

export interface CalculatedMetric {
  metricId: string;
  value: number;
  calculatedAt: string;
  sourceUploadId: string;
  details?: Record<string, unknown>;
}

export interface MetricCalculationResult {
  success: boolean;
  metrics: CalculatedMetric[];
  errors: string[];
}

/**
 * Calculate metrics from an uploaded file based on upload type
 */
export async function calculateMetricsFromUpload(
  uploadType: string,
  fileBuffer: ArrayBuffer,
  uploadId: string
): Promise<MetricCalculationResult> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

    const calculators: Record<string, (data: Record<string, unknown>[]) => CalculatedMetric[]> = {
      excel_harvest: calculateHarvestMetrics,
      excel_training: calculateTrainingMetrics,
      excel_staffing: calculateStaffingMetrics,
      excel_ar: calculateARMetrics,
      excel_ap: calculateAPMetrics,
      excel_month_close: calculateMonthCloseMetrics,
      excel_cash: calculateCashMetrics,
      excel_pipeline: calculatePipelineMetrics,
      excel_delivery: calculateDeliveryMetrics,
      excel_client_satisfaction: calculateSatisfactionMetrics,
      excel_starset: calculateStarsetMetrics,
      excel_hmrf: calculateHMRFMetrics,
      excel_strategic: calculateStrategicMetrics,
      notion_pipeline: calculateNotionPipelineMetrics,
    };

    const calculator = calculators[uploadType];
    if (!calculator) {
      return {
        success: false,
        metrics: [],
        errors: [`No calculator found for upload type: ${uploadType}`],
      };
    }

    const metrics = calculator(data).map((m) => ({
      ...m,
      calculatedAt: new Date().toISOString(),
      sourceUploadId: uploadId,
    }));

    return {
      success: true,
      metrics,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      metrics: [],
      errors: [error instanceof Error ? error.message : 'Unknown calculation error'],
    };
  }
}

/**
 * Harvest Compliance: % of staff with complete time entries
 * Expected columns: employee_name, status (complete/incomplete)
 */
function calculateHarvestMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const total = data.length;
  if (total === 0) return [];

  const complete = data.filter(
    (row) => String(row.status || row.Status || '').toLowerCase() === 'complete'
  ).length;

  const rate = Math.round((complete / total) * 100);

  return [
    {
      metricId: 'harvestRate',
      value: rate,
      sourceUploadId: '',
      calculatedAt: '',
      details: { complete, total },
    },
  ];
}

/**
 * Training Completion: % of staff with completed training
 * Expected columns: employee_name, training_complete (yes/no or true/false)
 */
function calculateTrainingMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const total = data.length;
  if (total === 0) return [];

  const complete = data.filter((row) => {
    const val = String(row.training_complete || row.complete || row.status || '').toLowerCase();
    return val === 'yes' || val === 'true' || val === 'complete' || val === '1';
  }).length;

  const rate = Math.round((complete / total) * 100);

  return [
    {
      metricId: 'trainingRate',
      value: rate,
      sourceUploadId: '',
      calculatedAt: '',
      details: { complete, total },
    },
  ];
}

/**
 * Staffing & Utilization
 * Expected columns: employee_name, billable_hours, available_hours, position_status (filled/open)
 */
function calculateStaffingMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // Calculate utilization from hours
  const employeeRows = data.filter(
    (row) => row.billable_hours !== undefined && row.available_hours !== undefined
  );

  if (employeeRows.length > 0) {
    const totalBillable = employeeRows.reduce(
      (sum, row) => sum + Number(row.billable_hours || 0),
      0
    );
    const totalAvailable = employeeRows.reduce(
      (sum, row) => sum + Number(row.available_hours || 0),
      0
    );
    const utilization = totalAvailable > 0 ? Math.round((totalBillable / totalAvailable) * 100) : 0;

    metrics.push({
      metricId: 'utilization',
      value: utilization,
      sourceUploadId: '',
      calculatedAt: '',
      details: { totalBillable, totalAvailable },
    });
  }

  // Count open positions
  const openPositions = data.filter((row) => {
    const status = String(row.position_status || row.status || '').toLowerCase();
    return status === 'open' || status === 'unfilled' || status === 'vacant';
  }).length;

  metrics.push({
    metricId: 'openPositions',
    value: openPositions,
    sourceUploadId: '',
    calculatedAt: '',
  });

  return metrics;
}

/**
 * Accounts Receivable
 * Expected columns: invoice_id, amount, age_days (or invoice_date)
 */
function calculateARMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // AR > 90 days
  const over90 = data.filter((row) => {
    const age = Number(row.age_days || row.age || 0);
    return age > 90;
  });
  const arAging = over90.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  metrics.push({
    metricId: 'arAging',
    value: Math.round(arAging),
    sourceUploadId: '',
    calculatedAt: '',
    details: { invoiceCount: over90.length },
  });

  // DSO calculation: (Total AR / Total Revenue) * Days
  // Simplified: average age of all invoices
  if (data.length > 0) {
    const totalAge = data.reduce((sum, row) => sum + Number(row.age_days || row.age || 0), 0);
    const dso = Math.round(totalAge / data.length);

    metrics.push({
      metricId: 'dso',
      value: dso,
      sourceUploadId: '',
      calculatedAt: '',
    });
  }

  return metrics;
}

/**
 * Accounts Payable
 * Expected columns: invoice_id, amount, status (current/overdue), age_days
 */
function calculateAPMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const total = data.length;
  if (total === 0) return [];

  const current = data.filter((row) => {
    const status = String(row.status || '').toLowerCase();
    // Check status first
    if (status === 'current' || status === 'paid') return true;
    if (status === 'overdue' || status === 'past_due' || status === 'late') return false;
    // Fall back to age check only if no status
    const age = row.age_days !== undefined || row.age !== undefined
      ? Number(row.age_days || row.age)
      : null;
    return age !== null && age <= 30;
  }).length;

  const rate = Math.round((current / total) * 100);

  return [
    {
      metricId: 'apAging',
      value: rate,
      sourceUploadId: '',
      calculatedAt: '',
      details: { current, total },
    },
  ];
}

/**
 * Month-End Close
 * Expected columns: task_name, status (complete/pending/in_progress)
 */
function calculateMonthCloseMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const total = data.length;
  if (total === 0) return [];

  const complete = data.filter((row) => {
    const status = String(row.status || '').toLowerCase();
    return status === 'complete' || status === 'completed' || status === 'done';
  }).length;

  const rate = Math.round((complete / total) * 100);

  return [
    {
      metricId: 'closeStatus',
      value: rate,
      sourceUploadId: '',
      calculatedAt: '',
      details: { complete, total },
    },
  ];
}

/**
 * Cash Position
 * Expected columns: account_name, balance, or single row with cash_position, monthly_burn
 */
function calculateCashMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // Check for summary row format
  const summaryRow = data.find((row) => row.cash_position !== undefined || row.total_cash !== undefined);

  if (summaryRow) {
    const cashPosition = Number(summaryRow.cash_position || summaryRow.total_cash || 0);
    const monthlyBurn = Number(summaryRow.monthly_burn || summaryRow.burn_rate || 0);

    metrics.push({
      metricId: 'cashPosition',
      value: Math.round(cashPosition),
      sourceUploadId: '',
      calculatedAt: '',
    });

    if (monthlyBurn > 0) {
      const runway = Math.round(cashPosition / monthlyBurn);
      metrics.push({
        metricId: 'runway',
        value: runway,
        sourceUploadId: '',
        calculatedAt: '',
      });
    }
  } else {
    // Sum all account balances
    const totalCash = data.reduce((sum, row) => sum + Number(row.balance || row.amount || 0), 0);
    metrics.push({
      metricId: 'cashPosition',
      value: Math.round(totalCash),
      sourceUploadId: '',
      calculatedAt: '',
    });
  }

  return metrics;
}

/**
 * BD Pipeline
 * Expected columns: opportunity_name, value, stage, status (won/lost/open)
 */
function calculatePipelineMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // Pipeline value (all open opportunities)
  const openOpps = data.filter((row) => {
    const status = String(row.status || '').toLowerCase();
    return status === 'open' || status === 'active' || status === 'qualified';
  });
  const pipelineValue = openOpps.reduce((sum, row) => sum + Number(row.value || row.amount || 0), 0);

  metrics.push({
    metricId: 'pipelineValue',
    value: Math.round(pipelineValue),
    sourceUploadId: '',
    calculatedAt: '',
  });

  // Qualified opportunities count
  const qualified = data.filter((row) => {
    const stage = String(row.stage || '').toLowerCase();
    return stage === 'qualified' || stage === 'proposal' || stage === 'negotiation';
  }).length;

  metrics.push({
    metricId: 'qualifiedOpps',
    value: qualified,
    sourceUploadId: '',
    calculatedAt: '',
  });

  // Win rate
  const closedOpps = data.filter((row) => {
    const status = String(row.status || '').toLowerCase();
    return status === 'won' || status === 'lost' || status === 'closed';
  });

  if (closedOpps.length > 0) {
    const won = closedOpps.filter((row) => String(row.status || '').toLowerCase() === 'won').length;
    const winRate = Math.round((won / closedOpps.length) * 100);

    metrics.push({
      metricId: 'winRate',
      value: winRate,
      sourceUploadId: '',
      calculatedAt: '',
    });

    // Average deal size (won deals only)
    const wonDeals = closedOpps.filter((row) => String(row.status || '').toLowerCase() === 'won');
    if (wonDeals.length > 0) {
      const totalValue = wonDeals.reduce((sum, row) => sum + Number(row.value || row.amount || 0), 0);
      const avgDealSize = Math.round(totalValue / wonDeals.length);

      metrics.push({
        metricId: 'avgDealSize',
        value: avgDealSize,
        sourceUploadId: '',
        calculatedAt: '',
      });
    }
  }

  return metrics;
}

/**
 * Delivery Tracking
 * Expected columns: project_name, milestone, due_date, actual_date, status
 */
function calculateDeliveryMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // On-time delivery rate
  const completedMilestones = data.filter((row) => {
    const status = String(row.status || '').toLowerCase();
    return status === 'complete' || status === 'delivered';
  });

  if (completedMilestones.length > 0) {
    const onTime = completedMilestones.filter((row) => {
      const onTimeFlag = String(row.on_time || row.ontime || '').toLowerCase();
      if (onTimeFlag === 'yes' || onTimeFlag === 'true') return true;

      // Calculate from dates if available
      const dueDate = row.due_date ? new Date(String(row.due_date)) : null;
      const actualDate = row.actual_date ? new Date(String(row.actual_date)) : null;
      if (dueDate && actualDate) {
        return actualDate <= dueDate;
      }
      return true; // Assume on-time if no date data
    }).length;

    const rate = Math.round((onTime / completedMilestones.length) * 100);
    metrics.push({
      metricId: 'onTimeDelivery',
      value: rate,
      sourceUploadId: '',
      calculatedAt: '',
      details: { onTime, total: completedMilestones.length },
    });
  }

  // Active projects count (unique project names with incomplete milestones)
  const activeProjects = new Set(
    data
      .filter((row) => {
        const status = String(row.status || '').toLowerCase();
        return status !== 'complete' && status !== 'delivered' && status !== 'cancelled';
      })
      .map((row) => row.project_name || row.project)
  ).size;

  metrics.push({
    metricId: 'activeProjects',
    value: activeProjects,
    sourceUploadId: '',
    calculatedAt: '',
  });

  return metrics;
}

/**
 * Client Satisfaction
 * Expected columns: client_name, csat_score (1-10), nps_score (-100 to 100), or promoter/detractor/passive
 */
function calculateSatisfactionMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // CSAT (average of scores)
  const csatScores = data
    .filter((row) => row.csat_score !== undefined || row.csat !== undefined)
    .map((row) => Number(row.csat_score || row.csat || 0));

  if (csatScores.length > 0) {
    const avgCsat = csatScores.reduce((sum, score) => sum + score, 0) / csatScores.length;
    metrics.push({
      metricId: 'csat',
      value: Math.round(avgCsat * 10) / 10, // One decimal place
      sourceUploadId: '',
      calculatedAt: '',
      details: { responses: csatScores.length },
    });
  }

  // NPS calculation
  // If nps_score provided directly, average them
  const npsScores = data.filter((row) => row.nps_score !== undefined || row.nps !== undefined);

  if (npsScores.length > 0) {
    const avgNps = npsScores.reduce((sum, row) => sum + Number(row.nps_score || row.nps || 0), 0) / npsScores.length;
    metrics.push({
      metricId: 'nps',
      value: Math.round(avgNps),
      sourceUploadId: '',
      calculatedAt: '',
    });
  } else {
    // Calculate from promoter/detractor categories
    const categorized = data.filter((row) => row.nps_category !== undefined || row.category !== undefined);
    if (categorized.length > 0) {
      const promoters = categorized.filter((row) => {
        const cat = String(row.nps_category || row.category || '').toLowerCase();
        return cat === 'promoter';
      }).length;
      const detractors = categorized.filter((row) => {
        const cat = String(row.nps_category || row.category || '').toLowerCase();
        return cat === 'detractor';
      }).length;

      const nps = Math.round(((promoters - detractors) / categorized.length) * 100);
      metrics.push({
        metricId: 'nps',
        value: nps,
        sourceUploadId: '',
        calculatedAt: '',
        details: { promoters, detractors, total: categorized.length },
      });
    }
  }

  return metrics;
}

/**
 * Starset Analytics
 * Expected columns: user_id, last_active, data_quality_score
 */
function calculateStarsetMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // Active users (unique users active in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = data.filter((row) => {
    if (row.last_active) {
      const lastActive = new Date(String(row.last_active));
      return lastActive >= thirtyDaysAgo;
    }
    // If no date, assume active if in the list
    return true;
  }).length;

  metrics.push({
    metricId: 'starsetUsers',
    value: activeUsers,
    sourceUploadId: '',
    calculatedAt: '',
  });

  // Data quality score (average)
  const qualityScores = data
    .filter((row) => row.data_quality_score !== undefined || row.quality_score !== undefined)
    .map((row) => Number(row.data_quality_score || row.quality_score || 0));

  if (qualityScores.length > 0) {
    const avgQuality = Math.round(
      qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    );
    metrics.push({
      metricId: 'dataQuality',
      value: avgQuality,
      sourceUploadId: '',
      calculatedAt: '',
    });
  }

  return metrics;
}

/**
 * HMRF Database
 * Expected columns: hospital_name, mrf_status (covered/pending/missing), record_count
 */
function calculateHMRFMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  // Total records
  const totalRecords = data.reduce((sum, row) => sum + Number(row.record_count || row.records || 1), 0);
  metrics.push({
    metricId: 'hmrfRecords',
    value: totalRecords,
    sourceUploadId: '',
    calculatedAt: '',
  });

  // Coverage percentage
  const totalHospitals = data.length;
  if (totalHospitals > 0) {
    const covered = data.filter((row) => {
      const status = String(row.mrf_status || row.status || '').toLowerCase();
      return status === 'covered' || status === 'complete' || status === 'active';
    }).length;

    const coverage = Math.round((covered / totalHospitals) * 100);
    metrics.push({
      metricId: 'hmrfCoverage',
      value: coverage,
      sourceUploadId: '',
      calculatedAt: '',
      details: { covered, total: totalHospitals },
    });
  }

  return metrics;
}

/**
 * Strategic Initiatives
 * Expected columns: initiative_name, status (on_track/at_risk/off_track), milestone_achieved
 */
function calculateStrategicMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  const metrics: CalculatedMetric[] = [];

  const totalInitiatives = data.length;
  if (totalInitiatives > 0) {
    // Initiatives on track
    const onTrack = data.filter((row) => {
      const status = String(row.status || '').toLowerCase();
      return status === 'on_track' || status === 'on track' || status === 'green';
    }).length;

    const rate = Math.round((onTrack / totalInitiatives) * 100);
    metrics.push({
      metricId: 'initiativesOnTrack',
      value: rate,
      sourceUploadId: '',
      calculatedAt: '',
      details: { onTrack, total: totalInitiatives },
    });
  }

  // Key milestones achieved
  const milestones = data.filter((row) => {
    const achieved = row.milestone_achieved || row.milestone;
    return achieved === true || String(achieved).toLowerCase() === 'yes';
  }).length;

  metrics.push({
    metricId: 'keyMilestones',
    value: milestones,
    sourceUploadId: '',
    calculatedAt: '',
  });

  return metrics;
}

/**
 * Notion Pipeline Export
 * Expected columns: prospect_name, qual_level (Near Close/High/Medium/Low/Qualified/Pre-Qualified/Not Qualified), projected_amount
 * Calculates: Total Projected Amount, Probability-Weighted Pipeline Value
 */
function calculateNotionPipelineMetrics(data: Record<string, unknown>[]): CalculatedMetric[] {
  // Probability mapping based on David's Notion pipeline qualification levels
  const PROBABILITY_MAP: Record<string, number> = {
    'near close': 0.95,
    'near_close': 0.95,
    'high': 0.80,
    'medium': 0.40,
    'qualified': 0.40,
    'low': 0.15,
    'pre-qualified': 0.15,
    'pre_qualified': 0.15,
    'prequalified': 0.15,
    'not qualified': 0,
    'not_qualified': 0,
    'unqualified': 0,
  };

  let totalProjected = 0;
  let totalWeighted = 0;
  let opportunityCount = 0;

  for (const row of data) {
    // Try multiple column names for amount
    const amount = Number(
      row.projected_amount ||
      row['Projected Amount'] ||
      row.amount ||
      row.value ||
      row['Deal Value'] ||
      row['Contract Value'] ||
      0
    );

    // Try multiple column names for qualification level
    const levelRaw = String(
      row.qual_level ||
      row['Qual Level'] ||
      row.probability ||
      row.stage ||
      row.status ||
      row['Qualification Level'] ||
      ''
    ).toLowerCase().trim();

    // Look up probability, default to 15% if unknown
    const probability = PROBABILITY_MAP[levelRaw] ?? 0.15;

    if (amount > 0) {
      totalProjected += amount;
      totalWeighted += amount * probability;
      opportunityCount++;
    }
  }

  return [
    {
      metricId: 'pipeline_total_projected',
      value: Math.round(totalProjected),
      sourceUploadId: '',
      calculatedAt: '',
      details: { opportunityCount },
    },
    {
      metricId: 'pipeline_weighted',
      value: Math.round(totalWeighted),
      sourceUploadId: '',
      calculatedAt: '',
      details: { opportunityCount, avgProbability: opportunityCount > 0 ? totalWeighted / totalProjected : 0 },
    },
    // Also update the legacy pipelineValue metric for backwards compatibility
    {
      metricId: 'pipelineValue',
      value: Math.round(totalWeighted),
      sourceUploadId: '',
      calculatedAt: '',
    },
  ];
}
