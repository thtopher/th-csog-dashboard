'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BUSINESS_KPIS,
  KPI_CATEGORIES,
  KPI_STORAGE_KEY,
  type BusinessKPI,
  type KPISnapshot,
} from '@/config/businessKpis';
import { cn } from '@/lib/utils/cn';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  X,
} from 'lucide-react';

export function BusinessKPIs() {
  const [snapshots, setSnapshots] = useState<KPISnapshot[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  // Load snapshots: API first, localStorage as cache/fallback
  useEffect(() => {
    // Show cached data immediately
    try {
      const stored = localStorage.getItem(KPI_STORAGE_KEY);
      if (stored) setSnapshots(JSON.parse(stored));
    } catch { /* */ }

    // Then fetch from API
    fetch('/api/kpi-snapshots')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.snapshots?.length) {
          setSnapshots(data.snapshots);
          localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(data.snapshots));
        }
      })
      .catch(() => { /* keep localStorage values */ });
  }, []);

  const saveSnapshot = useCallback(
    (snapshot: KPISnapshot) => {
      const updated = [...snapshots, snapshot].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setSnapshots(updated);
      localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(updated));

      // Persist to API
      fetch('/api/kpi-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      }).catch(() => { /* localStorage fallback already saved */ });
    },
    [snapshots]
  );

  const getLatestValue = (kpiId: string): KPISnapshot | undefined => {
    const kpiSnapshots = snapshots.filter((s) => s.kpiId === kpiId);
    return kpiSnapshots[kpiSnapshots.length - 1];
  };

  const getPreviousValue = (kpiId: string): KPISnapshot | undefined => {
    const kpiSnapshots = snapshots.filter((s) => s.kpiId === kpiId);
    return kpiSnapshots.length > 1 ? kpiSnapshots[kpiSnapshots.length - 2] : undefined;
  };

  const getHistory = (kpiId: string): KPISnapshot[] => {
    return snapshots.filter((s) => s.kpiId === kpiId);
  };

  return (
    <div className="space-y-8">
      {/* Category Sections */}
      {KPI_CATEGORIES.map((cat) => {
        const kpis = BUSINESS_KPIS.filter((k) => k.category === cat.id);
        if (kpis.length === 0) return null;
        return (
          <CategorySection key={cat.id} category={cat}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi) => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  latest={getLatestValue(kpi.id)}
                  previous={getPreviousValue(kpi.id)}
                  history={getHistory(kpi.id)}
                  categoryColor={cat.color}
                  onAddValue={() => {
                    setSelectedKpiId(kpi.id);
                    setShowAddModal(true);
                  }}
                />
              ))}
            </div>
          </CategorySection>
        );
      })}

      {/* Add Value Modal */}
      {showAddModal && selectedKpiId && (
        <AddValueModal
          kpi={BUSINESS_KPIS.find((k) => k.id === selectedKpiId)!}
          onSave={(snapshot) => {
            saveSnapshot(snapshot);
            setShowAddModal(false);
            setSelectedKpiId(null);
          }}
          onClose={() => {
            setShowAddModal(false);
            setSelectedKpiId(null);
          }}
        />
      )}
    </div>
  );
}

function CategorySection({
  category,
  children,
}: {
  category: { id: string; label: string; color: string };
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
      </div>
      {children}
    </div>
  );
}

function KPICard({
  kpi,
  latest,
  previous,
  history,
  categoryColor,
  onAddValue,
}: {
  kpi: BusinessKPI;
  latest?: KPISnapshot;
  previous?: KPISnapshot;
  history: KPISnapshot[];
  categoryColor: string;
  onAddValue: () => void;
}) {
  const formatValue = (val: number) => {
    if (kpi.unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (kpi.unit === 'percent') return `${val}%`;
    return val.toLocaleString();
  };

  const trend =
    latest && previous
      ? latest.value > previous.value
        ? 'up'
        : latest.value < previous.value
          ? 'down'
          : 'flat'
      : null;

  const trendIsGood =
    trend === null
      ? null
      : kpi.direction === 'higher_better'
        ? trend === 'up'
        : trend === 'down';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 relative group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{kpi.name}</p>
          {latest ? (
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{formatValue(latest.value)}</p>
              {trend && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    trendIsGood ? 'text-emerald-600' : trendIsGood === false ? 'text-red-600' : 'text-gray-400'
                  )}
                >
                  {trend === 'up' && <TrendingUp size={12} />}
                  {trend === 'down' && <TrendingDown size={12} />}
                  {trend === 'flat' && <Minus size={12} />}
                  {previous && (
                    <span>
                      {Math.abs(
                        Math.round(((latest.value - previous.value) / (previous.value || 1)) * 100)
                      )}
                      %
                    </span>
                  )}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-1 text-lg font-medium text-gray-300">No data yet</p>
          )}
        </div>
        <button
          onClick={onAddValue}
          className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          title="Add value"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Target indicator */}
      {kpi.target !== undefined && (
        <div className="mt-1">
          {latest && kpi.unit !== 'percent' ? (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{Math.round((latest.value / kpi.target) * 100)}% of goal</span>
                <span>Target: {formatValue(kpi.target)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (latest.value / kpi.target) * 100)}%`,
                    backgroundColor: categoryColor,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Target: {formatValue(kpi.target)}
            </p>
          )}
        </div>
      )}

      {/* Mini sparkline area */}
      {history.length > 1 && (
        <div className="mt-3">
          <MiniSparkline data={history.map((s) => s.value)} color={categoryColor} />
        </div>
      )}

      {/* Last updated */}
      {latest && (
        <p className="mt-2 text-xs text-gray-400">
          Updated {new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {latest.note && ` \u2014 ${latest.note}`}
        </p>
      )}

      {/* Description tooltip */}
      <p className="mt-2 text-xs text-gray-400">{kpi.description}</p>
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 200;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <path d={areaPath} fill={color} opacity={0.1} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2.5} fill={color} />
    </svg>
  );
}

function AddValueModal({
  kpi,
  onSave,
  onClose,
}: {
  kpi: BusinessKPI;
  onSave: (snapshot: KPISnapshot) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    onSave({
      kpiId: kpi.id,
      date,
      value: numValue,
      note: note || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add {kpi.name} Value</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value {kpi.unit === 'currency' && '($)'}{kpi.unit === 'percent' && '(%)'}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={kpi.unit === 'currency' ? '0' : kpi.unit === 'percent' ? '0' : '0'}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Q1 close numbers"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
