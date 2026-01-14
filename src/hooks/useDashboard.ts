'use client';

import { useState, useEffect, useCallback } from 'react';
import type { OverviewResponse, PeriodType, DomainSummary } from '@/types';

interface UseDashboardOptions {
  initialPeriod?: PeriodType;
}

interface UseDashboardReturn {
  domains: DomainSummary[];
  isLoading: boolean;
  error: Error | null;
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const [domains, setDomains] = useState<DomainSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(
    options.initialPeriod || 'week'
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(
        `/api/kpis/overview?periodType=${selectedPeriod}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const data: OverviewResponse = await response.json();
      setDomains(data.domains);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    domains,
    isLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    lastUpdated,
    refresh,
    isRefreshing,
  };
}
