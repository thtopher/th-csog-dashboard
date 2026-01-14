'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { formatValue, formatDate } from '@/lib/utils/format';
import type { KPIDetail, ChartType, DisplayFormat } from '@/types';

interface KPIChartProps {
  kpi: KPIDetail;
  height?: number;
  showTarget?: boolean;
  showThresholds?: boolean;
}

export function KPIChart({
  kpi,
  height = 200,
  showTarget = true,
  showThresholds = false,
}: KPIChartProps) {
  const chartData = kpi.values.map((v) => ({
    date: formatDate(v.periodStart),
    value: v.value,
    status: v.status,
  }));

  const chartColor =
    kpi.values[0]?.status === 'critical'
      ? '#dc2626'
      : kpi.values[0]?.status === 'warning'
        ? '#d97706'
        : '#16a34a';

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{kpi.name}</h4>
          {kpi.description && (
            <p className="mt-0.5 text-sm text-gray-500">{kpi.description}</p>
          )}
        </div>
        {kpi.values[0] && (
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-900">
              {formatValue(kpi.values[0].value, kpi.displayFormat)}
            </p>
            <p className="text-xs text-gray-500">Latest value</p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {renderChart(kpi.chartType, chartData, chartColor, kpi.displayFormat, {
          target: showTarget ? kpi.targetValue : undefined,
          warning: showThresholds ? kpi.warningThreshold : undefined,
          critical: showThresholds ? kpi.criticalThreshold : undefined,
        })}
      </ResponsiveContainer>

      {/* Legend for thresholds */}
      {(showTarget || showThresholds) && (
        <div className="mt-3 flex items-center gap-4 text-xs">
          {showTarget && kpi.targetValue !== undefined && (
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 bg-green-500" style={{ borderStyle: 'dashed' }} />
              <span className="text-gray-500">
                Target: {formatValue(kpi.targetValue, kpi.displayFormat)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderChart(
  type: ChartType,
  data: { date: string; value: number; status?: string }[],
  color: string,
  format: DisplayFormat,
  thresholds: { target?: number; warning?: number; critical?: number }
) {
  const commonProps = {
    data,
    margin: { top: 5, right: 5, left: 5, bottom: 5 },
  };

  const formatTooltip = (value: number) => formatValue(value, format);

  switch (type) {
    case 'line':
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip formatter={formatTooltip} />
          {thresholds.target !== undefined && (
            <ReferenceLine y={thresholds.target} stroke="#16a34a" strokeDasharray="5 5" />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );

    case 'area':
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip formatter={formatTooltip} />
          {thresholds.target !== undefined && (
            <ReferenceLine y={thresholds.target} stroke="#16a34a" strokeDasharray="5 5" />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`${color}20`}
            strokeWidth={2}
          />
        </AreaChart>
      );

    case 'bar':
    default:
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip formatter={formatTooltip} />
          {thresholds.target !== undefined && (
            <ReferenceLine y={thresholds.target} stroke="#16a34a" strokeDasharray="5 5" />
          )}
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      );
  }
}
