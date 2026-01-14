'use client';

import { cn } from '@/lib/utils/cn';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
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

interface DomainFilterProps {
  domains: { id: string; name: string }[];
  selectedDomains: string[];
  onSelectionChange: (domains: string[]) => void;
}

export function DomainFilter({
  domains,
  selectedDomains,
  onSelectionChange,
}: DomainFilterProps) {
  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      onSelectionChange(selectedDomains.filter((id) => id !== domainId));
    } else {
      onSelectionChange([...selectedDomains, domainId]);
    }
  };

  const selectAll = () => onSelectionChange(domains.map((d) => d.id));
  const clearAll = () => onSelectionChange([]);

  return (
    <div className="flex items-center gap-3">
      <Filter size={16} className="text-gray-500" />
      <div className="flex flex-wrap items-center gap-2">
        {domains.map((domain) => (
          <button
            key={domain.id}
            onClick={() => toggleDomain(domain.id)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
              selectedDomains.includes(domain.id)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {domain.name}
          </button>
        ))}
        <span className="text-gray-300 mx-1">|</span>
        <button
          onClick={selectAll}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          All
        </button>
        <button
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          None
        </button>
      </div>
    </div>
  );
}
