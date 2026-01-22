'use client';

import { cn } from '@/lib/utils/cn';
import { Check, Clock, AlertTriangle, CalendarClock } from 'lucide-react';
import type { UploadStatus } from '@/types';

interface UploadStatusBadgeProps {
  status: UploadStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<UploadStatus, {
  label: string;
  className: string;
  dotClass: string;
  icon: typeof Check;
}> = {
  completed: {
    label: 'Complete',
    className: 'bg-green-100 text-green-700 border-green-200',
    dotClass: 'bg-green-500',
    icon: Check,
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    icon: Clock,
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-100 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    icon: AlertTriangle,
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
    icon: CalendarClock,
  },
};

const SIZE_CLASSES = {
  sm: {
    badge: 'px-1.5 py-0.5 text-[10px]',
    dot: 'h-1.5 w-1.5',
    icon: 10,
  },
  md: {
    badge: 'px-2 py-0.5 text-xs',
    dot: 'h-2 w-2',
    icon: 12,
  },
  lg: {
    badge: 'px-2.5 py-1 text-sm',
    dot: 'h-2.5 w-2.5',
    icon: 14,
  },
};

export function UploadStatusBadge({
  status,
  size = 'md',
  showLabel = true,
  showIcon = false,
}: UploadStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CLASSES[size];
  const Icon = config.icon;

  if (!showLabel) {
    return (
      <span
        className={cn('inline-block rounded-full', sizeConfig.dot, config.dotClass)}
        title={config.label}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        sizeConfig.badge,
        config.className
      )}
    >
      {showIcon ? (
        <Icon size={sizeConfig.icon} />
      ) : (
        <span className={cn('rounded-full', sizeConfig.dot, config.dotClass)} />
      )}
      {config.label}
    </span>
  );
}

export function UploadStatusDot({ status, size = 'md' }: { status: UploadStatus; size?: 'sm' | 'md' | 'lg' }) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CLASSES[size];

  return (
    <span
      className={cn('inline-block rounded-full', sizeConfig.dot, config.dotClass)}
      title={config.label}
    />
  );
}
