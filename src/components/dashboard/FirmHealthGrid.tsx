'use client';

import { DomainTile } from './DomainTile';
import type { DomainSummary } from '@/types';

interface FirmHealthGridProps {
  domains: DomainSummary[];
  isLoading?: boolean;
}

export function FirmHealthGrid({ domains, isLoading }: FirmHealthGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <DomainTileSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No domains configured</p>
        <p className="mt-1 text-sm text-gray-400">
          Configure operational domains to see firm health metrics
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {domains.map((domain) => (
        <DomainTile key={domain.id} domain={domain} />
      ))}
    </div>
  );
}

function DomainTileSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-200" />
          <div>
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="mt-1 h-3 w-24 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-4 w-12 rounded bg-gray-200" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-4 w-14 rounded bg-gray-200" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-28 rounded bg-gray-100" />
          <div className="h-4 w-10 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
