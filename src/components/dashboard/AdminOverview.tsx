'use client';

import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';
import { CheckCircle, AlertCircle, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UploadCompliance {
  executiveId: string;
  executiveName: string;
  title: string;
  totalRequired: number;
  totalCompleted: number;
  pendingUploads: string[];
  lastUpload?: string;
}

interface AdminOverviewProps {
  compliance: UploadCompliance[];
  isLoading: boolean;
}

export function AdminOverview({ compliance, isLoading }: AdminOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  // Sort by compliance - pending items first
  const sortedCompliance = [...compliance].sort((a, b) => {
    const aComplete = a.totalCompleted === a.totalRequired;
    const bComplete = b.totalCompleted === b.totalRequired;
    if (aComplete === bComplete) return 0;
    return aComplete ? 1 : -1;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedCompliance.map((exec) => (
        <ExecutiveComplianceCard key={exec.executiveId} compliance={exec} />
      ))}
    </div>
  );
}

function ExecutiveComplianceCard({ compliance }: { compliance: UploadCompliance }) {
  const { executiveId, executiveName, title, totalRequired, totalCompleted, pendingUploads, lastUpload } = compliance;

  const isComplete = totalCompleted === totalRequired;
  const compliancePercent = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 100;

  return (
    <Link
      href={`/executive/${executiveId}`}
      className={cn(
        'block bg-white rounded-lg border p-5 hover:shadow-md transition-shadow',
        !isComplete && 'border-l-4',
        pendingUploads.length > 0 && 'border-l-amber-500'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          executiveId={executiveId}
          name={executiveName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{executiveName}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
        <ChevronRight size={16} className="text-gray-400 shrink-0" />
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Upload Progress</span>
          <span className="text-xs font-medium text-gray-700">{totalCompleted}/{totalRequired}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isComplete ? 'bg-green-500' : compliancePercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${compliancePercent}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {isComplete ? (
          <>
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-xs font-medium text-green-700">Complete</span>
          </>
        ) : pendingUploads.length > 0 ? (
          <>
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-xs text-amber-700 truncate">
              Missing: {pendingUploads[0]}{pendingUploads.length > 1 && ` +${pendingUploads.length - 1}`}
            </span>
          </>
        ) : (
          <>
            <Clock size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">No uploads required</span>
          </>
        )}
      </div>

      {/* Last Upload */}
      {lastUpload && (
        <p className="mt-2 text-xs text-gray-400">
          Last upload: {new Date(lastUpload).toLocaleDateString()}
        </p>
      )}
    </Link>
  );
}
