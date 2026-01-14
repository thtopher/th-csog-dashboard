'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProcessNav } from '@/components/domain/ProcessNav';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TrendIndicator } from '@/components/common/TrendIndicator';
import { formatValue } from '@/lib/utils/format';
import { DEFAULT_DOMAINS } from '@/config/domains';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Briefcase,
  CheckCircle,
  DollarSign,
  Settings,
  Users,
  AlertTriangle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import type { DomainSummary, ProcessSummary, HealthStatus } from '@/types';

// Mock data for demonstration
const MOCK_PROCESSES: Record<string, ProcessSummary[]> = {
  'd1000000-0000-0000-0000-000000000001': [
    {
      id: 'p1000000-0000-0000-0000-000000000001',
      domainId: 'd1000000-0000-0000-0000-000000000001',
      name: 'Lead Generation',
      processTag: 'bd_lead_gen',
      sopStatus: 'documented',
      displayOrder: 1,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [
        {
          id: 'k1', processId: 'p1', name: 'Active Leads', shortName: 'Leads',
          unit: 'count', direction: 'higher_better', dataSource: 'notion',
          refreshCadence: 'weekly', displayFormat: 'number', chartType: 'bar',
          isPrimary: true, isActive: true, createdAt: '', updatedAt: '',
          latestValue: { id: 'v1', kpiDefinitionId: 'k1', periodStart: '', periodEnd: '',
            periodType: 'week', value: 24, status: 'healthy', trendDirection: 'up', ingestedAt: '' }
        }
      ],
      activeGapsCount: 0,
    },
    {
      id: 'p1000000-0000-0000-0000-000000000002',
      domainId: 'd1000000-0000-0000-0000-000000000001',
      name: 'Proposal Development',
      processTag: 'bd_proposals',
      sopStatus: 'partial',
      displayOrder: 2,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [
        {
          id: 'k2', processId: 'p2', name: 'Proposals Submitted', shortName: 'Proposals',
          unit: 'count', direction: 'higher_better', dataSource: 'notion',
          refreshCadence: 'monthly', displayFormat: 'number', chartType: 'bar',
          isPrimary: true, isActive: true, createdAt: '', updatedAt: '',
          latestValue: { id: 'v2', kpiDefinitionId: 'k2', periodStart: '', periodEnd: '',
            periodType: 'month', value: 3, status: 'warning', trendDirection: 'down', ingestedAt: '' }
        }
      ],
      activeGapsCount: 1,
    },
    {
      id: 'p1000000-0000-0000-0000-000000000003',
      domainId: 'd1000000-0000-0000-0000-000000000001',
      name: 'Contracting',
      processTag: 'bd_contracting',
      sopStatus: 'documented',
      displayOrder: 3,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [],
      activeGapsCount: 0,
    },
    {
      id: 'p1000000-0000-0000-0000-000000000004',
      domainId: 'd1000000-0000-0000-0000-000000000001',
      name: 'Client Onboarding',
      processTag: 'bd_onboarding',
      sopStatus: 'missing',
      displayOrder: 4,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [],
      activeGapsCount: 2,
    },
  ],
  'd1000000-0000-0000-0000-000000000005': [
    {
      id: 'p5000000-0000-0000-0000-000000000001',
      domainId: 'd1000000-0000-0000-0000-000000000005',
      name: 'Time Tracking',
      processTag: 'ops_time_tracking',
      sopStatus: 'documented',
      displayOrder: 1,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [
        {
          id: 'k3', processId: 'p5-1', name: 'Harvest Compliance Rate', shortName: 'Compliance',
          unit: 'percent', direction: 'higher_better', dataSource: 'excel_harvest',
          refreshCadence: 'weekly', displayFormat: 'percent', chartType: 'bar',
          isPrimary: true, isActive: true, createdAt: '', updatedAt: '',
          targetValue: 95,
          latestValue: { id: 'v3', kpiDefinitionId: 'k3', periodStart: '', periodEnd: '',
            periodType: 'week', value: 94, status: 'healthy', trendDirection: 'up', ingestedAt: '' }
        }
      ],
      activeGapsCount: 0,
    },
    {
      id: 'p5000000-0000-0000-0000-000000000002',
      domainId: 'd1000000-0000-0000-0000-000000000005',
      name: 'Training Compliance',
      processTag: 'ops_training',
      sopStatus: 'documented',
      displayOrder: 2,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [
        {
          id: 'k4', processId: 'p5-2', name: 'SH Training Completion', shortName: 'SH Training',
          unit: 'percent', direction: 'higher_better', dataSource: 'excel_training',
          refreshCadence: 'monthly', displayFormat: 'percent', chartType: 'bar',
          isPrimary: true, isActive: true, createdAt: '', updatedAt: '',
          targetValue: 100,
          latestValue: { id: 'v4', kpiDefinitionId: 'k4', periodStart: '', periodEnd: '',
            periodType: 'month', value: 95, status: 'healthy', trendDirection: 'flat', ingestedAt: '' }
        }
      ],
      activeGapsCount: 1,
    },
    {
      id: 'p5000000-0000-0000-0000-000000000003',
      domainId: 'd1000000-0000-0000-0000-000000000005',
      name: 'HR Administration',
      processTag: 'ops_hr',
      sopStatus: 'partial',
      displayOrder: 3,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [],
      activeGapsCount: 0,
    },
    {
      id: 'p5000000-0000-0000-0000-000000000004',
      domainId: 'd1000000-0000-0000-0000-000000000005',
      name: 'IT & Security',
      processTag: 'ops_it',
      sopStatus: 'missing',
      displayOrder: 4,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [],
      activeGapsCount: 1,
    },
  ],
};

