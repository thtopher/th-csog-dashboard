'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TrendIndicator } from '@/components/common/TrendIndicator';
import { formatValue } from '@/lib/utils/format';
import {
  TrendingUp,
  Briefcase,
  CheckCircle,
  DollarSign,
  Settings,
  Users,
  AlertTriangle,
} from 'lucide-react';
import type { DomainSummary, KPISummary } from '@/types';

interface DomainTileProps {
  domain: DomainSummary;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  'trending-up': TrendingUp,
  briefcase: Briefcase,
  'check-circle': CheckCircle,
  'dollar-sign': DollarSign,
  settings: Settings,
  users: Users,
};

export function DomainTile({ domain }: DomainTileProps) {
  const Icon = ICON_MAP[domain.iconName || ''] || Briefcase;

  return (
    <Link
      href={`/domain/${domain.id}`}
      className={cn(
        'group relative flex flex-col rounded-lg border bg-white p-5 shadow-sm transition-all',
        'hover:shadow-md hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        domain.overallStatus === 'critical' && 'border-red-200',
        domain.overallStatus === 'warning' && 'border-amber-200'
      )}
      style={{ '--domain-color': domain.colorHex } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${domain.colorHex}15` }}
          >
            <Icon size={20} style={{ color: domain.colorHex }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{domain.shortName}</h3>
            {domain.stewardName && (
              <p className="text-xs text-gray-500">Steward: {domain.stewardName}</p>
            )}
          </div>
        </div>
        <StatusBadge status={domain.overallStatus} showLabel />
      </div>

      {/* Primary KPIs */}
      <div className="flex-1 space-y-3">
        {domain.primaryKpis.length > 0 ? (
          domain.primaryKpis.slice(0, 3).map((kpi) => (
            <KPIRow key={kpi.id} kpi={kpi} />
          ))
        ) : (
          <p className="text-sm text-gray-400 italic">No KPIs configured</p>
        )}
      </div>

      {/* Footer */}
      {domain.activeGapsCount > 0 && (
        <div className="mt-4 flex items-center gap-1.5 text-amber-600 text-xs">
          <AlertTriangle size={14} />
          <span>{domain.activeGapsCount} active gap{domain.activeGapsCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Hover effect bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg opacity-0 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: domain.colorHex }}
      />
    </Link>
  );
}

function KPIRow({ kpi }: { kpi: KPISummary }) {
  const latestValue = kpi.latestValue;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 truncate mr-2">{kpi.shortName}</span>
      <div className="flex items-center gap-2">
        {latestValue ? (
          <>
            <span className="text-sm font-medium text-gray-900">
              {formatValue(latestValue.value, kpi.displayFormat)}
            </span>
            {latestValue.trendDirection && (
              <TrendIndicator
                direction={latestValue.trendDirection}
                kpiDirection={kpi.direction}
                size="sm"
              />
            )}
          </>
        ) : (
          <span className="text-sm text-gray-400">--</span>
        )}
      </div>
    </div>
  );
}
