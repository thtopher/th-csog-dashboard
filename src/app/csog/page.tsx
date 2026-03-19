'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { StrategicGoalsTracker } from '@/components/csog/StrategicGoalsTracker';
import { BusinessKPIs } from '@/components/csog/BusinessKPIs';
import { SOPView } from '@/components/csog/SOPView';
import { ContractPerformance } from '@/components/csog/ContractPerformance';
import { TeamCalendar } from '@/components/csog/calendar/TeamCalendar';
import { cn } from '@/lib/utils/cn';
import { Loader2, Target, BarChart3, BookOpen, FileText, CalendarDays } from 'lucide-react';

const TABS = [
  { id: 'goals', label: 'Strategic Goals', icon: Target },
  { id: 'kpis', label: 'Business KPIs', icon: BarChart3 },
  { id: 'sop', label: 'SOP', icon: BookOpen },
  { id: 'contracts', label: 'Contract Performance', icon: FileText },
  { id: 'calendar', label: 'Team Calendar', icon: CalendarDays },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function CSOGHubPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <CSOGHubContent />
    </Suspense>
  );
}

function CSOGHubContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get('tab') as TabId) || 'goals'
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Update URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">CSOG Hub</h1>
          <p className="mt-1 text-gray-500">
            Strategic goals, KPIs, standard operating procedures, contract performance, and team calendar
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex gap-1" aria-label="CSOG Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'group flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'goals' && <StrategicGoalsTracker />}
          {activeTab === 'kpis' && <BusinessKPIs />}
          {activeTab === 'sop' && <SOPView />}
          {activeTab === 'contracts' && <ContractPerformance />}
          {activeTab === 'calendar' && <TeamCalendar />}
        </div>
      </main>
    </div>
  );
}
