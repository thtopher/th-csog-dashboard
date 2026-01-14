'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TrendIndicator } from '@/components/common/TrendIndicator';
import { formatValue, formatPeriod } from '@/lib/utils/format';
import { DEFAULT_DOMAINS } from '@/config/domains';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  FileText,
  AlertTriangle,
  MessageSquare,
  Plus,
  ExternalLink,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
} from 'lucide-react';
import type { KPIDetail, ProcessGap, Annotation, HealthStatus } from '@/types';

// Mock KPI data with historical values
const MOCK_KPI_DATA: KPIDetail[] = [
  {
    id: 'k1000000-0000-0000-0000-000000000001',
    processId: 'p5000000-0000-0000-0000-000000000001',
    name: 'Harvest Compliance Rate',
    shortName: 'Compliance',
    description: 'Percentage of staff with fully compliant time entries',
    unit: 'percent',
    direction: 'higher_better',
    targetValue: 95,
    warningThreshold: 85,
    criticalThreshold: 75,
    dataSource: 'excel_harvest',
    refreshCadence: 'weekly',
    displayFormat: 'percent',
    chartType: 'bar',
    isPrimary: true,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    process: {
      id: 'p5000000-0000-0000-0000-000000000001',
      domainId: 'd1000000-0000-0000-0000-000000000005',
      name: 'Time Tracking',
      processTag: 'ops_time_tracking',
      sopStatus: 'documented',
      displayOrder: 1,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    domain: DEFAULT_DOMAINS[4] as any,
    values: [
      { id: 'v1', kpiDefinitionId: 'k1', periodStart: '2024-12-02', periodEnd: '2024-12-08', periodType: 'week', value: 82, status: 'warning', trendDirection: 'up', ingestedAt: '' },
      { id: 'v2', kpiDefinitionId: 'k1', periodStart: '2024-12-09', periodEnd: '2024-12-15', periodType: 'week', value: 88, status: 'warning', trendDirection: 'up', ingestedAt: '' },
      { id: 'v3', kpiDefinitionId: 'k1', periodStart: '2024-12-16', periodEnd: '2024-12-22', periodType: 'week', value: 91, status: 'warning', trendDirection: 'up', ingestedAt: '' },
      { id: 'v4', kpiDefinitionId: 'k1', periodStart: '2024-12-23', periodEnd: '2024-12-29', periodType: 'week', value: 94, status: 'healthy', trendDirection: 'up', ingestedAt: '' },
    ],
    annotations: [
      {
        id: 'a1',
        targetType: 'kpi_definition',
        targetId: 'k1',
        annotationType: 'trend_note',
        title: 'Improvement trend',
        content: 'Harvest compliance improved from 82% to 94% over the last four weeks, following implementation of reminder emails.',
        authorName: 'Jordana',
        isPinned: true,
        createdAt: '2024-12-28T10:00:00Z',
        updatedAt: '2024-12-28T10:00:00Z',
      },
    ],
    relatedGaps: [],
  },
  {
    id: 'k1000000-0000-0000-0000-000000000002',
    processId: 'p5000000-0000-0000-0000-000000000001',
    name: 'Average Hours Logged',
    shortName: 'Avg Hours',
    description: 'Average hours logged per person per week',
    unit: 'hours',
    direction: 'target',
    targetValue: 40,
    warningThreshold: 35,
    criticalThreshold: 30,
    dataSource: 'excel_harvest',
    refreshCadence: 'weekly',
    displayFormat: 'number',
    chartType: 'line',
    isPrimary: false,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    process: {} as any,
    domain: {} as any,
    values: [
      { id: 'v5', kpiDefinitionId: 'k2', periodStart: '2024-12-02', periodEnd: '2024-12-08', periodType: 'week', value: 38.5, status: 'healthy', trendDirection: 'up', ingestedAt: '' },
      { id: 'v6', kpiDefinitionId: 'k2', periodStart: '2024-12-09', periodEnd: '2024-12-15', periodType: 'week', value: 39.2, status: 'healthy', trendDirection: 'up', ingestedAt: '' },
      { id: 'v7', kpiDefinitionId: 'k2', periodStart: '2024-12-16', periodEnd: '2024-12-22', periodType: 'week', value: 40.1, status: 'healthy', trendDirection: 'up', ingestedAt: '' },
      { id: 'v8', kpiDefinitionId: 'k2', periodStart: '2024-12-23', periodEnd: '2024-12-29', periodType: 'week', value: 39.8, status: 'healthy', trendDirection: 'down', ingestedAt: '' },
    ],
    annotations: [],
    relatedGaps: [],
  },
  {
    id: 'k1000000-0000-0000-0000-000000000003',
    processId: 'p5000000-0000-0000-0000-000000000001',
    name: 'Missing Time Entries',
    shortName: 'Missing',
    description: 'Number of staff with missing time entries',
    unit: 'count',
    direction: 'lower_better',
    targetValue: 0,
    warningThreshold: 2,
    criticalThreshold: 5,
    dataSource: 'excel_harvest',
    refreshCadence: 'weekly',
    displayFormat: 'number',
    chartType: 'bar',
    isPrimary: false,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    process: {} as any,
    domain: {} as any,
    values: [
      { id: 'v9', kpiDefinitionId: 'k3', periodStart: '2024-12-02', periodEnd: '2024-12-08', periodType: 'week', value: 4, status: 'warning', trendDirection: 'down', ingestedAt: '' },
      { id: 'v10', kpiDefinitionId: 'k3', periodStart: '2024-12-09', periodEnd: '2024-12-15', periodType: 'week', value: 3, status: 'warning', trendDirection: 'down', ingestedAt: '' },
      { id: 'v11', kpiDefinitionId: 'k3', periodStart: '2024-12-16', periodEnd: '2024-12-22', periodType: 'week', value: 2, status: 'warning', trendDirection: 'down', ingestedAt: '' },
      { id: 'v12', kpiDefinitionId: 'k3', periodStart: '2024-12-23', periodEnd: '2024-12-29', periodType: 'week', value: 1, status: 'healthy', trendDirection: 'down', ingestedAt: '' },
    ],
    annotations: [],
    relatedGaps: [],
  },
];

const MOCK_GAPS: ProcessGap[] = [
  {
    id: 'g1',
    processId: 'p5000000-0000-0000-0000-000000000001',
    gapType: 'tooling',
    title: 'Automated compliance reminders',
    description: 'Need automated email reminders for staff who have not submitted time by Thursday.',
    severity: 'medium',
    status: 'in_progress',
    identifiedDate: '2024-11-15',
    assignedTo: 'Jordana',
    createdAt: '',
    updatedAt: '',
  },
];

export default function ProcessDetailPage() {
  const params = useParams();
  const domainId = params.domainId as string;
  const processId = params.processId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIDetail[]>([]);
  const [gaps, setGaps] = useState<ProcessGap[]>([]);

  const domain = DEFAULT_DOMAINS.find(d => d.id === domainId);
  const processName = MOCK_KPI_DATA[0]?.process?.name || 'Process';

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setKpis(MOCK_KPI_DATA);
      setGaps(MOCK_GAPS);
      setIsLoading(false);
    }, 300);
  }, [processId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: domain?.shortName || 'Domain', href: `/domain/${domainId}` },
            { label: processName }
          ]}
        />

        {/* Process Header */}
        <div className="mb-8">
          <Link
            href={`/domain/${domainId}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft size={16} />
            Back to {domain?.shortName}
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{processName}</h1>
              <p className="text-gray-500 mt-1">
                Harvest time entry compliance and management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SOPStatusBadge status="documented" link="#" />
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {kpis.map(kpi => (
            <KPISummaryCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: KPI Charts */}
          <div className="lg:col-span-2 space-y-6">
            {kpis.map(kpi => (
              <KPIChartCard key={kpi.id} kpi={kpi} domainColor={domain?.colorHex || '#666'} />
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Annotations */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Notes & Insights
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {kpis[0]?.annotations?.length > 0 ? (
                <div className="space-y-4">
                  {kpis[0].annotations.map(annotation => (
                    <AnnotationCard key={annotation.id} annotation={annotation} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No annotations yet</p>
              )}
            </div>

            {/* Process Gaps */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  Identified Gaps
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {gaps.length > 0 ? (
                <div className="space-y-3">
                  {gaps.map(gap => (
                    <GapCard key={gap.id} gap={gap} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No gaps identified</p>
              )}
            </div>

            {/* Data Source Info */}
            <div className="rounded-lg border bg-gray-50 p-5">
              <h3 className="font-medium text-gray-700 mb-3">Data Source</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Source</span>
                  <span className="text-gray-900">Excel (Harvest)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Refresh</span>
                  <span className="text-gray-900">Weekly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last updated</span>
                  <span className="text-gray-900">Dec 29, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function KPISummaryCard({ kpi }: { kpi: KPIDetail }) {
  const latest = kpi.values[kpi.values.length - 1];
  if (!latest) return null;

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-600">{kpi.shortName}</span>
        <StatusBadge status={latest.status || 'healthy'} size="sm" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">
          {formatValue(latest.value, kpi.displayFormat)}
        </span>
        {latest.trendDirection && (
          <TrendIndicator
            direction={latest.trendDirection}
            kpiDirection={kpi.direction}
            showLabel
          />
        )}
      </div>
      {kpi.targetValue !== undefined && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Target size={12} />
          Target: {formatValue(kpi.targetValue, kpi.displayFormat)}
        </div>
      )}
    </div>
  );
}

function KPIChartCard({ kpi, domainColor }: { kpi: KPIDetail; domainColor: string }) {
  const chartData = kpi.values.map(v => ({
    period: formatPeriod(v.periodStart, v.periodEnd).split(' - ')[0],
    value: v.value,
    status: v.status,
  }));

  const latest = kpi.values[kpi.values.length - 1];
  const chartColor = latest?.status === 'critical' ? '#dc2626' :
                     latest?.status === 'warning' ? '#d97706' : domainColor;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{kpi.name}</h3>
          {kpi.description && (
            <p className="text-sm text-gray-500 mt-0.5">{kpi.description}</p>
          )}
        </div>
        <span className="text-sm text-gray-400">{kpi.refreshCadence}</span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {kpi.chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              {kpi.targetValue !== undefined && (
                <ReferenceLine y={kpi.targetValue} stroke="#16a34a" strokeDasharray="5 5" label="Target" />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                dot={{ fill: chartColor, strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              {kpi.targetValue !== undefined && (
                <ReferenceLine y={kpi.targetValue} stroke="#16a34a" strokeDasharray="5 5" />
              )}
              <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Thresholds Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t text-xs">
        {kpi.targetValue !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }} />
            <span className="text-gray-500">Target: {formatValue(kpi.targetValue, kpi.displayFormat)}</span>
          </div>
        )}
        {kpi.warningThreshold !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" />
            <span className="text-gray-500">Warning: &lt;{formatValue(kpi.warningThreshold, kpi.displayFormat)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnotationCard({ annotation }: { annotation: Annotation }) {
  return (
    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
      {annotation.title && (
        <p className="font-medium text-blue-900 text-sm mb-1">{annotation.title}</p>
      )}
      <p className="text-sm text-blue-800">{annotation.content}</p>
      <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
        {annotation.authorName && <span>{annotation.authorName}</span>}
        <span>•</span>
        <span>{new Date(annotation.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function GapCard({ gap }: { gap: ProcessGap }) {
  const severityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  const statusColors = {
    open: 'text-red-600',
    in_progress: 'text-amber-600',
    blocked: 'text-gray-600',
    resolved: 'text-green-600',
    wont_fix: 'text-gray-400',
  };

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded ${severityColors[gap.severity]}`}>
          {gap.severity}
        </span>
        <span className={`text-xs font-medium ${statusColors[gap.status]}`}>
          {gap.status.replace('_', ' ')}
        </span>
      </div>
      <p className="font-medium text-gray-900 text-sm">{gap.title}</p>
      {gap.description && (
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{gap.description}</p>
      )}
      {gap.assignedTo && (
        <p className="text-xs text-gray-500 mt-2">Assigned: {gap.assignedTo}</p>
      )}
    </div>
  );
}

function SOPStatusBadge({ status, link }: { status: string; link?: string }) {
  const isDocumented = status === 'documented';

  return (
    <a
      href={link || '#'}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
        isDocumented
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <FileText size={14} />
      {isDocumented ? 'View SOP' : 'No SOP'}
      {isDocumented && <ExternalLink size={12} />}
    </a>
  );
}
