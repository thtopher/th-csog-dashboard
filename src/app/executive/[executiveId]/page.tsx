'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { RACIMatrix } from '@/components/raci/RACIMatrix';
import { CodeTooltip } from '@/components/common/CodeTooltip';
import { ExecutiveUploadStatus } from '@/components/dashboard/ExecutiveUploadStatus';
import { ExecutiveScorecard } from '@/components/dashboard/ExecutiveScorecard';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/common/Avatar';
import type { ExecutiveDetailResponse, ProcessWithTasks, HealthStatus } from '@/types';

// Extended type to include status from API
interface ProcessWithStatus extends ProcessWithTasks {
  overallStatus?: HealthStatus;
  activeGapsCount?: number;
}
import {
  Loader2,
  ChevronLeft,
  Briefcase,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function ExecutiveDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const executiveId = params.executiveId as string;

  const [data, setData] = useState<ExecutiveDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);

  const fetchData = useCallback(async (skipLoadingState = false) => {
    try {
      if (!skipLoadingState) setIsLoading(true);
      // Add cache-busting for fresh data
      const res = await fetch(`/api/executives/${executiveId}?_t=${Date.now()}`);
      if (!res.ok) throw new Error('Executive not found');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [executiveId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && executiveId) {
      fetchData();
    }
  }, [isAuthenticated, executiveId, fetchData]);

  // Refetch when page becomes visible (user returns from upload page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && executiveId) {
        fetchData(true); // Skip loading state for background refresh
      }
    };

    const handleFocus = () => {
      if (isAuthenticated && executiveId) {
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData, isAuthenticated, executiveId]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800">{error?.message || 'Executive not found'}</p>
            <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { executive, processes, functions } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Executive Header */}
        <div className="mb-8 flex items-start gap-4">
          <Avatar
            executiveId={executive.id}
            name={executive.name}
            size="xl"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{executive.name}</h1>
            <p className="text-lg text-gray-600">{executive.title}</p>
            <p className="text-sm text-gray-500">{executive.role}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{executive.processCount}</p>
                <p className="text-xs text-gray-500">Processes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{executive.functionCount}</p>
                <p className="text-xs text-gray-500">Functions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{executive.taskCount}</p>
                <p className="text-xs text-gray-500">Tasks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Scorecard */}
        <div className="mb-6">
          <ExecutiveScorecard executiveId={executiveId} />
        </div>

        {/* Upload Status */}
        <div className="mb-6">
          <ExecutiveUploadStatus executiveId={executiveId} />
        </div>

        {/* Processes Section */}
        {processes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={20} />
              Operational Processes
            </h2>
            <div className="space-y-3">
              {processes.map((proc) => (
                <ProcessAccordion
                  key={proc.id}
                  process={proc}
                  isExpanded={expandedProcess === proc.id}
                  onToggle={() =>
                    setExpandedProcess(expandedProcess === proc.id ? null : proc.id)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Functions Section */}
        {functions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Governance Functions
            </h2>
            <div className="space-y-3">
              {functions.map((func) => (
                <ProcessAccordion
                  key={func.id}
                  process={func}
                  isExpanded={expandedProcess === func.id}
                  onToggle={() =>
                    setExpandedProcess(expandedProcess === func.id ? null : func.id)
                  }
                  isFunction
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

interface ProcessAccordionProps {
  process: ProcessWithStatus;
  isExpanded: boolean;
  onToggle: () => void;
  isFunction?: boolean;
}

function ProcessAccordion({ process, isExpanded, onToggle, isFunction }: ProcessAccordionProps) {
  const status = process.overallStatus || 'healthy';

  // Status-aware colors for the badge
  const statusBadgeColors: Record<HealthStatus, string> = {
    healthy: isFunction ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700 ring-2 ring-amber-300',
    critical: 'bg-red-100 text-red-700 ring-2 ring-red-300',
  };

  const statusDotColors: Record<HealthStatus, string> = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  const statusLabels: Record<HealthStatus, string> = {
    healthy: '',
    warning: 'Needs Attention',
    critical: 'Critical',
  };

  return (
    <div className={`rounded-lg border bg-white overflow-hidden ${status !== 'healthy' ? 'border-amber-300' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CodeTooltip code={process.code || ''}>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${statusBadgeColors[status]}`}>
              {process.code}
            </span>
          </CodeTooltip>
          <span className="font-medium text-gray-900">{process.name}</span>
          <span className="text-xs text-gray-400">({process.tasks.length} tasks)</span>
          {status !== 'healthy' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              <span className={`h-2 w-2 rounded-full ${statusDotColors[status]}`} />
              {statusLabels[status]}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-4 bg-gray-50">
          <RACIMatrix
            tasks={process.tasks}
            processCode={process.code || ''}
            processName={process.name}
          />
        </div>
      )}
    </div>
  );
}
