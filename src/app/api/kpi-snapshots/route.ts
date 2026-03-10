import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth/helpers';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * GET /api/kpi-snapshots
 * Returns all KPI snapshots ordered by date.
 */
export async function GET() {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('kpi_snapshots')
      .select('kpi_id, value, date, note, updated_by, created_at')
      .order('date', { ascending: true });

    if (error) throw error;

    const snapshots = (data || []).map((row) => ({
      kpiId: row.kpi_id,
      value: Number(row.value),
      date: row.date,
      note: row.note,
    }));

    return NextResponse.json({ snapshots });
  } catch (err) {
    console.error('Failed to fetch KPI snapshots:', err);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kpi-snapshots
 * Add a new KPI snapshot.
 * Body: { kpiId: string, value: number, date: string, note?: string }
 */
export async function POST(request: Request) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { kpiId, value, date, note } = body;

    if (!kpiId || typeof value !== 'number' || !date) {
      return NextResponse.json(
        { error: 'kpiId, value, and date are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('kpi_snapshots')
      .insert({
        kpi_id: kpiId,
        value,
        date,
        note: note || null,
        updated_by: session.user?.email || 'unknown',
      });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to save KPI snapshot:', err);
    return NextResponse.json(
      { error: 'Failed to save snapshot' },
      { status: 500 }
    );
  }
}
