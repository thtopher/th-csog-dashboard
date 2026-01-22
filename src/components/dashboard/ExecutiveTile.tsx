'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { ExecutiveSummary, HealthStatus } from '@/types';
import { CodeTooltip } from '@/components/common/CodeTooltip';
import { Avatar } from '@/components/common/Avatar';
import {
  ChevronRight,
  Briefcase,
  Shield,
  AlertCircle,
} from 'lucide-react';

interface ExecutiveTileProps {
  executive: ExecutiveSummary;
}

export function ExecutiveTile({ executive }: ExecutiveTileProps) {
  const statusColors: Record<HealthStatus, string> = {
    healthy: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusLabels: Record<HealthStatus, string> = {
    healthy: 'On Track',
    warning: 'Needs Attention',
    critical: 'Critical',
  };

  return (
    <Link
      href={`/executive/${executive.id}`}
      className="block rounded-lg border bg-white p-4 hover:shadow-md transition-all hover:border-gray-300"
    >
      {/* Executive Info */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          executiveId={executive.id}
          name={executive.name}
          size="lg"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{executive.name}</h3>
            <div
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0',
                statusColors[executive.overallStatus]
              )}
            >
              {statusLabels[executive.overallStatus]}
            </div>
          </div>
          <p className="text-sm text-gray-500">{executive.title}</p>
          <p className="text-xs text-gray-400">{executive.role}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Briefcase size={12} />
            <span className="text-xs">Processes</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {executive.processCount}
          </span>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Shield size={12} />
            <span className="text-xs">Functions</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {executive.functionCount}
          </span>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <AlertCircle size={12} />
            <span className="text-xs">Tasks</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {executive.taskCount}
          </span>
        </div>
      </div>

      {/* Process/Function Preview */}
      <div className="space-y-2">
        {executive.processes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Processes</p>
            <div className="flex flex-wrap gap-1">
              {executive.processes.slice(0, 4).map((proc) => (
                <ProcessBadge
                  key={proc.id}
                  code={proc.code || ''}
                  status={proc.overallStatus}
                />
              ))}
              {executive.processes.length > 4 && (
                <span className="px-2 py-0.5 text-xs text-gray-400">
                  +{executive.processes.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
        {executive.functions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Functions</p>
            <div className="flex flex-wrap gap-1">
              {executive.functions.slice(0, 4).map((func) => (
                <ProcessBadge
                  key={func.id}
                  code={func.code || ''}
                  status={func.overallStatus}
                  isFunction
                />
              ))}
              {executive.functions.length > 4 && (
                <span className="px-2 py-0.5 text-xs text-gray-400">
                  +{executive.functions.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Details Link */}
      <div className="mt-4 pt-3 border-t flex items-center justify-end text-sm text-gray-500 hover:text-gray-900">
        View Details
        <ChevronRight size={16} />
      </div>
    </Link>
  );
}

interface ProcessBadgeProps {
  code: string;
  status?: HealthStatus;
  isFunction?: boolean;
}

function ProcessBadge({ code, status, isFunction }: ProcessBadgeProps) {
  const baseClasses = 'px-2 py-0.5 rounded text-xs font-medium';

  const statusClasses: Record<HealthStatus, string> = {
    healthy: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };

  const defaultClass = isFunction
    ? 'bg-purple-100 text-purple-700'
    : 'bg-blue-100 text-blue-700';

  return (
    <CodeTooltip code={code}>
      <span className={cn(baseClasses, status ? statusClasses[status] : defaultClass)}>
        {code}
      </span>
    </CodeTooltip>
  );
}

interface ExecutiveGridProps {
  executives: ExecutiveSummary[];
  isLoading?: boolean;
}

export function ExecutiveGrid({ executives, isLoading }: ExecutiveGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {executives.map((exec) => (
        <ExecutiveTile key={exec.id} executive={exec} />
      ))}
    </div>
  );
}
