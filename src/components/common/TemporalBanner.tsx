'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTemporal } from '@/contexts/TemporalContext';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UploadStatusItem {
  uploadTypeId: string;
  uploadTypeName: string;
  status: 'pending' | 'overdue' | 'completed' | 'upcoming';
}

interface TemporalBannerProps {
  showDeadlines?: boolean;
  compact?: boolean;
  className?: string;
}

export function TemporalBanner({ showDeadlines = true, compact = false, className }: TemporalBannerProps) {
  const { formattedDate, currentMonth, daysRemaining } = useTemporal();
  const { user } = useAuth();

  const [pendingUploads, setPendingUploads] = useState<UploadStatusItem[]>([]);
  const [overdueUploads, setOverdueUploads] = useState<UploadStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch actual upload compliance for the current user
  const fetchUploadCompliance = useCallback(async () => {
    if (!user?.executiveId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/uploads/compliance?executiveId=${user.executiveId}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const thermometer = data.thermometers?.[0];
        if (thermometer?.uploads) {
          const pending = thermometer.uploads.filter((u: UploadStatusItem) => u.status === 'pending');
          const overdue = thermometer.uploads.filter((u: UploadStatusItem) => u.status === 'overdue');
          setPendingUploads(pending);
          setOverdueUploads(overdue);
        }
      }
    } catch (error) {
      console.error('Failed to fetch upload compliance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.executiveId]);

  // Initial fetch
  useEffect(() => {
    fetchUploadCompliance();
  }, [fetchUploadCompliance]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUploadCompliance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchUploadCompliance);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchUploadCompliance);
    };
  }, [fetchUploadCompliance]);

  const totalPending = pendingUploads.length + overdueUploads.length;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 text-sm', className)}>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>
        {!isLoading && user?.executiveId && totalPending > 0 && (
          <Link href="/upload" className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700">
            <AlertTriangle size={14} />
            <span>
              {overdueUploads.length > 0
                ? `${overdueUploads.length} overdue`
                : `${pendingUploads.length} due soon`}
            </span>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-white border-b px-4 py-2.5', className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        {/* Date and Progress */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-900">
            <Calendar size={16} className="text-gray-400" />
            <span className="font-medium">{formattedDate}</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Day {currentMonth.dayNumber} of {currentMonth.totalDays}
            </span>
            <span className="text-gray-300">|</span>
            <span>{daysRemaining.inMonth} days left in {currentMonth.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Upload Status - User-specific */}
        {showDeadlines && user?.executiveId && !isLoading && (
          <div className="flex items-center gap-3">
            {overdueUploads.length > 0 && (
              <Link
                href="/upload"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
                title={overdueUploads.map(u => u.uploadTypeName).join(', ')}
              >
                <AlertTriangle size={12} />
                {overdueUploads.length} overdue
              </Link>
            )}
            {pendingUploads.length > 0 && (
              <Link
                href="/upload"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-colors"
                title={pendingUploads.map(u => u.uploadTypeName).join(', ')}
              >
                <Clock size={12} />
                {pendingUploads.length} due soon
              </Link>
            )}
            {totalPending === 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <CheckCircle size={12} />
                All caught up
              </div>
            )}
          </div>
        )}

        {/* Non-executive users (admins without executiveId) - don't show upload status */}
        {showDeadlines && !user?.executiveId && !isLoading && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            <Calendar size={12} />
            Admin View
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact deadline list for sidebars or cards
 */
export function DeadlineList({ className }: { className?: string }) {
  const { reportingDeadlines } = useTemporal();

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Upcoming Deadlines</h4>
      <div className="space-y-2">
        {reportingDeadlines.slice(0, 3).map((deadline, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center justify-between py-2 px-3 rounded-lg text-sm',
              deadline.isOverdue
                ? 'bg-red-50 border border-red-200'
                : deadline.daysUntilDue <= 3
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-gray-50 border border-gray-200'
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  deadline.isOverdue
                    ? 'bg-red-500'
                    : deadline.daysUntilDue <= 3
                      ? 'bg-amber-500'
                      : 'bg-gray-400'
                )}
              />
              <span className="font-medium text-gray-900">{deadline.name}</span>
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                deadline.isOverdue
                  ? 'text-red-600'
                  : deadline.daysUntilDue <= 3
                    ? 'text-amber-600'
                    : 'text-gray-500'
              )}
            >
              {deadline.isOverdue
                ? `${Math.abs(deadline.daysUntilDue)}d overdue`
                : deadline.daysUntilDue === 0
                  ? 'Today'
                  : deadline.daysUntilDue === 1
                    ? 'Tomorrow'
                    : `${deadline.daysUntilDue}d left`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * What's Due section for executive pages
 */
export function WhatsDueSection({
  executiveId,
  className,
}: {
  executiveId: string;
  className?: string;
}) {
  const { currentMonth, daysRemaining, reportingDeadlines } = useTemporal();

  // Filter deadlines relevant to uploads (monthly and weekly)
  const uploadDeadlines = reportingDeadlines.filter(
    d => d.type === 'month' || d.type === 'week'
  );

  return (
    <div className={cn('bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">What&apos;s Due</h3>
          <p className="text-sm text-gray-600">{currentMonth.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{daysRemaining.inMonth}</p>
          <p className="text-xs text-gray-500">days remaining</p>
        </div>
      </div>

      <div className="space-y-3">
        {uploadDeadlines.map((deadline, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg bg-white shadow-sm',
              deadline.isOverdue && 'ring-2 ring-red-400'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  deadline.isOverdue
                    ? 'bg-red-500 animate-pulse'
                    : deadline.daysUntilDue <= 3
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                )}
              />
              <div>
                <p className="font-medium text-gray-900">{deadline.name}</p>
                <p className="text-xs text-gray-500">
                  Due: {deadline.dueDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <span
              className={cn(
                'text-sm font-semibold',
                deadline.isOverdue
                  ? 'text-red-600'
                  : deadline.daysUntilDue <= 3
                    ? 'text-amber-600'
                    : 'text-green-600'
              )}
            >
              {deadline.isOverdue
                ? 'OVERDUE'
                : deadline.daysUntilDue === 0
                  ? 'TODAY'
                  : `${deadline.daysUntilDue}d`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
