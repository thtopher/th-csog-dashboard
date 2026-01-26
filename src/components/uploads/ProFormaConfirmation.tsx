'use client';

import { useState } from 'react';
import { X, DollarSign, TrendingUp, Wallet } from 'lucide-react';

export interface ProFormaMetrics {
  cashProjection6Mo: number | null;
  baseRevenue: number | null;
  netIncomeMargin: number | null;
}

interface ProFormaConfirmationProps {
  uploadId: string;
  fileName: string;
  onConfirm: (metrics: ProFormaMetrics) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProFormaConfirmation({
  uploadId,
  fileName,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: ProFormaConfirmationProps) {
  const [metrics, setMetrics] = useState<ProFormaMetrics>({
    cashProjection6Mo: null,
    baseRevenue: null,
    netIncomeMargin: null,
  });

  const isValid = () => {
    // At least one value should be provided
    return (
      metrics.cashProjection6Mo !== null ||
      metrics.baseRevenue !== null ||
      metrics.netIncomeMargin !== null
    );
  };

  const handleSubmit = () => {
    if (isValid()) {
      onConfirm(metrics);
    }
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Confirm Pro Forma Values
          </h2>
          <button
            onClick={onCancel}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          Please enter the key values from <span className="font-medium">{fileName}</span>.
          These numbers will be tracked over time to show trends.
        </p>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* 6-Month Cash Projection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Wallet size={16} className="text-blue-500" />
              6-Month Cash Projection
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={metrics.cashProjection6Mo ?? ''}
                onChange={(e) =>
                  setMetrics((m) => ({
                    ...m,
                    cashProjection6Mo: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="e.g., 271000"
                className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              From Cash Tracker sheet - anticipated balance ~6 months out
            </p>
          </div>

          {/* Base Revenue (EOY Forecast) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <TrendingUp size={16} className="text-green-500" />
              Base Revenue (EOY Forecast)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={metrics.baseRevenue ?? ''}
                onChange={(e) =>
                  setMetrics((m) => ({
                    ...m,
                    baseRevenue: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="e.g., 5866000"
                className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              From Pro Forma sheet - total base revenue projection for the year
            </p>
          </div>

          {/* Net Income / Margin */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <DollarSign size={16} className="text-purple-500" />
              Net Income / Margin
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={metrics.netIncomeMargin ?? ''}
                onChange={(e) =>
                  setMetrics((m) => ({
                    ...m,
                    netIncomeMargin: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="e.g., -2100000 or 573000"
                className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              From Pro Forma sheet - projected net income (can be negative)
            </p>
          </div>
        </div>

        {/* Preview of entered values */}
        {isValid() && (
          <div className="mt-5 rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Values to save:</p>
            <div className="space-y-1 text-sm">
              {metrics.cashProjection6Mo !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">6-Mo Cash:</span>
                  <span className="font-medium">{formatCurrency(metrics.cashProjection6Mo)}</span>
                </div>
              )}
              {metrics.baseRevenue !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Revenue:</span>
                  <span className="font-medium">{formatCurrency(metrics.baseRevenue)}</span>
                </div>
              )}
              {metrics.netIncomeMargin !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Income:</span>
                  <span className={`font-medium ${metrics.netIncomeMargin < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(metrics.netIncomeMargin)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid() || isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Values'}
          </button>
        </div>
      </div>
    </div>
  );
}
