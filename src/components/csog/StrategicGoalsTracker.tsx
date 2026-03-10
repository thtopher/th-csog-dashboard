'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  STRATEGIC_MILESTONES,
  QUARTER_LABELS,
  OWNER_COLORS,
  type StrategicMilestone,
  type MilestoneStatus,
} from '@/config/strategicGoals';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2, AlertTriangle, Clock, Circle, GripVertical, Filter, X } from 'lucide-react';
import { ProgressSlider } from './ProgressSlider';

const PROGRESS_KEY = 'th-csog-wmbt-progress';
const ORDER_KEY = 'th-csog-wmbt-order';

const STATUS_CONFIG: Record<MilestoneStatus, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  complete: { color: 'text-emerald-600', bg: 'bg-emerald-500', icon: CheckCircle2, label: 'Complete' },
  in_progress: { color: 'text-amber-600', bg: 'bg-amber-500', icon: Clock, label: 'In Progress' },
  not_started: { color: 'text-gray-400', bg: 'bg-gray-300', icon: Circle, label: 'Not Started' },
  at_risk: { color: 'text-red-600', bg: 'bg-red-500', icon: AlertTriangle, label: 'At Risk' },
};

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

function deriveStatus(progress: number, previousStatus?: MilestoneStatus): MilestoneStatus {
  if (previousStatus === 'at_risk' && progress < 75) return 'at_risk';
  if (progress >= 100) return 'complete';
  if (progress > 0) return 'in_progress';
  return 'not_started';
}

// ── Persistence helpers ──

type ProgressOverrides = Record<string, number>;
type SortOrders = Record<string, string[]>; // quarter -> ordered milestone IDs

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}
function saveLocal(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* */ }
}

let progressTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedProgressSave(milestoneId: string, progress: number) {
  if (progressTimers[milestoneId]) clearTimeout(progressTimers[milestoneId]);
  progressTimers[milestoneId] = setTimeout(() => {
    fetch('/api/strategic-goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId, progress }),
    }).catch(() => {});
  }, 500);
}

let orderTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedOrderSave(orders: SortOrders) {
  if (orderTimer) clearTimeout(orderTimer);
  orderTimer = setTimeout(() => {
    fetch('/api/strategic-goals/order', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    }).catch(() => {});
  }, 800);
}

// ── Main component ──

