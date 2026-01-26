import { NextResponse } from 'next/server';
import type { ExecutiveOverviewResponse, ExecutiveSummary, CEOScorecardWithAudit, HealthStatus, ProcessSummary, AuditMetadata } from '@/types';
import { DEFAULT_EXECUTIVES } from '@/config/executives';
import { createClient } from '@supabase/supabase-js';
import { UPLOAD_TYPES } from '@/config/uploadTypes';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map of executive IDs to their key metrics and thresholds
const EXECUTIVE_METRICS: Record<string, { metricId: string; greenThreshold: number; amberThreshold: number; higherIsBetter: boolean }[]> = {
  'exec-ceo': [
    { metricId: 'initiativesOnTrack', greenThreshold: 80, amberThreshold: 60, higherIsBetter: true },
  ],
  'exec-president': [
    { metricId: 'cashPosition', greenThreshold: 500000, amberThreshold: 300000, higherIsBetter: true },
  ],
  'exec-coo': [
    { metricId: 'harvestRate', greenThreshold: 95, amberThreshold: 85, higherIsBetter: true },
    { metricId: 'utilization', greenThreshold: 75, amberThreshold: 65, higherIsBetter: true },
  ],
  'exec-cfo': [
    { metricId: 'arAging', greenThreshold: 50000, amberThreshold: 100000, higherIsBetter: false },
    { metricId: 'closeStatus', greenThreshold: 100, amberThreshold: 75, higherIsBetter: true },
  ],
  'exec-cdao': [
    { metricId: 'hmrfCoverage', greenThreshold: 90, amberThreshold: 70, higherIsBetter: true },
  ],
  'exec-cgo': [
    { metricId: 'winRate', greenThreshold: 40, amberThreshold: 30, higherIsBetter: true },
    { metricId: 'pipelineValue', greenThreshold: 500000, amberThreshold: 300000, higherIsBetter: true },
  ],
  'exec-cso': [
    { metricId: 'onTimeDelivery', greenThreshold: 95, amberThreshold: 85, higherIsBetter: true },
    { metricId: 'csat', greenThreshold: 9, amberThreshold: 7, higherIsBetter: true },
  ],
};

/**
 * Calculate executive status based on upload compliance and metric values
 */
async function calculateExecutiveStatus(
  executiveId: string,
  metrics: Record<string, MetricInfo>,
  uploadedTypes: Set<string>
): Promise<HealthStatus> {
  // Get required upload types for this executive
  const requiredTypes = UPLOAD_TYPES.filter(t => t.allowedExecutives.includes(executiveId));
  const uploadedCount = requiredTypes.filter(t => uploadedTypes.has(t.id)).length;
  const uploadComplianceRate = requiredTypes.length > 0 ? uploadedCount / requiredTypes.length : 1;

  // Check metric thresholds
  const execMetrics = EXECUTIVE_METRICS[executiveId] || [];
  let hasRedMetric = false;
  let hasAmberMetric = false;

  for (const config of execMetrics) {
    const value = metrics[config.metricId]?.value;
    if (value === undefined) {
      // Missing data counts as amber
      hasAmberMetric = true;
      continue;
    }

    if (config.higherIsBetter) {
      if (value < config.amberThreshold) hasRedMetric = true;
      else if (value < config.greenThreshold) hasAmberMetric = true;
    } else {
      if (value > config.amberThreshold) hasRedMetric = true;
      else if (value > config.greenThreshold) hasAmberMetric = true;
    }
  }

  // Determine overall status
  if (hasRedMetric || uploadComplianceRate < 0.5) {
    return 'critical';
  }
  if (hasAmberMetric || uploadComplianceRate < 1) {
    return 'warning';
  }
  return 'healthy';
}

/**
 * Fetch which upload types each executive has completed
 */
