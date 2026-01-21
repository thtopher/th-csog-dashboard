'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Calculator, Database, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SourceTooltip } from '@/components/common/CodeTooltip';
import type { AuditMetadata } from '@/types';

interface MetricDisplay {
  label: string;
  value: string;
  change?: number;
  lowerIsBetter?: boolean;
}

interface ScorecardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  source: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics: MetricDisplay[];
  audit?: AuditMetadata;
}

export function ScorecardDetailModal({
  isOpen,
  onClose,
  title,
  source,
  status,
  metrics,
  audit,
}: ScorecardDetailModalProps) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {title}
              </Dialog.Title>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[status])}>
                {status === 'healthy' ? 'On Track' : status === 'warning' ? 'Needs Attention' : 'Critical'}
              </span>
            </div>
            <Dialog.Close className="rounded-full p-1 hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Current Metrics */}
            <section>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Current Values</h3>
              <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                    <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                    {metric.change !== undefined && (
                      <p className={cn(
                        'text-xs mt-1',
                        metric.lowerIsBetter
                          ? metric.change < 0 ? 'text-green-600' : 'text-red-600'
                          : metric.change > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% vs prior period
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Data Source */}
            <section>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Database size={14} />
                Data Source
              </h3>
              <div className="rounded-lg bg-gray-50 p-3">
                <SourceTooltip source={source} className="text-sm font-medium text-gray-900" />
              </div>
            </section>

            {/* Calculation Method */}
            {audit && (
              <>
                <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Calculator size={14} />
                    How It's Calculated
                  </h3>
                  <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                    <p className="text-sm text-gray-700">{audit.calculationMethod}</p>
                    {audit.formula && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Formula</p>
                        <code className="text-sm font-mono text-blue-700">{audit.formula}</code>
                      </div>
                    )}
                  </div>
                </section>

                {/* Data Sources with Attribution */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Clock size={14} />
                    Data Sources & Attribution
                  </h3>
                  <div className="space-y-2">
                    {audit.dataSources.map((source, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{source.name}</p>
                          {source.recordCount && (
                            <span className="text-xs text-gray-400">{source.recordCount} records</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Updated {new Date(source.lastUpdated).toLocaleDateString()}
                          </span>
                          {source.uploadedBy && (
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {source.uploadedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Last Calculated */}
                <div className="text-xs text-gray-400 text-center pt-2 border-t">
                  Last calculated: {new Date(audit.calculatedAt).toLocaleString()}
                </div>
              </>
            )}

            {!audit && (
              <div className="text-center py-4 text-sm text-gray-500">
                Audit information not available for this metric.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
