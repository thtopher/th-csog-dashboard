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
 * PUT /api/strategic-goals/order
 * Persist milestone sort orders per quarter.
 * Body: { orders: { Q1: ['id1','id2',...], Q2: [...], ... } }
 *
 * Stored as a single row in strategic_goal_progress with a special
 * milestone_id of '__sort_orders__' and the JSON in a text column.
 * This avoids needing a new table for a simple config value.
 */
export async function PUT(request: Request) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { orders } = body;

    if (!orders || typeof orders !== 'object') {
      return NextResponse.json({ error: 'Invalid orders' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('strategic_goal_progress')
      .upsert(
        {
          milestone_id: '__sort_orders__',
          progress: 0, // unused but required by schema
          updated_by: session.user?.email || 'unknown',
        },
        { onConflict: 'milestone_id' }
      );

    if (error) throw error;

    // Store the orders JSON in the updated row's metadata
    // Using a separate lightweight approach: store as a JSON string in a
    // dedicated row. We'll read it back in the GET endpoint.
    const { error: updateError } = await supabase
      .from('strategic_goal_progress')
      .update({ progress: 0, updated_by: JSON.stringify(orders) })
      .eq('milestone_id', '__sort_orders__');

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to save sort orders:', err);
    return NextResponse.json({ error: 'Failed to save orders' }, { status: 500 });
  }
}