// Sample chart data
const SAMPLE_CHART_DATA = [
  { week: 'W47', value: 82 },
  { week: 'W48', value: 88 },
  { week: 'W49', value: 91 },
  { week: 'W50', value: 94 },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  'trending-up': TrendingUp,
  briefcase: Briefcase,
  'check-circle': CheckCircle,
  'dollar-sign': DollarSign,
  settings: Settings,
  users: Users,
};

export default function DomainDetailPage() {
  const params = useParams();
  const domainId = params.domainId as string;

  const [domain, setDomain] = useState<DomainSummary | null>(null);
  const [processes, setProcesses] = useState<ProcessSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading domain data
    const domainConfig = DEFAULT_DOMAINS.find(d => d.id === domainId);
    if (domainConfig) {
      setDomain({
        ...domainConfig,
        id: domainConfig.id!,
        name: domainConfig.name!,
        shortName: domainConfig.shortName!,
        displayOrder: domainConfig.displayOrder!,
        colorHex: domainConfig.colorHex!,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        processes: [],
        primaryKpis: [],
        overallStatus: 'healthy',
        activeGapsCount: 2,
      });
    }
    setProcesses(MOCK_PROCESSES[domainId] || generateDefaultProcesses(domainId));
    setIsLoading(false);
  }, [domainId]);

  if (isLoading || !domain) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  const Icon = ICON_MAP[domain.iconName || ''] || Briefcase;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: domain.name }
          ]}
        />

        {/* Domain Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${domain.colorHex}15` }}
            >
              <Icon size={28} style={{ color: domain.colorHex }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{domain.name}</h1>
              {domain.stewardName && (
                <p className="text-gray-500">Steward: {domain.stewardName}</p>
              )}
            </div>
          </div>
          <StatusBadge status={domain.overallStatus} showLabel />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Sidebar - Process Navigation */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <ProcessNav
                processes={processes}
                domainId={domainId}
              />
            </div>

            {/* Domain Gaps Summary */}
            {domain.activeGapsCount > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <h3 className="font-medium text-amber-900">Active Gaps</h3>
                </div>
                <p className="text-sm text-amber-800 mb-3">
                  {domain.activeGapsCount} gaps identified across this domain's processes
                </p>
                <Link
                  href={`/domain/${domainId}/gaps`}
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
                >
                  View all gaps <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Right Content - KPI Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary KPIs */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {processes.slice(0, 4).map(process => (
                  process.kpis[0] && (
                    <KPICard key={process.id} process={process} domainId={domainId} />
                  )
                ))}
              </div>

              {/* Sample Trend Chart */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Weekly Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SAMPLE_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" fill={domain.colorHex} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Process Status Grid */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {processes.map(process => (
                  <ProcessCard key={process.id} process={process} domainId={domainId} domainColor={domain.colorHex} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function KPICard({ process, domainId }: { process: ProcessSummary; domainId: string }) {
  const kpi = process.kpis[0];
  if (!kpi || !kpi.latestValue) return null;

  return (
    <Link
      href={`/domain/${domainId}/process/${process.id}`}
      className="block rounded-lg border p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-600">{kpi.shortName}</span>
        <StatusBadge status={kpi.latestValue.status || 'healthy'} size="sm" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {formatValue(kpi.latestValue.value, kpi.displayFormat)}
        </span>
        {kpi.latestValue.trendDirection && (
          <TrendIndicator
            direction={kpi.latestValue.trendDirection}
            kpiDirection={kpi.direction}
            showLabel
            size="sm"
          />
        )}
      </div>
      {kpi.targetValue !== undefined && (
        <p className="text-xs text-gray-500 mt-1">
          Target: {formatValue(kpi.targetValue, kpi.displayFormat)}
        </p>
      )}
    </Link>
  );
}

function ProcessCard({ process, domainId, domainColor }: { process: ProcessSummary; domainId: string; domainColor: string }) {
  const status = process.kpis[0]?.latestValue?.status || 'healthy';

  return (
    <Link
      href={`/domain/${domainId}/process/${process.id}`}
      className="flex items-center justify-between rounded-lg border p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: status === 'healthy' ? '#16a34a' : status === 'warning' ? '#d97706' : '#dc2626' }}
        />
        <div>
          <p className="font-medium text-gray-900">{process.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <SOPBadge status={process.sopStatus} />
            {process.activeGapsCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-amber-600">
                <AlertTriangle size={10} />
                {process.activeGapsCount}
              </span>
            )}
          </div>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-400" />
    </Link>
  );
}

function SOPBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    documented: { label: 'SOP', className: 'bg-green-100 text-green-700' },
    partial: { label: 'Partial SOP', className: 'bg-amber-100 text-amber-700' },
    missing: { label: 'No SOP', className: 'bg-gray-100 text-gray-500' },
  };
  const { label, className } = config[status] || config.missing;

  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${className}`}>
      <FileText size={10} />
      {label}
    </span>
  );
}

function generateDefaultProcesses(domainId: string): ProcessSummary[] {
  return [
    {
      id: `${domainId}-p1`,
      domainId,
      name: 'Process 1',
      processTag: 'process_1',
      sopStatus: 'missing',
      displayOrder: 1,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [],
      activeGapsCount: 0,
    },
    {
      id: `${domainId}-p2`,
      domainId,
      name: 'Process 2',
      processTag: 'process_2',
      sopStatus: 'missing',
      displayOrder: 2,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      kpis: [],
      activeGapsCount: 0,
    },
  ];
}
