'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUploadTypesForExecutive } from '@/config/uploadTypes';
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  TrendingUp,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnboardingBaselineProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface MonthUpload {
  month: string;
  uploaded: boolean;
  fileName?: string;
}

export function OnboardingBaseline({ onNext, onBack, onSkip }: OnboardingBaselineProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const uploadTypes = getUploadTypesForExecutive(user?.executiveId, isAdmin);

  // Get last 3 months
  const getLastThreeMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 3; i >= 1; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        uploaded: false,
      });
    }
    return months;
  };

  const [selectedType, setSelectedType] = useState(uploadTypes[0]?.id || '');
  const [months, setMonths] = useState<MonthUpload[]>(getLastThreeMonths());

  const handleFileUpload = (monthIndex: number, file: File) => {
    setMonths(prev => prev.map((m, i) =>
      i === monthIndex ? { ...m, uploaded: true, fileName: file.name } : m
    ));
  };

  const uploadedCount = months.filter(m => m.uploaded).length;
  const allUploaded = uploadedCount === 3;
  const selectedTypeInfo = uploadTypes.find(t => t.id === selectedType);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
          <TrendingUp size={24} className="text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Baseline Historical Data
        </h1>
        <p className="text-gray-600">
          Upload the last 3 months of data to enable trend comparisons
          and meaningful insights from day one.
        </p>
      </div>

      {/* Why Baseline Data Matters */}
      <div className="bg-blue-50 rounded-lg p-4 mb-8 flex items-start gap-3">
        <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Why is this important?</p>
          <p>
            With historical data, your dashboard can show trends, calculate averages,
            and highlight changes over time. Without it, you&apos;ll only see current numbers.
          </p>
        </div>
      </div>

      {/* Select Type */}
      {uploadTypes.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Select data type to upload
          </h2>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {uploadTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Month Upload Cards */}
      <div className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-gray-700">
          Upload {selectedTypeInfo?.name} for each month
        </h2>
        {months.map((month, index) => (
          <div
            key={month.month}
            className={cn(
              'flex items-center justify-between p-4 rounded-lg border-2',
              month.uploaded
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  month.uploaded ? 'bg-green-100' : 'bg-gray-100'
                )}
              >
                {month.uploaded ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <Calendar size={20} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{month.month}</p>
                {month.fileName && (
                  <p className="text-xs text-green-600">{month.fileName}</p>
                )}
              </div>
            </div>
            {month.uploaded ? (
              <span className="text-sm font-medium text-green-600">Uploaded</span>
            ) : (
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Choose File
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(index, e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{uploadedCount} of 3 months</span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              allUploaded ? 'bg-green-500' : 'bg-blue-500'
            )}
            style={{ width: `${(uploadedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex items-center gap-3">
          {!allUploaded && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {allUploaded ? 'Complete Setup' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
