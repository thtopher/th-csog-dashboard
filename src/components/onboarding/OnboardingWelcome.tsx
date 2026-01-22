'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getUploadTypesForExecutive } from '@/config/uploadTypes';
import { ArrowRight, FileSpreadsheet, BarChart3, Users } from 'lucide-react';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const uploadTypes = getUploadTypesForExecutive(user?.executiveId, isAdmin);

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Welcome Message */}
      <div className="mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
          <BarChart3 size={32} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to the Third Horizon CSOG Dashboard, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-lg text-gray-600">
          This dashboard helps you track and manage your key performance indicators.
          Let&apos;s get you set up with your data.
        </p>
      </div>

      {/* What You'll Do */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Here&apos;s what we&apos;ll cover:</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 shrink-0">
              <FileSpreadsheet size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Your Upload Requirements</p>
              <p className="text-sm text-gray-500">
                Review the {uploadTypes.length} data type{uploadTypes.length !== 1 ? 's' : ''} you&apos;ll need to provide
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 shrink-0">
              <BarChart3 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Your First Upload</p>
              <p className="text-sm text-gray-500">
                We&apos;ll walk you through uploading your first Excel file
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 shrink-0">
              <Users size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Baseline Data</p>
              <p className="text-sm text-gray-500">
                Upload 3 months of historical data for trend comparisons
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Role */}
      {user?.title && (
        <div className="mb-8 px-4 py-3 bg-blue-50 rounded-lg inline-block">
          <p className="text-sm text-blue-700">
            Logged in as <span className="font-semibold">{user.title}</span>
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Get Started
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
