import { NextResponse } from 'next/server';

// In-memory store for demo (replace with Supabase in production)
const onboardingStates = new Map<string, {
  userEmail: string;
  executiveId?: string;
  currentStep: number;
  stepsCompleted: string[];
  startedAt: string;
  completedAt?: string;
}>();

/**
 * GET /api/onboarding/state
 * Returns the onboarding state for the current user
 */
export async function GET(request: Request) {
  try {
    // Get user email from header (set by middleware in production)
    // For demo, we'll use a query param or default
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email') || 'demo@thirdhorizon.com';

    const state = onboardingStates.get(userEmail);

    if (!state) {
      // New user, create initial state
      const newState = {
        userEmail,
        currentStep: 1,
        stepsCompleted: [],
        startedAt: new Date().toISOString(),
        completed: false,
      };
      return NextResponse.json(newState);
    }

    return NextResponse.json({
      ...state,
      completed: !!state.completedAt,
    });
  } catch (error) {
    console.error('Error getting onboarding state:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding state' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/onboarding/state
 * Updates the onboarding state for the current user
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { currentStep, stepCompleted, completed } = body;

    // Get user email (from auth in production)
    const userEmail = body.email || 'demo@thirdhorizon.com';

    let state = onboardingStates.get(userEmail);

    if (!state) {
      state = {
        userEmail,
        currentStep: 1,
        stepsCompleted: [],
        startedAt: new Date().toISOString(),
      };
    }

    // Update state
    if (currentStep !== undefined) {
      state.currentStep = currentStep;
    }

    if (stepCompleted && !state.stepsCompleted.includes(stepCompleted)) {
      state.stepsCompleted.push(stepCompleted);
    }

    if (completed) {
      state.completedAt = new Date().toISOString();
    }

    onboardingStates.set(userEmail, state);

    return NextResponse.json({
      ...state,
      completed: !!state.completedAt,
    });
  } catch (error) {
    console.error('Error updating onboarding state:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding state' },
      { status: 500 }
    );
  }
}
