'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UploadStatusBadge } from '@/components/progress/UploadStatusBadge';
import { Upload, Clock, CheckCircle, AlertTriangle, ChevronRight, RefreshCw } from 'lucide-react';
import type { ThermometerData, UploadStatusItem } from '@/types';

interface ExecutiveUploadStatusProps {
  executiveId: string;
}

export function ExecutiveUploadStatus({ executiveId }: ExecutiveUploadStatusProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<ThermometerData | null>(null);

  const fetchUploadStatus = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      // Add cache-busting timestamp to ensure fresh data
      const res = await fetch(`/api/uploads/compliance?executiveId=${executiveId}&_t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to fetch upload status');
      const json = await res.json();
      // Get the first (and only) thermometer for this executive
      setData(json.thermometers[0] || null);
    } catch (error) {
      console.error('Error fetching upload status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [executiveId]);

  // Fetch on mount and when executiveId changes
  useEffect(() => {
    fetchUploadStatus();
  }, [fetchUploadStatus]);

  // Refetch when page becomes visible (user returns from upload page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUploadStatus(true);
      }
    };

    // Also refetch on window focus (for multi-tab scenarios)
    const handleFocus = () => {
      fetchUploadStatus(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUploadStatus]);

  if (isLoading) {
    return <ExecutiveUploadStatusSkeleton />;
  }

  if (!data || data.totalRequired === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Upload Status</h3>
        </div>
        <p className="text-sm text-gray-500">No uploads scheduled for this executive.</p>
      </div>
    );
  }

  const pendingUploads = data.uploads.filter((u) => u.status === 'pending' || u.status === 'overdue');
  const completedUploads = data.uploads.filter((u) => u.status === 'completed');
  const overdueCount = data.uploads.filter((u) => u.status === 'overdue').length;

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Upload Status</h3>
          {isRefreshing && (
            <RefreshCw size={14} className="text-gray-400 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUploadStatus(true)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            title="Refresh status"
          >
            <RefreshCw size={14} />
          </button>
          <Link
            href="/upload"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Upload Data
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="p-5">
        {/* Summary Stats */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-900">{data.totalCompleted}/{data.totalRequired}</span>
            <span className="text-gray-500">completed</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle size={14} />
              <span>{overdueCount} overdue</span>
            </div>
          )}
        </div>

        {/* Upload Lists */}
        <div className="space-y-4">
          {/* Pending Uploads */}
          {pendingUploads.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                {pendingUploads.some((u) => u.status === 'overdue') ? (
                  <AlertTriangle size={14} className="text-red-500" />
                ) : (
                  <Clock size={14} className="text-amber-500" />
                )}
                Due This Period
              </h4>
              <div className="space-y-2">
                {pendingUploads.map((upload) => (
                  <UploadItem key={upload.uploadTypeId} upload={upload} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Uploads */}
          {completedUploads.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-500" />
                Completed
              </h4>
              <div className="space-y-2">
                {completedUploads.map((upload) => (
                  <UploadItem key={upload.uploadTypeId} upload={upload} />
                ))}
              </div>
            </div>
          )}

          {/* No uploads message */}
          {pendingUploads.length === 0 && completedUploads.length === 0 && (
            <p className="text-sm text-gray-500">No uploads tracked for current period.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadItem({ upload }: { upload: UploadStatusItem }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{upload.uploadTypeName}</p>
        <p className="text-xs text-gray-500">
          Due: {new Date(upload.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
      <UploadStatusBadge status={upload.status} size="sm" />
    </div>
  );
}

function ExecutiveUploadStatusSkeleton() {
  return (
    <div className="bg-white rounded-lg border overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="p-5">
        <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