export function StrategicGoalsTracker() {
  const [activeQuarter, setActiveQuarter] = useState<string | 'all'>('all');
  const [activeOwner, setActiveOwner] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [overrides, setOverrides] = useState<ProgressOverrides>({});
  const [sortOrders, setSortOrders] = useState<SortOrders>({});

  // Load persisted state
  useEffect(() => {
    setOverrides(loadLocal(PROGRESS_KEY, {}));
    setSortOrders(loadLocal(ORDER_KEY, {}));

    // Fetch from API
    fetch('/api/strategic-goals')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.progress && Object.keys(data.progress).length > 0) {
          setOverrides(data.progress);
          saveLocal(PROGRESS_KEY, data.progress);
        }
        if (data?.orders && Object.keys(data.orders).length > 0) {
          setSortOrders(data.orders);
          saveLocal(ORDER_KEY, data.orders);
        }
      })
      .catch(() => {});
  }, []);

  const updateProgress = useCallback((id: string, value: number) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: value };
      saveLocal(PROGRESS_KEY, next);
      debouncedProgressSave(id, value);
      return next;
    });
  }, []);

  const updateOrder = useCallback((quarter: string, ids: string[]) => {
    setSortOrders((prev) => {
      const next = { ...prev, [quarter]: ids };
      saveLocal(ORDER_KEY, next);
      debouncedOrderSave(next);
      return next;
    });
  }, []);

  // Build milestones with overridden progress
  const milestones = useMemo(() =>
    STRATEGIC_MILESTONES.map((m) => {
      const progress = overrides[m.id] ?? m.progress;
      return { ...m, progress, status: deriveStatus(progress, m.status) };
    }),
    [overrides]
  );

  // Unique owners for filter buttons
  const allOwners = useMemo(() => {
    const set = new Set<string>();
    milestones.forEach((m) => m.owners.forEach((o) => set.add(o)));
    // Sort: named people first, then "All"/"All CSOG" last
    return Array.from(set).sort((a, b) => {
      const aGeneric = a.startsWith('All') ? 1 : 0;
      const bGeneric = b.startsWith('All') ? 1 : 0;
      if (aGeneric !== bGeneric) return aGeneric - bGeneric;
      return a.localeCompare(b);
    });
  }, [milestones]);

  // Apply owner filter
  const filteredMilestones = useMemo(() =>
    activeOwner === 'all'
      ? milestones
      : milestones.filter((m) => m.owners.includes(activeOwner)),
    [milestones, activeOwner]
  );

  // Sort milestones per quarter using persisted order
  const milestonesByQuarter = useMemo(() =>
    QUARTERS.map((q) => {
      const qMilestones = filteredMilestones.filter((m) => m.quarter === q);
      const order = sortOrders[q];
      if (order) {
        const ordered: StrategicMilestone[] = [];
        for (const id of order) {
          const found = qMilestones.find((m) => m.id === id);
          if (found) ordered.push(found);
        }
        // Append any milestones not in the saved order (new ones)
        for (const m of qMilestones) {
          if (!order.includes(m.id)) ordered.push(m);
        }
        return { quarter: q, label: QUARTER_LABELS[q], milestones: ordered };
      }
      return { quarter: q, label: QUARTER_LABELS[q], milestones: qMilestones };
    }),
    [filteredMilestones, sortOrders]
  );

  const totalCount = filteredMilestones.length;
  const completeCount = filteredMilestones.filter((m) => m.status === 'complete').length;
  const atRiskCount = filteredMilestones.filter((m) => m.status === 'at_risk').length;
  const inProgressCount = filteredMilestones.filter((m) => m.status === 'in_progress').length;
  const overallProgress = totalCount
    ? Math.round(filteredMilestones.reduce((sum, m) => sum + m.progress, 0) / totalCount)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Milestones" value={totalCount} />
        <SummaryCard label="Complete" value={completeCount} accent="text-emerald-600" />
        <SummaryCard label="In Progress" value={inProgressCount} accent="text-amber-600" />
        <SummaryCard label="At Risk" value={atRiskCount} accent="text-red-600" />
      </div>

      {/* Overall Progress + Filter Toggle */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall 2026 Progress</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{overallProgress}%</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'relative rounded-lg p-1.5 transition-colors',
                showFilters
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              )}
              title="Filter milestones"
            >
              <Filter size={16} />
              {(activeQuarter !== 'all' || activeOwner !== 'all') && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-500 border border-white" />
              )}
            </button>
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Progress as of March 2026 &middot; {completeCount} of {totalCount} milestones complete
        </p>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {/* Quarter Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-16 shrink-0">Quarter</span>
              <button
                onClick={() => setActiveQuarter('all')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  activeQuarter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                All
              </button>
              {QUARTERS.map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveQuarter(q)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    activeQuarter === q
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Owner Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-16 shrink-0">Owner</span>
              <button
                onClick={() => setActiveOwner('all')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  activeOwner === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                All
              </button>
              {allOwners.map((owner) => (
                <button
                  key={owner}
                  onClick={() => setActiveOwner(activeOwner === owner ? 'all' : owner)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    activeOwner === owner
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  style={activeOwner === owner ? { backgroundColor: OWNER_COLORS[owner] || '#374151' } : undefined}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: OWNER_COLORS[owner] || '#6b7280' }}
                  />
                  {owner}
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {(activeQuarter !== 'all' || activeOwner !== 'all') && (
              <button
                onClick={() => { setActiveQuarter('all'); setActiveOwner('all'); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Milestone Columns */}
      {activeQuarter === 'all' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4 overflow-hidden">
          {milestonesByQuarter.map(({ quarter, label, milestones: qm }) => (
            <SortableQuarterColumn
              key={quarter}
              quarter={quarter}
              label={label}
              milestones={qm}
              onUpdateProgress={updateProgress}
              onReorder={(ids) => updateOrder(quarter, ids)}
              layout="list"
            />
          ))}
        </div>
      ) : (
        milestonesByQuarter
          .filter(({ quarter }) => quarter === activeQuarter)
          .map(({ quarter, label, milestones: qm }) => (
            <SortableQuarterColumn
              key={quarter}
              quarter={quarter}
              label={label}
              milestones={qm}
              onUpdateProgress={updateProgress}
              onReorder={(ids) => updateOrder(quarter, ids)}
              layout="cards"
            />
          ))
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn('inline-block h-2.5 w-2.5 rounded-sm', cfg.bg)} />
            {cfg.label}
          </span>
        ))}
        <span className="text-gray-400 ml-2">Drag to reorder &middot; Slide to update progress</span>
      </div>
    </div>
  );
}

// ── Sortable quarter wrapper ──

