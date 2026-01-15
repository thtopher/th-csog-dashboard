import { NextResponse } from 'next/server';
import type { OverviewResponse, DomainSummary, KPISummary, HealthStatus, TrendDirection } from '@/types';
import { DEFAULT_DOMAINS } from '@/config/domains';

/**
 * GET /api/kpis/overview
 *
 * Returns aggregated KPI summaries for all domains.
 * Values vary based on the selected time period.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodType = searchParams.get('periodType') || 'week';

  // Multipliers to simulate different time windows showing different data
  const periodMultipliers: Record<string, { value: number; variance: number }> = {
    week: { value: 1.0, variance: 0 },
    month: { value: 0.95, variance: 0.05 },
    quarter: { value: 0.88, variance: 0.08 },
    ytd: { value: 0.82, variance: 0.12 },
  };

  const mult = periodMultipliers[periodType] || periodMultipliers.week;

  // Helper to apply variance
  const applyVariance = (base: number, isPercent: boolean = false): number => {
    const varied = base * mult.value + (Math.random() - 0.5) * base * mult.variance;
    if (isPercent) return Math.min(100, Math.max(0, Math.round(varied * 10) / 10));
    return Math.round(varied);
  };

  // Helper to determine trend based on period
  const getTrend = (baseValue: number, currentValue: number, direction: 'higher_better' | 'lower_better' | 'target'): TrendDirection => {
    const diff = currentValue - baseValue;
    if (Math.abs(diff) < baseValue * 0.02) return 'flat';
    if (direction === 'lower_better') return diff < 0 ? 'up' : 'down'; // Inverted for "lower is better"
    return diff > 0 ? 'up' : 'down';
  };

  // Base KPI data that gets modified by time period
  const generateKPIs = (): Record<string, KPISummary[]> => ({
    // Growth (BD)
    'd1000000-0000-0000-0000-000000000001': [
      {
        id: 'k-growth-1',
        processId: 'p1',
        name: 'Active Pipeline Value',
        shortName: 'Pipeline',
        unit: 'dollars',
        direction: 'higher_better',
        dataSource: 'notion',
        refreshCadence: 'weekly',
        displayFormat: 'currency',
        chartType: 'area',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 2000000,
        latestValue: {
          id: 'v1',
          kpiDefinitionId: 'k-growth-1',
          periodStart: '2024-12-23',
          periodEnd: '2024-12-29',
          periodType: 'week',
          value: applyVariance(2450000),
          status: applyVariance(2450000) >= 2000000 ? 'healthy' : 'warning',
          trendDirection: periodType === 'week' ? 'up' : periodType === 'month' ? 'up' : 'flat',
          ingestedAt: '',
        },
      },
      {
        id: 'k-growth-2',
        processId: 'p2',
        name: 'Win Rate',
        shortName: 'Win Rate',
        unit: 'percent',
        direction: 'higher_better',
        dataSource: 'notion',
        refreshCadence: 'quarterly',
        displayFormat: 'percent',
        chartType: 'line',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 40,
        latestValue: {
          id: 'v2',
          kpiDefinitionId: 'k-growth-2',
          periodStart: '2024-10-01',
          periodEnd: '2024-12-31',
          periodType: 'quarter',
          value: applyVariance(38, true),
          status: applyVariance(38, true) >= 35 ? 'warning' : 'critical',
          trendDirection: periodType === 'ytd' ? 'down' : 'flat',
          ingestedAt: '',
        },
      },
      {
        id: 'k-growth-3',
        processId: 'p3',
        name: 'Active Opportunities',
        shortName: 'Opportunities',
        unit: 'count',
        direction: 'higher_better',
        dataSource: 'notion',
        refreshCadence: 'weekly',
        displayFormat: 'number',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        latestValue: {
          id: 'v3',
          kpiDefinitionId: 'k-growth-3',
          periodStart: '2024-12-23',
          periodEnd: '2024-12-29',
          periodType: 'week',
          value: Math.round(12 * mult.value),
          status: 'healthy',
          trendDirection: periodType === 'week' ? 'up' : 'flat',
          ingestedAt: '',
        },
      },
    ],

    // Service Delivery
    'd1000000-0000-0000-0000-000000000002': [
      {
        id: 'k-delivery-1',
        processId: 'p1',
        name: 'Active Engagements',
        shortName: 'Engagements',
        unit: 'count',
        direction: 'higher_better',
        dataSource: 'netsuite',
        refreshCadence: 'weekly',
        displayFormat: 'number',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        latestValue: {
          id: 'v4',
          kpiDefinitionId: 'k-delivery-1',
          periodStart: '2024-12-23',
          periodEnd: '2024-12-29',
          periodType: 'week',
          value: periodType === 'week' ? 8 : periodType === 'month' ? 9 : periodType === 'quarter' ? 7 : 6,
          status: 'healthy',
          trendDirection: periodType === 'week' ? 'flat' : periodType === 'month' ? 'up' : 'down',
          ingestedAt: '',
        },
      },
      {
        id: 'k-delivery-2',
        processId: 'p2',
        name: 'On-Time Delivery Rate',
        shortName: 'On-Time',
        unit: 'percent',
        direction: 'higher_better',
        dataSource: 'manual',
        refreshCadence: 'monthly',
        displayFormat: 'percent',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 95,
        latestValue: {
          id: 'v5',
          kpiDefinitionId: 'k-delivery-2',
          periodStart: '2024-12-01',
          periodEnd: '2024-12-31',
          periodType: 'month',
          value: periodType === 'week' ? 91 : periodType === 'month' ? 89 : periodType === 'quarter' ? 87 : 85,
          status: 'warning',
          trendDirection: periodType === 'week' ? 'up' : 'down',
          ingestedAt: '',
        },
      },
      {
        id: 'k-delivery-3',
        processId: 'p3',
        name: 'Client Satisfaction',
        shortName: 'CSAT',
        unit: 'count',
        direction: 'higher_better',
        dataSource: 'manual',
        refreshCadence: 'quarterly',
        displayFormat: 'number',
        chartType: 'gauge',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 4.5,
        latestValue: {
          id: 'v6',
          kpiDefinitionId: 'k-delivery-3',
          periodStart: '2024-10-01',
          periodEnd: '2024-12-31',
          periodType: 'quarter',
          value: periodType === 'week' ? 4.7 : periodType === 'month' ? 4.6 : 4.5,
          status: 'healthy',
          trendDirection: periodType === 'week' ? 'up' : 'flat',
          ingestedAt: '',
        },
      },
    ],

    // Contract Closure
    'd1000000-0000-0000-0000-000000000003': [
      {
        id: 'k-closure-1',
        processId: 'p1',
        name: periodType === 'ytd' ? 'Contracts Closed (YTD)' : `Contracts Closed (${periodType === 'week' ? 'Week' : periodType === 'month' ? 'Month' : 'Q4'})`,
        shortName: 'Closed',
        unit: 'count',
        direction: 'higher_better',
        dataSource: 'netsuite',
        refreshCadence: 'quarterly',
        displayFormat: 'number',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        latestValue: {
          id: 'v7',
          kpiDefinitionId: 'k-closure-1',
          periodStart: '2024-10-01',
          periodEnd: '2024-12-31',
          periodType: 'quarter',
          value: periodType === 'week' ? 1 : periodType === 'month' ? 3 : periodType === 'quarter' ? 5 : 18,
          status: 'healthy',
          trendDirection: 'up',
          ingestedAt: '',
        },
      },
      {
        id: 'k-closure-2',
        processId: 'p2',
        name: 'Avg Closeout Time',
        shortName: 'Closeout Days',
        unit: 'days',
        direction: 'lower_better',
        dataSource: 'manual',
        refreshCadence: 'quarterly',
        displayFormat: 'number',
        chartType: 'line',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 14,
        latestValue: {
          id: 'v8',
          kpiDefinitionId: 'k-closure-2',
          periodStart: '2024-10-01',
          periodEnd: '2024-12-31',
          periodType: 'quarter',
          value: periodType === 'week' ? 12 : periodType === 'month' ? 15 : periodType === 'quarter' ? 18 : 21,
          status: periodType === 'week' ? 'healthy' : 'warning',
          trendDirection: periodType === 'week' ? 'down' : 'up', // down is good for "lower is better"
          ingestedAt: '',
        },
      },
    ],

    // Finance
    'd1000000-0000-0000-0000-000000000004': [
      {
        id: 'k-finance-1',
        processId: 'p1',
        name: 'Days Sales Outstanding',
        shortName: 'DSO',
        unit: 'days',
        direction: 'lower_better',
        dataSource: 'netsuite',
        refreshCadence: 'monthly',
        displayFormat: 'number',
        chartType: 'line',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 45,
        latestValue: {
          id: 'v9',
          kpiDefinitionId: 'k-finance-1',
          periodStart: '2024-12-01',
          periodEnd: '2024-12-31',
          periodType: 'month',
          value: periodType === 'week' ? 42 : periodType === 'month' ? 44 : periodType === 'quarter' ? 48 : 52,
          status: periodType === 'week' || periodType === 'month' ? 'healthy' : 'warning',
          trendDirection: periodType === 'week' ? 'down' : 'up',
          ingestedAt: '',
        },
      },
      {
        id: 'k-finance-2',
        processId: 'p2',
        name: 'AR 90+ Days',
        shortName: 'AR 90+',
        unit: 'dollars',
        direction: 'lower_better',
        dataSource: 'netsuite',
        refreshCadence: 'monthly',
        displayFormat: 'currency',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 0,
        warningThreshold: 50000,
        latestValue: {
          id: 'v10',
          kpiDefinitionId: 'k-finance-2',
          periodStart: '2024-12-01',
          periodEnd: '2024-12-31',
          periodType: 'month',
          value: periodType === 'week' ? 28500 : periodType === 'month' ? 35000 : periodType === 'quarter' ? 48000 : 62000,
          status: periodType === 'ytd' ? 'warning' : 'healthy',
          trendDirection: periodType === 'week' ? 'down' : 'up',
          ingestedAt: '',
        },
      },
      {
        id: 'k-finance-3',
        processId: 'p3',
        name: periodType === 'ytd' ? 'YTD Revenue' : periodType === 'quarter' ? 'Q4 Revenue' : 'Monthly Revenue',
        shortName: 'Revenue',
        unit: 'dollars',
        direction: 'higher_better',
        dataSource: 'netsuite',
        refreshCadence: 'monthly',
        displayFormat: 'currency',
        chartType: 'area',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        latestValue: {
          id: 'v11',
          kpiDefinitionId: 'k-finance-3',
          periodStart: '2024-12-01',
          periodEnd: '2024-12-31',
          periodType: 'month',
          value: periodType === 'week' ? 125000 : periodType === 'month' ? 485000 : periodType === 'quarter' ? 1420000 : 5680000,
          status: 'healthy',
          trendDirection: 'up',
          ingestedAt: '',
        },
      },
    ],

    // Internal Operations
    'd1000000-0000-0000-0000-000000000005': [
      {
        id: 'k-ops-1',
        processId: 'p1',
        name: 'Harvest Compliance',
        shortName: 'Compliance',
        unit: 'percent',
        direction: 'higher_better',
        dataSource: 'excel_harvest',
        refreshCadence: 'weekly',
        displayFormat: 'percent',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 95,
        latestValue: {
          id: 'v12',
          kpiDefinitionId: 'k-ops-1',
          periodStart: '2024-12-23',
          periodEnd: '2024-12-29',
          periodType: 'week',
          value: periodType === 'week' ? 94 : periodType === 'month' ? 91 : periodType === 'quarter' ? 88 : 86,
          status: periodType === 'week' ? 'healthy' : 'warning',
          trendDirection: periodType === 'week' ? 'up' : periodType === 'month' ? 'up' : 'down',
          ingestedAt: '',
        },
      },
      {
        id: 'k-ops-2',
        processId: 'p2',
        name: 'Training Completion',
        shortName: 'Training',
        unit: 'percent',
        direction: 'higher_better',
        dataSource: 'excel_training',
        refreshCadence: 'monthly',
        displayFormat: 'percent',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 100,
        latestValue: {
          id: 'v13',
          kpiDefinitionId: 'k-ops-2',
          periodStart: '2024-12-01',
          periodEnd: '2024-12-31',
          periodType: 'month',
          value: periodType === 'week' ? 92 : periodType === 'month' ? 88 : periodType === 'quarter' ? 82 : 78,
          status: periodType === 'week' ? 'warning' : periodType === 'ytd' ? 'critical' : 'warning',
          trendDirection: periodType === 'week' ? 'up' : 'down',
          ingestedAt: '',
        },
      },
      {
        id: 'k-ops-3',
        processId: 'p3',
        name: 'Billable Utilization',
        shortName: 'Utilization',
        unit: 'percent',
        direction: 'higher_better',
        dataSource: 'excel_billable',
        refreshCadence: 'weekly',
        displayFormat: 'percent',
        chartType: 'line',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 75,
        latestValue: {
          id: 'v14',
          kpiDefinitionId: 'k-ops-3',
          periodStart: '2024-12-23',
          periodEnd: '2024-12-29',
          periodType: 'week',
          value: periodType === 'week' ? 72 : periodType === 'month' ? 74 : periodType === 'quarter' ? 71 : 69,
          status: 'warning',
          trendDirection: periodType === 'month' ? 'up' : 'down',
          ingestedAt: '',
        },
      },
    ],

    // Board & CSOG
    'd1000000-0000-0000-0000-000000000006': [
      {
        id: 'k-board-1',
        processId: 'p1',
        name: 'Strategic Initiatives',
        shortName: 'Initiatives',
        unit: 'count',
        direction: 'higher_better',
        dataSource: 'manual',
        refreshCadence: 'quarterly',
        displayFormat: 'number',
        chartType: 'bar',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        latestValue: {
          id: 'v15',
          kpiDefinitionId: 'k-board-1',
          periodStart: '2024-10-01',
          periodEnd: '2024-12-31',
          periodType: 'quarter',
          value: periodType === 'ytd' ? 12 : 6,
          status: 'healthy',
          trendDirection: 'flat',
          ingestedAt: '',
        },
      },
      {
        id: 'k-board-2',
        processId: 'p2',
        name: 'On-Track Initiatives',
        shortName: 'On-Track',
        unit: 'percent',
        direction: 'higher_better',
        dataSource: 'manual',
        refreshCadence: 'monthly',
        displayFormat: 'percent',
        chartType: 'gauge',
        isPrimary: true,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        targetValue: 80,
        latestValue: {
          id: 'v16',
          kpiDefinitionId: 'k-board-2',
          periodStart: '2024-12-01',
          periodEnd: '2024-12-31',
          periodType: 'month',
          value: periodType === 'week' ? 83 : periodType === 'month' ? 80 : periodType === 'quarter' ? 75 : 72,
          status: periodType === 'week' || periodType === 'month' ? 'healthy' : 'warning',
          trendDirection: periodType === 'week' ? 'up' : 'down',
          ingestedAt: '',
        },
      },
    ],
  });

  const domainKPIs = generateKPIs();

  // Calculate overall status based on KPIs
  const calculateOverallStatus = (kpis: KPISummary[]): HealthStatus => {
    if (kpis.some(k => k.latestValue?.status === 'critical')) return 'critical';
    if (kpis.some(k => k.latestValue?.status === 'warning')) return 'warning';
    return 'healthy';
  };

  const domains: DomainSummary[] = DEFAULT_DOMAINS.map((domain) => {
    const kpis = domainKPIs[domain.id!] || [];
    return {
      ...domain,
      id: domain.id!,
      name: domain.name!,
      shortName: domain.shortName!,
      displayOrder: domain.displayOrder!,
      colorHex: domain.colorHex!,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processes: [],
      primaryKpis: kpis,
      overallStatus: calculateOverallStatus(kpis),
      activeGapsCount: domain.id === 'd1000000-0000-0000-0000-000000000005' ? 2 :
                       domain.id === 'd1000000-0000-0000-0000-000000000002' ? 1 :
                       domain.id === 'd1000000-0000-0000-0000-000000000003' ? 1 : 0,
    };
  });

  const response: OverviewResponse = {
    domains,
    filters: {
      timeFilter: {
        periodType: periodType as 'week' | 'month' | 'quarter',
        periodsBack: 4,
      },
    },
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
