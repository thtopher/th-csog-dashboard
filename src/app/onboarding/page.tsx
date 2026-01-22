'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { OnboardingUpload } from '@/components/onboarding/OnboardingUpload';
import { OnboardingBaseline } from '@/components/onboarding/OnboardingBaseline';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';
import { Loader2 } from 'lucide-react';

const STEPS = ['Welcome', 'Checklist', 'Upload', 'Baseline', 'Complete'];

export default function OnboardingPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingState, setOnboardingState] = useState<{
    completed: boolean;
    currentStep: number;
    stepsCompleted: string[];
  } | null>(null);

  // Check auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load onboarding state
  useEffect(() => {
    if (isAuthenticated && user) {
      loadOnboardingState();
    }
  }, [isAuthenticated, user]);

  async function loadOnboardingState() {
    try {
      const res = await fetch('/api/onboarding/state');
      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          // Already completed, redirect to dashboard
          router.push('/');
          return;
        }
        setOnboardingState(data);
        setCurrentStep(data.currentStep || 1);
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveProgress(step: number, completed: boolean = false) {
    try {
      await fetch('/api/onboarding/state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: step,
          stepCompleted: STEPS[step - 1],
          completed,
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step);
    saveProgress(step);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await saveProgress(STEPS.length, true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Third Horizon Logo"
              width={36}
              height={36}
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Third Horizon</h1>
              <p className="text-xs text-gray-500">Getting Started</p>
            </div>
          </div>
          {currentStep < STEPS.length && (
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip Setup
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <OnboardingWelcome onNext={nextStep} />
          )}
          {currentStep === 2 && (
            <OnboardingChecklist onNext={nextStep} onBack={prevStep} />
          )}
          {currentStep === 3 && (
            <OnboardingUpload onNext={nextStep} onBack={prevStep} onSkip={nextStep} />
          )}
          {currentStep === 4 && (
            <OnboardingBaseline onNext={nextStep} onBack={prevStep} onSkip={nextStep} />
          )}
          {currentStep === 5 && (
            <OnboardingComplete onComplete={handleComplete} />
          )}
        </div>
      </main>
    </div>
  );
}
