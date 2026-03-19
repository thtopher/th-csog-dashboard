import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';

const UPSTREAM = 'https://th-team-calendar.vercel.app';

/**
 * GET /api/calendar/events
 * Proxy to the team calendar's events API.
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const res = await fetch(`${UPSTREAM}/api/events`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (err) {
    console.error('Calendar proxy error:', err);
    return NextResponse.json(
      { error: 'Unable to load calendar data' },
      { status: 502 }
    );
  }
}
