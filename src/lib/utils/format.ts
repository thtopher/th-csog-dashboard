import type { DisplayFormat, HealthStatus, TrendDirection } from '@/types';

/**
 * Format a value based on its display format
 */
export function formatValue(value: number, format: DisplayFormat): string {
  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'duration':
      return `${value.toFixed(1)} days`;
    case 'number':
    default:
      return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  }
}

/**
 * Get CSS class for health status
 */
export function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-amber-600 bg-amber-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get icon and label for trend direction
 */
export function getTrendInfo(direction: TrendDirection, isHigherBetter: boolean): {
  icon: string;
  label: string;
  colorClass: string;
} {
  const isPositive =
    (direction === 'up' && isHigherBetter) ||
    (direction === 'down' && !isHigherBetter);

  const icons = {
    up: '↑',
    down: '↓',
    flat: '→',
  };

  const labels = {
    up: 'Trending up',
    down: 'Trending down',
    flat: 'No change',
  };

  return {
    icon: icons[direction],
    label: labels[direction],
    colorClass: direction === 'flat'
      ? 'text-gray-500'
      : isPositive
        ? 'text-green-600'
        : 'text-red-600',
  };
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, style: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  if (style === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a date range for period display
 */
export function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${startStr} - ${endStr}`;
}

/**
 * Get week number from date
 */
export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}
