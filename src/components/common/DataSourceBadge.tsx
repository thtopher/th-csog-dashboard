'use client';

import { cn } from '@/lib/utils/cn';
import { Clock, Database, FileText, FileSpreadsheet, Pencil } from 'lucide-react';
import type { DataSource, DataSourceInfo } from '@/lib/utils/dataSourceMapping';
import { DATA_SOURCE_CONFIG } from '@/lib/utils/dataSourceMapping';

interface DataSourceBadgeProps {
  source: DataSource;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const ICONS: Record<DataSource, React.ComponentType<{ size?: number; className?: string }>> = {
  harvest: Clock,
  netsuite: Database,
  notion: FileText,
  excel: FileSpreadsheet,
  manual: Pencil,
};

export function DataSourceBadge({
  source,
  size = 'sm',
  showLabel = true,
  className
}: DataSourceBadgeProps) {
  const config = DATA_SOURCE_CONFIG[source];
  const Icon = ICONS[source];
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium',
        size === 'sm' ? 'text-[10px]' : 'text-xs',
        config.bgColor,
        config.color,
        className
      )}
      title={`Data from ${config.label}`}
    >
      <Icon size={iconSize} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

interface DataSourceBadgesProps {
  sources: DataSource[];
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}

export function DataSourceBadges({
  sources,
  size = 'sm',
  showLabels = true,
  className
}: DataSourceBadgesProps) {
  if (sources.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {sources.map((source) => (
        <DataSourceBadge
          key={source}
          source={source}
          size={size}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
}
