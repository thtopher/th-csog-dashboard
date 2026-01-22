import { NextResponse } from 'next/server';

/**
 * POST /api/onboarding/complete
 * Marks onboarding as complete for the current user
 */
export async function POST(request: Request) {
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
