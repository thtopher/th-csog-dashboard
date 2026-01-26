import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors when env vars aren't available
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

interface ProFormaMetrics {
  cashProjection6Mo: number | null;
  baseRevenue: number | null;
  netIncomeMargin: number | null;
}

/**
 * POST /api/data/proforma-confirm
 *
 * Saves manually confirmed Pro Forma values as calculated metrics.
 * These values are entered by the user after uploading the Pro Forma workbook.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      uploadId,
      metrics,
      executiveId,
      uploaderEmail,
      uploaderName,
    }: {
      uploadId: string;
      metrics: ProFormaMetrics;
      executiveId?: string;
      uploaderEmail?: string;
      uploaderName?: string;
    } = body;

    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const periodEnd = now.toISOString().split('T')[0];
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const metricsToInsert: {
      metric_id: string;
      executive_id: string | undefined;
      value: number;
      source_upload_id: string;
      calculated_at: string;
      period_start: string;
      period_end: string;
      details: Record<string, unknown> | null;
    }[] = [];

    // Build metrics to insert
    if (metrics.cashProjection6Mo !== null) {
      metricsToInsert.push({
        metric_id: 'cash_projection_6mo',
        executive_id: executiveId || 'exec-cfo',
        value: metrics.cashProjection6Mo,
        source_upload_id: uploadId,
        calculated_at: now.toISOString(),
        period_start: periodStart,
        period_end: periodEnd,
        details: { enteredBy: uploaderEmail, method: 'manual_confirmation' },
      });
    }

    if (metrics.baseRevenue !== null) {
      metricsToInsert.push({
        metric_id: 'base_revenue',
        executive_id: executiveId || 'exec-cfo',
        value: metrics.baseRevenue,
        source_upload_id: uploadId,
        calculated_at: now.toISOString(),
        period_start: periodStart,
        period_end: periodEnd,
        details: { enteredBy: uploaderEmail, method: 'manual_confirmation' },
      });
    }

    if (metrics.netIncomeMargin !== null) {
      metricsToInsert.push({
        metric_id: 'net_income_margin',
        executive_id: executiveId || 'exec-cfo',
        value: metrics.netIncomeMargin,
        source_upload_id: uploadId,
        calculated_at: now.toISOString(),
        period_start: periodStart,
        period_end: periodEnd,
        details: { enteredBy: uploaderEmail, method: 'manual_confirmation' },
      });
    }

    if (metricsToInsert.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one metric value is required' },
        { status: 400 }
      );
    }

    // Insert metrics into database
    const { error: metricsError } = await getSupabase()
      .from('calculated_metrics')
      .insert(metricsToInsert);

    if (metricsError) {
      console.error('Failed to save Pro Forma metrics:', metricsError);
      return NextResponse.json(
        { success: false, error: 'Failed to save metrics' },
        { status: 500 }
      );
    }

    console.log(`Saved ${metricsToInsert.length} Pro Forma metrics:`,
      metricsToInsert.map(m => `${m.metric_id}=${m.value}`).join(', '));

    return NextResponse.json({
      success: true,
      metricsCount: metricsToInsert.length,
      metrics: metricsToInsert.map(m => ({ id: m.metric_id, value: m.value })),
    });
  } catch (error) {
    console.error('Pro Forma confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
