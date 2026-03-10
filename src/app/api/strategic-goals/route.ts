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
 * GET /api/strategic-goals
 * Returns all milestone progress overrides from the database.
 */
export async function GET() {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('strategic_goal_progress')
      .select('milestone_id, progress, updated_by, updated_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Separate progress values from sort orders
    const progressMap: Record<string, number> = {};
    let orders: Record<string, string[]> = {};

    for (const row of data || []) {
      if (row.milestone_id === '__sort_orders__') {
        // Sort orders stored as JSON in updated_by field
        try { orders = JSON.parse(row.updated_by || '{}'); } catch { /* */ }
      } else {
        progressMap[row.milestone_id] = row.progress;
      }
    }

    return NextResponse.json({ progress: progressMap, orders });
  } catch (err) {
    console.error('Failed to fetch strategic goal progress:', err);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/strategic-goals
 * Upsert a milestone's progress value.
 * Body: { milestoneId: string, progress: number }
 */
export async function PUT(request: Request) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { milestoneId, progress } = body;

    if (!milestoneId || typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Invalid milestoneId or progress (0-100)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('strategic_goal_progress')
      .upsert(
        {
          milestone_id: milestoneId,
          progress,
          updated_by: session.user?.email || 'unknown',
        },
        { onConflict: 'milestone_id' }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update strategic goal progress:', err);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
