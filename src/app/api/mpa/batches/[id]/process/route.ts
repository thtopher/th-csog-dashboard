/**
 * MPA Process Trigger API
 *
 * POST /api/mpa/batches/[id]/process - Process uploaded files
 *
 * Runs the full Monthly Performance Analysis pipeline:
 * 1. Download files from Supabase Storage
 * 2. Parse Excel files and extract data
 * 3. Classify projects into revenue/cost/non-revenue
 * 4. Calculate labor and expense costs
 * 5. Allocate overhead pools
 * 6. Calculate margins
 * 7. Run validation checks
 * 8. Save results to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runAnalysis } from '@/lib/mpa';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const supabase = getSupabaseClient();

    // Get batch to verify it exists and has files
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

    // Verify all files are present
    const requiredFiles = [
      'proforma_file_path',
      'compensation_file_path',
      'hours_file_path',
      'expenses_file_path',
      'pnl_file_path',
    ];
    const missingFiles = requiredFiles.filter((f) => !batch[f]);
    if (missingFiles.length > 0) {
      return NextResponse.json(
        { error: `Missing files: ${missingFiles.join(', ')}` },
        { status: 400 }
      );
    }

    // Update status to processing
    await supabase
      .from('mpa_analysis_batches')
      .update({ status: 'processing' })
      .eq('id', id);

    // Run the analysis pipeline
    const result = await runAnalysis(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('MPA process POST error:', error);

    // Try to update batch status to failed
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('mpa_analysis_batches')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Processing failed',
        })
        .eq('id', id);
    } catch {
      // Ignore update error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
