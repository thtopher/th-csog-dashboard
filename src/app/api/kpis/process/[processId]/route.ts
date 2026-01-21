import { NextResponse } from 'next/server';
import type { ProcessDetailResponse } from '@/types';

/**
 * GET /api/kpis/process/[processId]
 *
 * Returns detailed KPI data for a specific process.
 * Includes all KPIs with full historical data, annotations, and gaps.
 *
 * Query params:
 * - periodType: 'week' | 'month' | 'quarter' (default: 'week')
 * - periodsBack: number of periods to include (default: 12)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ processId: string }> }
) {
  const { processId } = await params;
  const { searchParams } = new URL(request.url);
  const periodType = searchParams.get('periodType') || 'week';
  const periodsBack = parseInt(searchParams.get('periodsBack') || '12', 10);

  // TODO: Replace with actual database query
  // This should:
  // 1. Fetch the process by ID (with domain info)
  // 2. Fetch all KPI definitions for this process
  // 3. Fetch KPI values for the requested time range
  // 4. Fetch annotations attached to this process or its KPIs
  // 5. Fetch process gaps

  const response: ProcessDetailResponse = {
    process: {
      id: processId,
      domainId: '',
      name: 'Loading...',
      processTag: '',
      processType: 'process',
      sopStatus: 'missing',
      displayOrder: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kpis: [],
      activeGapsCount: 0,
    },
    kpiDetails: [],
    gaps: [],
    annotations: [],
  };

  return NextResponse.json(response);
}
