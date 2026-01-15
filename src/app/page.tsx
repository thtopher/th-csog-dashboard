'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { FirmHealthGrid } from '@/components/dashboard/FirmHealthGrid';
import { GlobalFilters } from '@/components/dashboard/GlobalFilters';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    domains,
    isLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    lastUpdated,
    refresh,
    isRefreshing,
  } = useDashboard();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Firm Health</h1>
          <p className="mt-1 text-gray-500">
            Overview of Third Horizon operational performance
          </p>
        </div>

        {/* Global Filters */}
        <div className="mb-6">
          <GlobalFilters
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            lastUpdated={lastUpdated || undefined}
            onRefresh={refresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        {/* Domain Grid */}
        <FirmHealthGrid domains={domains} isLoading={isLoading} />

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Click on any domain tile to view detailed metrics and processes
          </p>
        </div>
      </main>
    </div>
  );
}
