'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CEOScorecard } from '@/components/dashboard/CEOScorecard';
import { ExecutiveGrid } from '@/components/dashboard/ExecutiveTile';
import { GlobalFilters } from '@/components/dashboard/GlobalFilters';
import { useAuth } from '@/contexts/AuthContext';
import type { ExecutiveOverviewResponse, PeriodType } from '@/types';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<ExecutiveOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (skipLoadingState = false) => {
    try {
      if (!skipLoadingState) setIsLoading(true);
      // Cache-busting for fresh data
      const res = await fetch(`/api/executives?periodType=${selectedPeriod}&_t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  // Role-based routing
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && isAuthenticated && user) {
      // Non-CEO executives go to their own page
      if (user.executiveId && user.executiveId !== 'exec-ceo') {
        router.push(`/executive/${user.executiveId}`);
        return;
      }

      // Non-executive admins (like Topher) go to admin page
      if (user.role === 'admin' && !user.executiveId) {
        router.push('/admin');
        return;
      }

      // CEO stays on main dashboard (this page)
      // Staff/viewers also stay here for read-only view
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Refetch when page becomes visible (user returns from upload page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        fetchData(true); // Background refresh
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData, isAuthenticated]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Show loading while redirecting non-CEO executives
  if (user?.executiveId && user.executiveId !== 'exec-ceo') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show loading while redirecting non-executive admins
  if (user?.role === 'admin' && !user?.executiveId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="mt-1 text-gray-500">
            SOP-aligned control center for Third Horizon operations
          </p>
        </div>

        {/* Global Filters */}
        <div className="mb-6">
          <GlobalFilters
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            lastUpdated={data?.lastUpdated}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        {/* CEO Scorecard */}
        <div className="mb-10">
          {data?.ceoScorecard && (
            <CEOScorecard scorecard={data.ceoScorecard} isLoading={isLoading} />
          )}
        </div>

        {/* Executive Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Domains</h2>
          <p className="text-sm text-gray-500 mb-6">
            Click on any executive to view their processes, functions, and RACI assignments
          </p>
          <ExecutiveGrid
            executives={data?.executives || []}
            isLoading={isLoading}
          />
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Dashboard aligned with Third Horizon SOP 2026 &middot; F-EOC6 CEO Scorecard
          </p>
        </div>
      </main>
    </div>
  );
}