async function fetchUploadsByExecutive(): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>();

  try {
    const { data, error } = await supabase
      .from('upload_history')
      .select('executive_id, upload_type')
      .eq('status', 'completed');

    if (!error && data) {
      for (const row of data) {
        if (row.executive_id && row.upload_type) {
          if (!result.has(row.executive_id)) {
            result.set(row.executive_id, new Set());
          }
          result.get(row.executive_id)!.add(row.upload_type);
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch uploads by executive:', err);
  }

  return result;
}

/**
 * GET /api/executives
 *
 * Returns all executives with their processes, functions, and the CEO Scorecard.
 * This is the primary endpoint for the executive-centric dashboard view.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodType = searchParams.get('periodType') || 'week';

  // Fetch real data for status calculation
  const [metrics, uploadsByExec] = await Promise.all([
    fetchLatestMetrics(),
    fetchUploadsByExecutive(),
  ]);

  // Simulate process and function data for each executive
  const executiveProcesses: Record<string, { processes: ProcessSummary[]; functions: ProcessSummary[] }> = {
    'exec-ceo': {
      processes: [],
      functions: [
        createProcessSummary('F-EOC', 'Executive Operating Cadence', 'function', 'healthy', 10),
        createProcessSummary('F-CAI', 'Capital Allocation & Investment', 'function', 'healthy', 10),
        createProcessSummary('F-QAD', 'Quality Assurance & Delivery', 'function', 'healthy', 10),
        createProcessSummary('F-PEM', 'Partnership & Ecosystem', 'function', 'healthy', 10),
        createProcessSummary('F-SP', 'Strategic Planning', 'function', 'warning', 10),
        createProcessSummary('F-CRC', 'Client Executive Relationships', 'function', 'healthy', 10),
        createProcessSummary('F-CPE', 'Community & Political Engagement', 'function', 'healthy', 10),
      ],
    },
    'exec-president': {
      processes: [
        createProcessSummary('CF', 'Cash Flow Management', 'process', 'healthy', 8),
        createProcessSummary('CR', 'Compensation & Role Changes', 'process', 'healthy', 10),
        createProcessSummary('TP', 'Tax Preparation & Filing', 'process', 'healthy', 12),
        createProcessSummary('EM', 'Expense Management', 'process', 'healthy', 8),
        createProcessSummary('PA', 'Procurement & Vendor Approval', 'process', 'healthy', 8),
        createProcessSummary('VM', 'Contractor/Vendor Management', 'process', 'healthy', 10),
      ],
      functions: [
        createProcessSummary('F-IP', 'Intellectual Property Governance', 'function', 'healthy', 7),
        createProcessSummary('F-OC', 'Organizational Chart Management', 'function', 'healthy', 5),
        createProcessSummary('F-ER', 'Enterprise Risk Management', 'function', 'warning', 7),
        createProcessSummary('F-KM', 'Knowledge Management', 'function', 'healthy', 7),
      ],
    },
    'exec-coo': {
      processes: [
        createProcessSummary('OC', 'Operationalizing Client Contracts', 'process', 'healthy', 5),
        createProcessSummary('WD', 'Website Development', 'process', 'healthy', 5),
        createProcessSummary('TM', 'Template Management', 'process', 'healthy', 5),
        createProcessSummary('ST', 'Staffing', 'process', 'warning', 8),
        createProcessSummary('EO', 'Employee Onboarding', 'process', 'healthy', 10),
        createProcessSummary('ES', 'Employee Separation - Voluntary', 'process', 'healthy', 8),
        createProcessSummary('ET', 'Employee Separation - Involuntary', 'process', 'healthy', 6),
        createProcessSummary('PM', 'Performance Management', 'process', 'healthy', 8),
        createProcessSummary('TC', 'Training & Compliance', 'process', 'warning', 6),
      ],
      functions: [
        createProcessSummary('F-BOM', 'Board of Managers Facilitation', 'function', 'healthy', 5),
        createProcessSummary('F-BI', 'Business Insurance', 'function', 'healthy', 4),
        createProcessSummary('F-BA', 'Benefits Administration', 'function', 'healthy', 5),
        createProcessSummary('F-EH', 'Employee Handbook', 'function', 'healthy', 4),
        createProcessSummary('F-TLG', 'Thought Leadership Governance', 'function', 'healthy', 5),
      ],
    },
    'exec-cfo': {
      processes: [
        createProcessSummary('AR', 'Accounts Receivable', 'process', 'warning', 6),
        createProcessSummary('AP', 'Accounts Payable', 'process', 'healthy', 6),
        createProcessSummary('MC', 'Month-End Close', 'process', 'healthy', 8),
        createProcessSummary('FR', 'Financial Reporting', 'process', 'healthy', 6),
        createProcessSummary('IM', 'Inventory Management', 'process', 'healthy', 5),
        createProcessSummary('SM', 'SaaS Subscription Management', 'process', 'healthy', 5),
      ],
      functions: [],
    },
    'exec-cdao': {
      processes: [
        createProcessSummary('SA', 'Starset Analytics', 'process', 'healthy', 8),
        createProcessSummary('HMRF', 'Hospital MRF Database', 'process', 'healthy', 6),
        createProcessSummary('DDD', 'Data-Driven Deliverables', 'process', 'healthy', 5),
        createProcessSummary('IAM', 'Identity & Access Management', 'process', 'healthy', 6),
      ],
      functions: [
        createProcessSummary('F-IT', 'Information Technology', 'function', 'healthy', 8),
      ],
    },
    'exec-cgo': {
      processes: [
        createProcessSummary('BD', 'Business Development', 'process', 'healthy', 9),
        createProcessSummary('TL', 'Thought Leadership', 'process', 'healthy', 6),
        createProcessSummary('MKT', 'Marketing Collateral', 'process', 'healthy', 5),
      ],
      functions: [],
    },
    'exec-cso': {
      processes: [
        createProcessSummary('SD', 'Service Delivery', 'process', 'warning', 7),
        createProcessSummary('CP', 'Contract Performance', 'process', 'healthy', 6),
        createProcessSummary('CC', 'Contract Closure', 'process', 'healthy', 5),
        createProcessSummary('CiS', 'Change in Scope', 'process', 'healthy', 5),
        createProcessSummary('CA', 'Corrective Action', 'process', 'healthy', 5),
        createProcessSummary('CFP', 'Client-Facing Publications', 'process', 'healthy', 4),
      ],
      functions: [
        createProcessSummary('F-CDH', 'Client Confidentiality & Data Handling', 'function', 'healthy', 6),
      ],
    },
  };

  // Build executive summaries with calculated status based on real data
  const executives: ExecutiveSummary[] = await Promise.all(
    DEFAULT_EXECUTIVES.map(async (exec) => {
      const execId = exec.id!;
      const procData = executiveProcesses[execId] || { processes: [], functions: [] };

      // Calculate overall status based on upload compliance and metric thresholds
      const execUploads = uploadsByExec.get(execId) || new Set<string>();
      const overallStatus = await calculateExecutiveStatus(execId, metrics, execUploads);

      return {
        id: execId,
        name: exec.name!,
        title: exec.title!,
        role: exec.role!,
        email: exec.email,
        displayOrder: exec.displayOrder!,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        processes: procData.processes,
        functions: procData.functions,
        overallStatus,
        processCount: procData.processes.length,
        functionCount: procData.functions.length,
        taskCount: procData.processes.reduce((sum, p) => sum + (p.taskCount || 0), 0) +
                   procData.functions.reduce((sum, f) => sum + (f.taskCount || 0), 0),
      };
    })
  );

  // Build CEO Scorecard per F-EOC6 requirements
  const ceoScorecard = await generateCEOScorecard(periodType);

  const response: ExecutiveOverviewResponse = {
    executives,
    ceoScorecard,
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

/**
 * Helper to create a process/function summary
 */
function createProcessSummary(
  code: string,
  name: string,
  type: 'process' | 'function',
  status: HealthStatus,
  taskCount: number
): ProcessSummary {
  return {
    id: `p-${code.toLowerCase()}`,
    domainId: 'd1',
    name,
    code,
    processTag: code.toLowerCase().replace('-', '_'),
    processType: type,
    sopStatus: 'documented',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    kpis: [],
    activeGapsCount: status === 'warning' ? 1 : status === 'critical' ? 2 : 0,
    overallStatus: status,
    taskCount,
  } as ProcessSummary & { overallStatus: HealthStatus; taskCount: number };
}

/**
 * Generate CEO Scorecard data per F-EOC6 requirements
 * Shows: Pipeline, Delivery, Margin, Cash, Staffing, Strategic Initiatives
 * Fetches real data from calculated_metrics table, shows null for missing data
 */
async function generateCEOScorecard(periodType: string): Promise<CEOScorecardWithAudit> {
  const now = new Date().toISOString();

  // Fetch all latest metrics from database
  const metrics = await fetchLatestMetrics();

  // Helper to get metric value or undefined
  const getMetric = (metricId: string): number | undefined => {
    return metrics[metricId]?.value;
  };

  // Helper to determine status based on value and thresholds
  const getStatus = (
    value: number | undefined,
    thresholds: { green: number; amber: number },
    higherIsBetter: boolean = true
  ): HealthStatus => {
    if (value === undefined) return 'warning'; // No data = warning
    if (higherIsBetter) {
      if (value >= thresholds.green) return 'healthy';
      if (value >= thresholds.amber) return 'warning';
      return 'critical';
    } else {
      if (value <= thresholds.green) return 'healthy';
      if (value <= thresholds.amber) return 'warning';
      return 'critical';
    }
  };

  // Build scorecard from real data (or undefined for missing)
  const pipelineValue = getMetric('pipelineValue');
  const pipelineTotalProjected = getMetric('pipeline_total_projected');
  const pipelineWeighted = getMetric('pipeline_weighted');
  const winRate = getMetric('winRate');
  const onTimeDelivery = getMetric('onTimeDelivery');
  const csat = getMetric('csat');
  const cashPosition = getMetric('cashPosition');
  const cashProjection6Mo = getMetric('cash_projection_6mo');
  const baseRevenue = getMetric('base_revenue');
  const netIncome = getMetric('net_income_margin');
  const dso = getMetric('dso');
  const arAging = getMetric('arAging');
  const utilization = getMetric('utilization');
  const openPositions = getMetric('openPositions');
  const initiativesOnTrack = getMetric('initiativesOnTrack');

  // Helper to build data source info from metric
  const buildDataSource = (metric: MetricInfo | undefined, name: string, executiveId: string) => {
    if (!metric?.sourceUploadId) return [];
    return [{
      name,
      lastUpdated: metric.calculatedAt || now,
      uploadedBy: metric.uploaderName || 'System',
      executiveId,
      recordCount: 0,
      uploadId: metric.sourceUploadId,
      fileName: metric.fileName,
    }];
  };

  // Generate audit metadata showing data sources
  const audit = {
    pipelineHealth: createAuditMetadata(
      'Pipeline metrics from Notion pipeline export or BD tracking',
      'Total Projected = Sum of all opportunity values; Weighted = Sum(Value * Probability); Win Rate = (Wins / Total Closed) * 100',
      [
        ...buildDataSource(metrics['pipeline_total_projected'], 'Notion Pipeline Export', 'exec-cgo'),
        ...buildDataSource(metrics['pipelineValue'], 'BD Pipeline Upload', 'exec-cgo'),
      ]
    ),
    deliveryHealth: createAuditMetadata(
      'Delivery metrics calculated from service delivery tracking and client feedback',
      'On-Time = (Delivered On Time / Total Deliverables) * 100; Satisfaction = Avg rating from client surveys',
      buildDataSource(metrics['onTimeDelivery'], 'Delivery Tracking Upload', 'exec-cso')
    ),
    margin: createAuditMetadata(
      'Margin calculated from Pro Forma workbook base revenue and net income',
      'Margin % = (Net Income / Base Revenue) * 100',
      [
        ...buildDataSource(metrics['base_revenue'], 'Pro Forma Workbook', 'exec-cfo'),
        ...buildDataSource(metrics['net_income_margin'], 'Pro Forma Workbook', 'exec-cfo'),
      ]
    ),
    cash: createAuditMetadata(
      'Cash metrics from Pro Forma Cash Tracker and AR aging reports',
      '6-Mo Projection = From Cash Tracker; DSO = (AR / Revenue) * Days; AR 90+ = Sum of invoices > 90 days',
      [
        ...buildDataSource(metrics['cash_projection_6mo'], 'Pro Forma Workbook', 'exec-cfo'),
        ...buildDataSource(metrics['arAging'], 'AR Aging Upload', 'exec-cfo'),
      ]
    ),
    staffingCapacity: createAuditMetadata(
      'Staffing metrics from Harvest time tracking and HR systems',
      'Utilization = (Billable Hours / Available Hours) * 100',
      buildDataSource(metrics['utilization'], 'Staffing Upload', 'exec-coo')
    ),
    strategicInitiatives: createAuditMetadata(
      'Strategic initiative progress tracked in quarterly planning documents',
      'On Track = Count of initiatives with status "Green" or "On Track"',
      buildDataSource(metrics['initiativesOnTrack'], 'Strategic Upload', 'exec-ceo')
    ),
  };

  // Calculate margin percent if we have both values
  const marginPercent = baseRevenue && netIncome ? Math.round((netIncome / baseRevenue) * 100) : undefined;

  return {
    pipelineHealth: {
      pipelineValue: pipelineWeighted ?? pipelineValue ?? 0,
      pipelineValueChange: undefined,
      pipelineTotalProjected: pipelineTotalProjected,
      pipelineTotalProjectedChange: undefined,
      pipelineWeighted: pipelineWeighted,
      pipelineWeightedChange: undefined,
      winRate: winRate ?? 0,
      winRateChange: undefined,
      status: (pipelineWeighted !== undefined || pipelineValue !== undefined)
        ? getStatus(winRate, { green: 40, amber: 30 })
        : 'warning',
    },
    deliveryHealth: {
      onTimeDelivery: onTimeDelivery ?? 0,
      onTimeDeliveryChange: undefined,
      clientSatisfaction: csat ? csat / 2 : 0, // Convert 10-scale to 5-scale
      clientSatisfactionChange: undefined,
      status: onTimeDelivery !== undefined ? getStatus(onTimeDelivery, { green: 95, amber: 85 }) : 'warning',
    },
    margin: {
      contractMargin: marginPercent ?? 0,
      contractMarginChange: undefined,
      baseRevenue: baseRevenue,
      baseRevenueChange: undefined,
      netIncome: netIncome,
      netIncomeChange: undefined,
      marginPercent: marginPercent,
      marginPercentChange: undefined,
      status: baseRevenue !== undefined ? (marginPercent && marginPercent > 0 ? 'healthy' : marginPercent !== undefined && marginPercent > -10 ? 'warning' : 'critical') : 'warning',
    },
    cash: {
      cashPosition: cashPosition ?? 0,
      cashPositionChange: undefined,
      cashProjection6Mo: cashProjection6Mo,
      cashProjection6MoChange: undefined,
      dso: dso ?? 0,
      dsoChange: undefined,
      ar90Plus: arAging ?? 0,
      ar90PlusChange: undefined,
      status: (cashProjection6Mo !== undefined || arAging !== undefined)
        ? getStatus(arAging ?? 0, { green: 50000, amber: 100000 }, false)
        : 'warning',
    },
    staffingCapacity: {
      billableUtilization: utilization ?? 0,
      billableUtilizationChange: undefined,
      openPositions: openPositions ?? 0,
      openPositionsChange: undefined,
      status: utilization !== undefined ? getStatus(utilization, { green: 75, amber: 65 }) : 'warning',
    },
    strategicInitiatives: {
      initiativesOnTrack: initiativesOnTrack ?? 0,
      initiativesTotal: 6, // Fixed total for now
      status: initiativesOnTrack !== undefined ? getStatus((initiativesOnTrack / 6) * 100, { green: 80, amber: 60 }) : 'warning',
    },
    lastUpdated: now,
    audit,
  };
}

/**
 * Fetch latest calculated metrics from database
 */
interface MetricInfo {
  value: number;
  calculatedAt?: string;
  sourceUploadId?: string;
  fileName?: string;
  uploaderName?: string;
}

async function fetchLatestMetrics(): Promise<Record<string, MetricInfo>> {
  try {
    const { data, error } = await supabase
      .from('calculated_metrics')
      .select('metric_id, value, calculated_at, source_upload_id')
      .order('calculated_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching metrics:', error);
      return {};
    }

    // Get latest value for each metric
    const latest: Record<string, MetricInfo> = {};
    const uploadIds = new Set<string>();

    for (const row of data) {
      if (!latest[row.metric_id]) {
        latest[row.metric_id] = {
          value: Number(row.value),
          calculatedAt: row.calculated_at,
          sourceUploadId: row.source_upload_id,
        };
        if (row.source_upload_id) {
          uploadIds.add(row.source_upload_id);
        }
      }
    }

    // Fetch upload details for the source uploads
    if (uploadIds.size > 0) {
      const { data: uploads } = await supabase
        .from('upload_history')
        .select('id, file_name, uploader_name')
        .in('id', Array.from(uploadIds));

      if (uploads) {
        const uploadMap = new Map(uploads.map(u => [u.id, u]));
        for (const metricId of Object.keys(latest)) {
          const uploadId = latest[metricId].sourceUploadId;
          if (uploadId && uploadMap.has(uploadId)) {
            const upload = uploadMap.get(uploadId)!;
            latest[metricId].fileName = upload.file_name;
            latest[metricId].uploaderName = upload.uploader_name;
          }
        }
      }
    }

    return latest;
  } catch (err) {
    console.error('Failed to fetch metrics:', err);
    return {};
  }
}

/**
 * Helper to create audit metadata
 */
function createAuditMetadata(
  calculationMethod: string,
  formula: string,
  dataSources: { name: string; lastUpdated: string; uploadedBy: string; executiveId: string; recordCount: number; uploadId?: string; fileName?: string }[]
): AuditMetadata {
  return {
    calculatedAt: new Date().toISOString(),
    calculationMethod,
    formula,
    dataSources,
  };
}
