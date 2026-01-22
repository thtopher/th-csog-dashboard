'use client';

import { cn } from '@/lib/utils/cn';

interface CompactRACILegendProps {
  className?: string;
}

export function CompactRACILegend({ className }: CompactRACILegendProps) {
  return (
    <div className={cn('flex items-center gap-4 text-xs text-gray-500 mb-2', className)}>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        A=Accountable
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        R=Responsible
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        C=Contributor
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        I=Informed
      </span>
    </div>
  );
}
