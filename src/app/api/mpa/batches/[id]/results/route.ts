/**
 * MPA Batch Results API
 *
 * GET /api/mpa/batches/[id]/results - Get full analysis results
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase not configured');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    // Get batch
    const { data: batch, error: batchError } = await supabase
      .from('mpa_analysis_batches')
      .select('*')
      .eq('id', id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    if (batch.status !== 'completed') {
      return NextResponse.json(
        { error: 'Batch has not completed processing', status: batch.status },
        { status: 400 }
      );
    }

    // Get revenue centers
    const { data: revenueCenters, error: rcError } = await supabase
      .from('mpa_revenue_centers')
      .select('*')
      .eq('batch_id', id)
      .order('revenue', { ascending: false });

    if (rcError) {
      console.error('Error fetching revenue centers:', rcError);
    }

    // Get cost centers
    const { data: costCenters, error: ccError } = await supabase
      .from('mpa_cost_centers')
      .select('*')
      .eq('batch_id', id)
      .order('total_cost', { ascending: false });

    if (ccError) {
      console.error('Error fetching cost centers:', ccError);
    }

    // Get non-revenue clients
    const { data: nonRevenueClients, error: nrcError } = await supabase
      .from('mpa_non_revenue_clients')
      .select('*')
      .eq('batch_id', id)
      .order('total_cost', { ascending: false });

    if (nrcError) {
      console.error('Error fetching non-revenue clients:', nrcError);
    }

    // Get pools detail
    const { data: poolsDetail, error: poolsError } = await supabase
      .from('mpa_pools_detail')
      .select('*')
      .eq('batch_id', id)
      .single();

    if (poolsError) {
      console.error('Error fetching pools detail:', poolsError);
    }

    // Transform revenue centers
    const transformedRevenueCenters = (revenueCenters || []).map((rc) => ({
      id: rc.id,
      contractCode: rc.contract_code,
      projectName: rc.project_name,
      proformaSection: rc.proforma_section,
      analysisCategory: rc.analysis_category,
      allocationTag: rc.allocation_tag,
      revenue: rc.revenue,
      hours: rc.hours,
      laborCost: rc.labor_cost,
      expenseCost: rc.expense_cost,
      sgaAllocation: rc.sga_allocation,
      dataAllocation: rc.data_allocation,
      workplaceAllocation: rc.workplace_allocation,
      marginDollars: rc.margin_dollars,
      marginPercent: rc.margin_percent,
    }));

    // Transform cost centers
    const transformedCostCenters = (costCenters || []).map((cc) => ({
      id: cc.id,
      contractCode: cc.contract_code,
      description: cc.description,
      pool: cc.pool,
      hours: cc.hours,
      laborCost: cc.labor_cost,
      expenseCost: cc.expense_cost,
      totalCost: cc.total_cost,
    }));

    // Transform non-revenue clients
    const transformedNonRevenueClients = (nonRevenueClients || []).map((nrc) => ({
      id: nrc.id,
      contractCode: nrc.contract_code,
      projectName: nrc.project_name,
      hours: nrc.hours,
      laborCost: nrc.labor_cost,
      expenseCost: nrc.expense_cost,
      totalCost: nrc.total_cost,
    }));

    // Transform pools detail
    const transformedPoolsDetail = poolsDetail ? {
      sgaFromPnl: poolsDetail.sga_from_pnl,
      dataFromPnl: poolsDetail.data_from_pnl,
      workplaceFromPnl: poolsDetail.workplace_from_pnl,
      nilExcluded: poolsDetail.nil_excluded,
      sgaFromCc: poolsDetail.sga_from_cc,
      dataFromCc: poolsDetail.data_from_cc,
      totalRevenue: poolsDetail.total_revenue,
      dataTaggedRevenue: poolsDetail.data_tagged_revenue,
      wellnessTaggedRevenue: poolsDetail.wellness_tagged_revenue,
    } : null;

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        monthName: batch.month_name,
        status: batch.status,
        totalRevenue: batch.total_revenue,
        totalLaborCost: batch.total_labor_cost,
        totalExpenseCost: batch.total_expense_cost,
        totalMarginDollars: batch.total_margin_dollars,
        overallMarginPercent: batch.overall_margin_percent,
        sgaPool: batch.sga_pool,
        dataPool: batch.data_pool,
        workplacePool: batch.workplace_pool,
        validationPassed: batch.validation_passed,
        validationErrors: batch.validation_errors,
        processedAt: batch.processed_at,
      },
      revenueCenters: transformedRevenueCenters,
      costCenters: transformedCostCenters,
      nonRevenueClients: transformedNonRevenueClients,
      poolsDetail: transformedPoolsDetail,
    });
  } catch (error) {
    console.error('MPA results GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
