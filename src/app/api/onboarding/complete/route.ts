import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';

/**
 * POST /api/onboarding/complete
 * Marks onboarding as complete for the current user
 */
export async function POST(request: Request) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const userEmail = body.email || 'demo@thirdhorizon.com';

    // In production, this would update the database
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      userEmail,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
