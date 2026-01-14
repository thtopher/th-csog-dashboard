'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FileText, AlertTriangle, ChevronRight } from 'lucide-react';
import type { ProcessSummary, SOPStatus } from '@/types';

interface ProcessNavProps {
  processes: ProcessSummary[];
  selectedProcessId?: string;
  domainId: string;
}

export function ProcessNav({ processes, selectedProcessId, domainId }: ProcessNavProps) {
  return (
    <nav className="space-y-1">
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Processes
      </h3>
      {processes.map((process) => (
        <ProcessNavItem
          key={process.id}
          process={process}
          domainId={domainId}
          isSelected={process.id === selectedProcessId}
        />
      ))}
    </nav>
  );
}

interface ProcessNavItemProps {
  process: ProcessSummary;
  domainId: string;
  isSelected: boolean;
}

function ProcessNavItem({ process, domainId, isSelected }: ProcessNavItemProps) {
  const overallStatus = process.kpis[0]?.latestValue?.status || 'healthy';

  return (
    <Link
      href={`/domain/${domainId}/process/${process.id}`}
      className={cn(
        'group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
        isSelected
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <StatusBadge status={overallStatus} size="sm" />
        <span className="truncate">{process.name}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* SOP status indicator */}
        <SOPStatusIcon status={process.sopStatus} />

        {/* Gap count */}
        {process.activeGapsCount > 0 && (
          <span className="flex items-center gap-0.5 text-amber-600">
            <AlertTriangle size={12} />
            <span className="text-xs">{process.activeGapsCount}</span>
          </span>
        )}

        <ChevronRight
          size={14}
          className={cn(
            'text-gray-400 transition-transform',
            isSelected && 'text-gray-600'
          )}
        />
      </div>
    </Link>
  );
}

function SOPStatusIcon({ status }: { status: SOPStatus }) {
  const config: Record<SOPStatus, { color: string; title: string }> = {
    documented: { color: 'text-green-500', title: 'SOP documented' },
    partial: { color: 'text-amber-500', title: 'SOP partially documented' },
    missing: { color: 'text-gray-300', title: 'SOP missing' },
  };

  const { color, title } = config[status];

  return (
    <span title={title}>
      <FileText size={14} className={color} />
    </span>
  );
}
