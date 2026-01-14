'use client';

import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendDirection, KPIDirection } from '@/types';

interface TrendIndicatorProps {
  direction: TrendDirection;
  kpiDirection: KPIDirection;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { icon: 12, text: 'text-xs' },
  md: { icon: 16, text: 'text-sm' },
  lg: { icon: 20, text: 'text-base' },
};

export function TrendIndicator({
  direction,
  kpiDirection,
  showLabel = false,
  size = 'md',
}: TrendIndicatorProps) {
  const isPositive =
    (direction === 'up' && kpiDirection === 'higher_better') ||
    (direction === 'down' && kpiDirection === 'lower_better');

  const isNeutral = direction === 'flat' || kpiDirection === 'target';

  const colorClass = isNeutral
    ? 'text-gray-500'
    : isPositive
      ? 'text-green-600'
      : 'text-red-600';

  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
  const label = direction === 'up' ? 'Up' : direction === 'down' ? 'Down' : 'Flat';

  const { icon: iconSize, text: textSize } = SIZE_CONFIG[size];

  return (
    <span className={cn('inline-flex items-center gap-1', colorClass)}>
      <Icon size={iconSize} />
      {showLabel && <span className={textSize}>{label}</span>}
    </span>
  );
}
