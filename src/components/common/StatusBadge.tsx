'use client';

import { cn } from '@/lib/utils/cn';
import type { HealthStatus } from '@/types';

interface StatusBadgeProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<HealthStatus, { label: string; className: string }> = {
  healthy: {
    label: 'Healthy',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  warning: {
    label: 'Warning',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

const SIZE_CLASSES = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export function StatusBadge({ status, size = 'md', showLabel = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          config.className
        )}
      >
        <span className={cn('rounded-full bg-current', SIZE_CLASSES.sm)} />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn('inline-block rounded-full', SIZE_CLASSES[size], config.className)}
      title={config.label}
    />
  );
}
