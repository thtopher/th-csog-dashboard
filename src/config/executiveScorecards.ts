/**
 * Executive Scorecard Configuration
 * Defines the metrics and KPIs displayed for each executive's domain
 */

export type MetricStatus = 'green' | 'amber' | 'red' | 'gray';

export interface ScorecardMetric {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  higherIsBetter?: boolean;
}

export interface ScorecardCategory {
  id: string;
  name: string;
  metrics: ScorecardMetric[];
}

export interface ExecutiveScorecardConfig {
  title: string;
  categories: ScorecardCategory[];
}

export const EXECUTIVE_SCORECARDS: Record<string, ExecutiveScorecardConfig> = {
  'exec-coo': {
    title: 'Operations Dashboard',
    categories: [
      {
        id: 'compliance',
        name: 'Time Compliance',
        metrics: [
          {
            id: 'harvestRate',
            name: 'Harvest Compliance',
            description: 'Percentage of staff with complete time entries',
            unit: '%',
            targetValue: 95,
            warningThreshold: 85,
            criticalThreshold: 75,
            higherIsBetter: true,
          },
          {
            id: 'trainingRate',
            name: 'Training Completion',
            description: 'Staff training compliance rate',
            unit: '%',
            targetValue: 100,
            warningThreshold: 90,
            criticalThreshold: 80,
            higherIsBetter: true,
          },
        ],
      },
      {
        id: 'staffing',
        name: 'Staffing & Utilization',
        metrics: [
          {
            id: 'utilization',
            name: 'Billable Utilization',
            description: 'Average billable utilization rate',
            unit: '%',
            targetValue: 75,
            warningThreshold: 65,
            criticalThreshold: 55,
            higherIsBetter: true,
          },
          {
            id: 'openPositions',
            name: 'Open Positions',
            description: 'Number of unfilled positions',
            targetValue: 0,
            warningThreshold: 3,
            criticalThreshold: 5,
            higherIsBetter: false,
          },
        ],
      },
    ],
  },

  'exec-cfo': {
    title: 'Finance Dashboard',
    categories: [
      {
        id: 'receivables',
        name: 'Receivables',
        metrics: [
          {
            id: 'arAging',
            name: 'AR > 90 Days',
            description: 'Receivables aged over 90 days',
            unit: '$',
            targetValue: 50000,
            warningThreshold: 100000,
            criticalThreshold: 200000,
            higherIsBetter: false,
          },
          {
            id: 'dso',
            name: 'Days Sales Outstanding',
            description: 'Average collection period',
            unit: 'days',
            targetValue: 45,
            warningThreshold: 60,
            criticalThreshold: 75,
            higherIsBetter: false,
          },
        ],
      },
      {
        id: 'payables',
        name: 'Payables',
        metrics: [
          {
            id: 'apAging',
            name: 'AP Current',
            description: 'Percentage of AP within terms',
            unit: '%',
            targetValue: 95,
            warningThreshold: 85,
            criticalThreshold: 75,
            higherIsBetter: true,
          },
        ],
      },
      {
        id: 'close',
        name: 'Month Close',
        metrics: [
          {
            id: 'closeStatus',
            name: 'Close Progress',
            description: 'Monthly close completion',
            unit: '%',
            targetValue: 100,
            warningThreshold: 75,
            criticalThreshold: 50,
            higherIsBetter: true,
          },
        ],
      },
    ],
  },

  'exec-president': {
    title: 'Executive Dashboard',
    categories: [
      {
        id: 'financial',
        name: 'Financial Health',
        metrics: [
          {
            id: 'cashPosition',
            name: 'Cash Position',
            description: 'Current cash on hand',
            unit: '$',
          },
          {
            id: 'runway',
            name: 'Cash Runway',
            description: 'Months of operating cash',
            unit: 'months',
            targetValue: 6,
            warningThreshold: 4,
            criticalThreshold: 2,
            higherIsBetter: true,
          },
        ],
      },
      {
        id: 'portfolio',
        name: 'Portfolio Health',
        metrics: [
          {
            id: 'activeEngagements',
            name: 'Active Engagements',
            description: 'Number of active client engagements',
          },
          {
            id: 'atRisk',
            name: 'At-Risk Projects',
            description: 'Projects flagged as at-risk',
            targetValue: 0,
            warningThreshold: 2,
            criticalThreshold: 5,
            higherIsBetter: false,
          },
        ],
      },
    ],
  },

  'exec-cgo': {
    title: 'Growth Dashboard',
    categories: [
      {
        id: 'pipeline',
        name: 'Pipeline',
        metrics: [
          {
            id: 'pipelineValue',
            name: 'Pipeline Value',
            description: 'Total value of active opportunities',
            unit: '$',
          },
          {
            id: 'qualifiedOpps',
            name: 'Qualified Opportunities',
            description: 'Number of qualified opportunities',
          },
        ],
      },
      {
        id: 'conversion',
        name: 'Conversion',
        metrics: [
          {
            id: 'winRate',
            name: 'Win Rate',
            description: 'Opportunity win percentage',
            unit: '%',
            targetValue: 40,
            warningThreshold: 30,
            criticalThreshold: 20,
            higherIsBetter: true,
          },
          {
            id: 'avgDealSize',
            name: 'Avg Deal Size',
            description: 'Average closed deal value',
            unit: '$',
          },
        ],
      },
    ],
  },

  'exec-cso': {
    title: 'Service Delivery Dashboard',
    categories: [
      {
        id: 'delivery',
        name: 'Delivery',
        metrics: [
          {
            id: 'onTimeDelivery',
            name: 'On-Time Delivery',
            description: 'Percentage of milestones delivered on time',
            unit: '%',
            targetValue: 95,
            warningThreshold: 85,
            criticalThreshold: 75,
            higherIsBetter: true,
          },
          {
            id: 'activeProjects',
            name: 'Active Projects',
            description: 'Number of active delivery projects',
          },
        ],
      },
      {
        id: 'satisfaction',
        name: 'Client Satisfaction',
        metrics: [
          {
            id: 'csat',
            name: 'CSAT Score',
            description: 'Client satisfaction score',
            unit: '/10',
            targetValue: 9,
            warningThreshold: 8,
            criticalThreshold: 7,
            higherIsBetter: true,
          },
          {
            id: 'nps',
            name: 'NPS',
            description: 'Net Promoter Score',
            targetValue: 50,
            warningThreshold: 30,
            criticalThreshold: 10,
            higherIsBetter: true,
          },
        ],
      },
    ],
  },

  'exec-cdao': {
    title: 'Data & Analytics Dashboard',
    categories: [
      {
        id: 'starset',
        name: 'Starset Analytics',
        metrics: [
          {
            id: 'starsetUsers',
            name: 'Active Users',
            description: 'Monthly active users on Starset',
          },
          {
            id: 'dataQuality',
            name: 'Data Quality Score',
            description: 'Overall data quality index',
            unit: '%',
            targetValue: 95,
            warningThreshold: 85,
            criticalThreshold: 75,
            higherIsBetter: true,
          },
        ],
      },
      {
        id: 'hmrf',
        name: 'HMRF Database',
        metrics: [
          {
            id: 'hmrfRecords',
            name: 'Total Records',
            description: 'Number of MRF records in database',
          },
          {
            id: 'hmrfCoverage',
            name: 'Coverage',
            description: 'Percentage of hospitals covered',
            unit: '%',
          },
        ],
      },
    ],
  },

  'exec-ceo': {
    title: 'CEO Strategic Dashboard',
    categories: [
      {
        id: 'strategic',
        name: 'Strategic Initiatives',
        metrics: [
          {
            id: 'initiativesOnTrack',
            name: 'Initiatives On Track',
            description: 'Percentage of strategic initiatives on track',
            unit: '%',
            targetValue: 80,
            warningThreshold: 60,
            criticalThreshold: 40,
            higherIsBetter: true,
          },
          {
            id: 'keyMilestones',
            name: 'Key Milestones',
            description: 'Major milestones achieved this quarter',
          },
        ],
      },
      {
        id: 'governance',
        name: 'Governance',
        metrics: [
          {
            id: 'csogCompliance',
            name: 'CSOG Compliance',
            description: 'Operating rhythm compliance across executives',
            unit: '%',
            targetValue: 100,
            warningThreshold: 90,
            criticalThreshold: 80,
            higherIsBetter: true,
          },
        ],
      },
    ],
  },
};

/**
 * Get scorecard configuration for an executive
 */
export function getScorecardConfig(executiveId: string): ExecutiveScorecardConfig | null {
  return EXECUTIVE_SCORECARDS[executiveId] || null;
}

/**
 * Calculate status based on metric value and thresholds
 */
export function getMetricStatus(
  value: number | undefined,
  metric: ScorecardMetric
): MetricStatus {
  if (value === undefined || value === null) return 'gray';

  const { targetValue, warningThreshold, criticalThreshold, higherIsBetter = true } = metric;

  if (targetValue === undefined || warningThreshold === undefined || criticalThreshold === undefined) {
    return 'gray';
  }

  if (higherIsBetter) {
    if (value >= targetValue) return 'green';
    if (value >= warningThreshold) return 'amber';
    return 'red';
  } else {
    if (value <= targetValue) return 'green';
    if (value <= warningThreshold) return 'amber';
    return 'red';
  }
}
