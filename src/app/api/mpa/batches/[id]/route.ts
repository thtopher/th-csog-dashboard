/**
 * MPA Single Batch API
 *
 * GET /api/mpa/batches/[id] - Get batch details and summary
 * PATCH /api/mpa/batches/[id] - Update batch (e.g., file paths)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

    // Transform to camelCase
    const transformed = {
      id: batch.id,
      periodId: batch.period_id,
      monthName: batch.month_name,
      status: batch.status,
      errorMessage: batch.error_message,
      proformaFilePath: batch.proforma_file_path,
      compensationFilePath: batch.compensation_file_path,
      hoursFilePath: batch.hours_file_path,
      expensesFilePath: batch.expenses_file_path,
      pnlFilePath: batch.pnl_file_path,
      totalRevenue: batch.total_revenue,
      totalLaborCost: batch.total_labor_cost,
      totalExpenseCost: batch.total_expense_cost,
      totalMarginDollars: batch.total_margin_dollars,
      overallMarginPercent: batch.overall_margin_percent,
      sgaPool: batch.sga_pool,
      dataPool: batch.data_pool,
      workplacePool: batch.workplace_pool,
      revenueCenterCount: batch.revenue_center_count,
      costCenterCount: batch.cost_center_count,
      nonRevenueClientCount: batch.non_revenue_client_count,
      validationPassed: batch.validation_passed,
      validationErrors: batch.validation_errors,
      createdBy: batch.created_by,
      createdAt: batch.created_at,
      processedAt: batch.processed_at,
    };

    return NextResponse.json({ success: true, batch: transformed });
  } catch (error) {
    console.error('MPA batch GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseClient();

    // Build update object, converting camelCase to snake_case
    const updateData: Record<string, unknown> = {};

    if (body.proformaFilePath !== undefined) {
      updateData.proforma_file_path = body.proformaFilePath;
    }
    if (body.compensationFilePath !== undefined) {
      updateData.compensation_file_path = body.compensationFilePath;
    }
    if (body.hoursFilePath !== undefined) {
      updateData.hours_file_path = body.hoursFilePath;
    }
    if (body.expensesFilePath !== undefined) {
      updateData.expenses_file_path = body.expensesFilePath;
    }
    if (body.pnlFilePath !== undefined) {
      updateData.pnl_file_path = body.pnlFilePath;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const { data: batch, error } = await supabase
      .from('mpa_analysis_batches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating batch:', error);
      return NextResponse.json(
        { error: 'Failed to update batch' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, batch });
  } catch (error) {
    console.error('MPA batch PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
