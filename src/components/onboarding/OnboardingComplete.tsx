'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, BarChart3, Upload, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnboardingCompleteProps {
  onComplete: () => void;
}

export function OnboardingComplete({ onComplete }: OnboardingCompleteProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleGoToDashboard = () => {
    onComplete();
    // Navigate based on user role
    if (user?.executiveId && user.executiveId !== 'exec-ceo') {
      router.push(`/executive/${user.executiveId}`);
    } else if (user?.role === 'admin' && !user?.executiveId) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <div className="absolute -right-2 -top-2">
          <Sparkles size={24} className="text-yellow-500" />
        </div>
      </div>

      {/* Congrats Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        You&apos;re All Set!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Welcome to your personalized dashboard, {user?.name?.split(' ')[0]}.
        Your data is ready and waiting for you.
      </p>

      {/* What's Next */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What you can do now:</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 shrink-0">
              <BarChart3 size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Your Dashboard</p>
              <p className="text-sm text-gray-500">
                See your KPIs, track performance, and monitor trends
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 shrink-0">
              <Upload size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Upload More Data</p>
              <p className="text-sm text-gray-500">
                Add additional data files anytime from the Upload page
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Pro tip:</span> Set a weekly reminder to upload your data.
          The dashboard is only as good as the data you provide!
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleGoToDashboard}
        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
