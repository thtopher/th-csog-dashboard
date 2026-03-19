import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';

const UPSTREAM = 'https://th-team-calendar.vercel.app';

/**
 * GET /api/calendar/sync-status
 * Proxy to the team calendar's sync status API.
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const res = await fetch(`${UPSTREAM}/api/sync/status`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Calendar sync-status proxy error:', err);
    return NextResponse.json(
      { error: 'Unable to fetch sync status' },
      { status: 502 }
    );
  }
}
