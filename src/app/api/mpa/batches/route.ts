/**
 * MPA Batches API
 *
 * POST /api/mpa/batches - Create a new batch with file upload URLs
 * GET /api/mpa/batches - List batches for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'uploads';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthName, periodId, createdBy } = body;

    if (!monthName || !createdBy) {
      return NextResponse.json(
        { error: 'monthName and createdBy are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from('mpa_analysis_batches')
      .insert({
        month_name: monthName,
        period_id: periodId || null,
        created_by: createdBy,
        status: 'pending',
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch:', batchError);
      return NextResponse.json(
        { error: 'Failed to create batch' },
        { status: 500 }
      );
    }

    // Generate file upload paths
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileTypes = ['proforma', 'compensation', 'hours', 'expenses', 'pnl'] as const;
    const uploadPaths: Record<string, string> = {};

    for (const fileType of fileTypes) {
      uploadPaths[fileType] = `mpa_${fileType}/${timestamp}_${batch.id}`;
    }

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        monthName: batch.month_name,
        status: batch.status,
        createdAt: batch.created_at,
      },
      uploadPaths,
    });
  } catch (error) {
    console.error('MPA batches POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const isAdmin = searchParams.get('admin') === 'true';

    const supabase = getSupabaseClient();

    let query = supabase
      .from('mpa_analysis_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by user unless admin
    if (!isAdmin && email) {
      query = query.eq('created_by', email);
    }

    const { data: batches, error } = await query;

    if (error) {
      console.error('Error fetching batches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch batches' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformed = (batches || []).map((batch) => ({
      id: batch.id,
      periodId: batch.period_id,
      monthName: batch.month_name,
      status: batch.status,
      errorMessage: batch.error_message,
      totalRevenue: batch.total_revenue,
      totalMarginDollars: batch.total_margin_dollars,
      overallMarginPercent: batch.overall_margin_percent,
      sgaPool: batch.sga_pool,
      dataPool: batch.data_pool,
      workplacePool: batch.workplace_pool,
      revenueCenterCount: batch.revenue_center_count,
      costCenterCount: batch.cost_center_count,
      nonRevenueClientCount: batch.non_revenue_client_count,
      validationPassed: batch.validation_passed,
      createdBy: batch.created_by,
      createdAt: batch.created_at,
      processedAt: batch.processed_at,
    }));

    return NextResponse.json({ success: true, batches: transformed });
  } catch (error) {
    console.error('MPA batches GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
