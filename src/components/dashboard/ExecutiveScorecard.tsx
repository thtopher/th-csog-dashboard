'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  getScorecardConfig,
  getMetricStatus,
  type MetricStatus,
  type ScorecardMetric,
} from '@/config/executiveScorecards';
import { BarChart3, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

interface ExecutiveScorecardProps {
  executiveId: string;
}

interface MetricValue {
  metricId: string;
  value: number | undefined;
  trend?: 'up' | 'down' | 'flat';
  previousValue?: number;
}

export function ExecutiveScorecard({ executiveId }: ExecutiveScorecardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [metricValues, setMetricValues] = useState<Record<string, MetricValue>>({});

  const config = getScorecardConfig(executiveId);

  useEffect(() => {
    if (config) {
      loadMetricValues();
    }
  }, [executiveId, config]);

  async function loadMetricValues() {
    setIsLoading(true);
    try {
      // Fetch real metrics from the API
      const response = await fetch(`/api/metrics?executiveId=${executiveId}`);

      if (response.ok) {
        const data = await response.json();
        // Use real data from database (may be empty)
        setMetricValues(data.metrics || {});
      } else {
        // No data available - show empty state
        setMetricValues({});
      }
    } catch (error) {
      console.error('Error loading metric values:', error);
      // On error, show empty state rather than fake data
      setMetricValues({});
    } finally {
      setIsLoading(false);
    }
  }

  if (!config) {
    return null;
  }

  if (isLoading) {
    return <ExecutiveScorecardSkeleton title={config.title} />;
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
        </div>
      </div>

      {/* Categories */}
      <div className="p-5">
        <div className="space-y-6">
          {config.categories.map((category) => (
            <div key={category.id}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {category.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.metrics.map((metric) => {
                  const metricData = metricValues[metric.id];
                  const status = getMetricStatus(metricData?.value, metric);

                  return (
                    <MetricCard
                      key={metric.id}
                      metric={metric}
                      value={metricData?.value}
                      trend={metricData?.trend}
                      status={status}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  metric: ScorecardMetric;
  value: number | undefined;
  trend?: 'up' | 'down' | 'flat';
  status: MetricStatus;
}

function MetricCard({ metric, value, trend, status }: MetricCardProps) {
  const statusColors: Record<MetricStatus, string> = {
    green: 'border-l-green-500 bg-green-50/50',
    amber: 'border-l-amber-500 bg-amber-50/50',
    red: 'border-l-red-500 bg-red-50/50',
    gray: 'border-l-gray-300 bg-gray-50/50',
  };

  const statusDots: Record<MetricStatus, string> = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400';

  const formatValue = (val: number | undefined, unit?: string): string => {
    if (val === undefined) return '—';

    if (unit === '$') {
      return val >= 1000000
        ? `$${(val / 1000000).toFixed(1)}M`
        : val >= 1000
        ? `$${(val / 1000).toFixed(0)}K`
        : `$${val.toLocaleString()}`;
    }

    if (unit === '%') {
      return `${val}%`;
    }

    if (unit) {
      return `${val}${unit}`;
    }

    return val.toLocaleString();
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 p-3 transition-colors',
        statusColors[status]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{metric.name}</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {formatValue(value, metric.unit)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {trend && (
            <TrendIcon size={14} className={trendColor} />
          )}
          <span className={cn('h-2.5 w-2.5 rounded-full', statusDots[status])} />
        </div>
      </div>
      {metric.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{metric.description}</p>
      )}
    </div>
  );
}

function ExecutiveScorecardSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-5 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-gray-400" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    </div>
  );
}

