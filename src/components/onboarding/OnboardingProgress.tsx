'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function OnboardingProgress({ currentStep, totalSteps, steps }: OnboardingProgressProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-8">
        {/* Background Track */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />

        {/* Progress Fill */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isPending = stepNumber > currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                    isCompleted && 'bg-blue-600 text-white',
                    isCurrent && 'bg-blue-600 text-white ring-4 ring-blue-100',
                    isPending && 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  )}
                >
                  {isCompleted ? <Check size={16} /> : stepNumber}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    (isCompleted || isCurrent) ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