function SortableQuarterColumn({
  quarter,
  label,
  milestones,
  onUpdateProgress,
  onReorder,
  layout,
}: {
  quarter: string;
  label: string;
  milestones: StrategicMilestone[];
  onUpdateProgress: (id: string, value: number) => void;
  onReorder: (ids: string[]) => void;
  layout: 'list' | 'cards';
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = milestones.map((m) => m.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    onReorder(newIds);
  }

  const qComplete = milestones.filter((m) => m.status === 'complete').length;
  const qProgress = milestones.length
    ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
    : 0;

  const strategy = layout === 'cards' ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <div className={cn(
      'rounded-lg border border-gray-200 bg-white overflow-hidden min-w-0',
      layout === 'cards' && 'border-0 bg-transparent overflow-visible'
    )}>
      {/* Quarter header */}
      <div className={cn(
        'bg-gray-900 px-4 py-3',
        layout === 'cards' && 'rounded-lg mb-4'
      )}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{label}</h3>
          <span className="text-xs text-gray-300">
            {qComplete}/{milestones.length} done
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${qProgress}%` }}
          />
        </div>
      </div>

      {/* Sortable items */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={strategy}>
          <div className={cn(
            layout === 'list' && 'divide-y divide-gray-100',
            layout === 'cards' && 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          )}>
            {milestones.map((m) => (
              <SortableMilestone
                key={m.id}
                milestone={m}
                onUpdateProgress={onUpdateProgress}
                layout={layout}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ── Sortable milestone item ──

function SortableMilestone({
  milestone: m,
  onUpdateProgress,
  layout,
}: {
  milestone: StrategicMilestone;
  onUpdateProgress: (id: string, value: number) => void;
  layout: 'list' | 'cards';
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: m.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const cfg = STATUS_CONFIG[m.status];
  const Icon = cfg.icon;

  const fillCssColor =
    m.status === 'at_risk'
      ? '#ef4444'
      : m.progress >= 75
        ? '#10b981'
        : m.progress > 0
          ? '#f59e0b'
          : '#d1d5db';

  const thumbColor =
    m.status === 'at_risk'
      ? '#ef4444'
      : m.progress >= 75
        ? '#10b981'
        : m.progress > 0
          ? '#f59e0b'
          : '#d1d5db';

  if (layout === 'cards') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'rounded-lg border border-gray-200 bg-white p-4 transition-shadow min-w-0',
          isDragging && 'shadow-lg ring-2 ring-blue-200 opacity-90'
        )}
      >
        <div className="flex items-start gap-2 mb-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
            tabIndex={-1}
          >
            <GripVertical size={14} />
          </button>
          <Icon size={14} className={cn('mt-0.5 shrink-0', cfg.color)} />
          <p className="text-sm font-medium text-gray-900 leading-tight flex-1">{m.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {m.owners.map((owner) => (
            <span key={owner} className="inline-flex items-center gap-1 text-xs">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: OWNER_COLORS[owner] || '#6b7280' }}
              />
              <span className="text-gray-600">{owner}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ProgressSlider
            value={m.progress}
            onChange={(v) => onUpdateProgress(m.id, v)}
            thumbColor={thumbColor}
            fillColor={fillCssColor}
            label={`${m.progress}% — drag to adjust`}
          />
          <span className="text-xs font-medium text-gray-600 tabular-nums text-right shrink-0">
            {m.progressLabel || `${m.progress}%`}
          </span>
        </div>
      </div>
    );
  }

  // List layout (All Quarters view)
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'px-4 py-3',
        isDragging && 'bg-blue-50 shadow-md ring-1 ring-blue-200 rounded-lg opacity-90'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>
        <Icon size={14} className={cn('mt-0.5 shrink-0', cfg.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-tight">{m.title}</p>
          <div className="mt-1 flex items-center gap-2">
            {m.owners.map((owner) => (
              <span key={owner} className="inline-flex items-center gap-1 text-xs">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: OWNER_COLORS[owner] || '#6b7280' }}
                />
                <span className="text-gray-600">{owner}</span>
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <ProgressSlider
              value={m.progress}
              onChange={(v) => onUpdateProgress(m.id, v)}
              thumbColor={thumbColor}
              fillColor={fillCssColor}
              label={`${m.progress}% — drag to adjust`}
            />
            <span className="text-xs font-medium text-gray-600 tabular-nums text-right shrink-0">
              {m.progressLabel || `${m.progress}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={cn('text-2xl font-bold', accent || 'text-gray-900')}>{value}</p>
    </div>
  );
}
