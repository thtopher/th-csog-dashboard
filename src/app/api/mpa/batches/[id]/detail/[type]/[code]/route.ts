/**
 * MPA Project Detail API
 *
 * GET /api/mpa/batches/[id]/detail/[type]/[code] - Get drill-down data
 *
 * type: 'revenue' | 'cost' | 'nonrevenue'
 * code: contract_code (URL encoded)
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
  params: Promise<{ id: string; type: string; code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, type, code } = await params;
    const contractCode = decodeURIComponent(code);
    const supabase = getSupabaseClient();

    // Verify batch exists and is completed
    const { data: batch, error: batchError } = await supabase
      .from('mpa_analysis_batches')
      .select('id, status, sga_pool, data_pool, workplace_pool')
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
        { error: 'Batch has not completed processing' },
        { status: 400 }
      );
    }

    // Get hours detail for this project
    const { data: hoursDetail, error: hoursError } = await supabase
      .from('mpa_hours_detail')
      .select('*')
      .eq('batch_id', id)
      .eq('contract_code', contractCode)
      .order('hours', { ascending: false });

    if (hoursError) {
      console.error('Error fetching hours detail:', hoursError);
    }

    // Get expenses detail for this project
    const { data: expensesDetail, error: expError } = await supabase
      .from('mpa_expenses_detail')
      .select('*')
      .eq('batch_id', id)
      .eq('contract_code', contractCode)
      .order('expense_date', { ascending: false });

    if (expError) {
      console.error('Error fetching expenses detail:', expError);
    }

    // Get project info based on type
    let projectInfo = null;
    if (type === 'revenue') {
      const { data, error } = await supabase
        .from('mpa_revenue_centers')
        .select('*')
        .eq('batch_id', id)
        .eq('contract_code', contractCode)
        .single();

      if (!error && data) {
        projectInfo = {
          type: 'revenue',
          contractCode: data.contract_code,
          projectName: data.project_name,
          proformaSection: data.proforma_section,
          analysisCategory: data.analysis_category,
          allocationTag: data.allocation_tag,
          revenue: data.revenue,
          hours: data.hours,
          laborCost: data.labor_cost,
          expenseCost: data.expense_cost,
          sgaAllocation: data.sga_allocation,
          dataAllocation: data.data_allocation,
          workplaceAllocation: data.workplace_allocation,
          marginDollars: data.margin_dollars,
          marginPercent: data.margin_percent,
        };
      }
    } else if (type === 'cost') {
      const { data, error } = await supabase
        .from('mpa_cost_centers')
        .select('*')
        .eq('batch_id', id)
        .eq('contract_code', contractCode)
        .single();

      if (!error && data) {
        projectInfo = {
          type: 'cost',
          contractCode: data.contract_code,
          description: data.description,
          pool: data.pool,
          hours: data.hours,
          laborCost: data.labor_cost,
          expenseCost: data.expense_cost,
          totalCost: data.total_cost,
        };
      }
    } else if (type === 'nonrevenue') {
      const { data, error } = await supabase
        .from('mpa_non_revenue_clients')
        .select('*')
        .eq('batch_id', id)
        .eq('contract_code', contractCode)
        .single();

      if (!error && data) {
        projectInfo = {
          type: 'nonrevenue',
          contractCode: data.contract_code,
          projectName: data.project_name,
          hours: data.hours,
          laborCost: data.labor_cost,
          expenseCost: data.expense_cost,
          totalCost: data.total_cost,
        };
      }
    }

    if (!projectInfo) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Transform hours detail
    const transformedHours = (hoursDetail || []).map((h) => ({
      staffKey: h.staff_key,
      hours: h.hours,
      hourlyCost: h.hourly_cost,
      laborCost: h.labor_cost,
    }));

    // Transform expenses detail
    const transformedExpenses = (expensesDetail || []).map((e) => ({
      expenseDate: e.expense_date,
      amount: e.amount,
      notes: e.notes,
    }));

    // Calculate allocation breakdown if revenue center
    let allocationBreakdown = null;
    if (type === 'revenue' && projectInfo.revenue > 0) {
      // Get pools detail for denominators
      const { data: poolsDetail } = await supabase
        .from('mpa_pools_detail')
        .select('*')
        .eq('batch_id', id)
        .single();

      if (poolsDetail) {
        const totalRevenue = poolsDetail.total_revenue || 0;
        const dataTaggedRevenue = poolsDetail.data_tagged_revenue || 0;
        const wellnessTaggedRevenue = poolsDetail.wellness_tagged_revenue || 0;

        allocationBreakdown = {
          sga: {
            pool: batch.sga_pool,
            totalRevenue,
            projectRevenue: projectInfo.revenue,
            sharePercent: totalRevenue > 0 ? (projectInfo.revenue / totalRevenue * 100) : 0,
            allocation: projectInfo.sgaAllocation,
            formula: `(${formatCurrency(projectInfo.revenue)} / ${formatCurrency(totalRevenue)}) × ${formatCurrency(batch.sga_pool)}`,
          },
          data: projectInfo.allocationTag === 'Data' ? {
            pool: batch.data_pool,
            taggedRevenue: dataTaggedRevenue,
            projectRevenue: projectInfo.revenue,
            sharePercent: dataTaggedRevenue > 0 ? (projectInfo.revenue / dataTaggedRevenue * 100) : 0,
            allocation: projectInfo.dataAllocation,
            formula: `(${formatCurrency(projectInfo.revenue)} / ${formatCurrency(dataTaggedRevenue)}) × ${formatCurrency(batch.data_pool)}`,
          } : null,
          workplace: projectInfo.allocationTag === 'Wellness' ? {
            pool: batch.workplace_pool,
            taggedRevenue: wellnessTaggedRevenue,
            projectRevenue: projectInfo.revenue,
            sharePercent: wellnessTaggedRevenue > 0 ? (projectInfo.revenue / wellnessTaggedRevenue * 100) : 0,
            allocation: projectInfo.workplaceAllocation,
            formula: `(${formatCurrency(projectInfo.revenue)} / ${formatCurrency(wellnessTaggedRevenue)}) × ${formatCurrency(batch.workplace_pool)}`,
          } : null,
        };
      }
    }

    return NextResponse.json({
      success: true,
      project: projectInfo,
      hoursDetail: transformedHours,
      expensesDetail: transformedExpenses,
      allocationBreakdown,
    });
  } catch (error) {
    console.error('MPA detail GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
