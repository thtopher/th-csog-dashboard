import { NextResponse } from 'next/server';
import type { OverviewResponse, DomainSummary, HealthStatus } from '@/types';
import { DEFAULT_DOMAINS } from '@/config/domains';

/**
 * GET /api/kpis/overview
 *
 * Returns aggregated KPI summaries for all domains.
 * This is the primary endpoint for the firm health dashboard landing page.
 *
 * Query params:
 * - periodType: 'week' | 'month' | 'quarter' (default: 'week')
 * - periodsBack: number of periods to include (default: 4)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodType = searchParams.get('periodType') || 'week';
  const periodsBack = parseInt(searchParams.get('periodsBack') || '4', 10);

  // TODO: Replace with actual database queries
  // For now, return mock data structure
  const domains: DomainSummary[] = DEFAULT_DOMAINS.map((domain, index) => ({
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
    primaryKpis: [],
    // Mock status - in production, calculated from actual KPI values
    overallStatus: (['healthy', 'warning', 'healthy', 'healthy', 'warning', 'healthy'][index] as HealthStatus),
    activeGapsCount: [0, 1, 0, 2, 1, 0][index],
  }));

  const response: OverviewResponse = {
    domains,
    filters: {
      timeFilter: {
        periodType: periodType as 'week' | 'month' | 'quarter',
        periodsBack,
      },
    },
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
