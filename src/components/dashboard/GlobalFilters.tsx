'use client';

import { cn } from '@/lib/utils/cn';
import { Calendar, RefreshCw } from 'lucide-react';
import { TIME_WINDOWS } from '@/config/domains';
import type { PeriodType } from '@/types';

interface GlobalFiltersProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function GlobalFilters({
  selectedPeriod,
  onPeriodChange,
  lastUpdated,
  onRefresh,
  isRefreshing,
}: GlobalFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Time Window Selector */}
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-500" />
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          {TIME_WINDOWS.map((window) => (
            <button
              key={window.value}
              onClick={() => onPeriodChange(window.value as PeriodType)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                selectedPeriod === window.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              {window.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Last updated + Refresh */}
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors',
              'hover:bg-gray-50 hover:text-gray-900',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw size={14} className={cn(isRefreshing && 'animate-spin')} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
