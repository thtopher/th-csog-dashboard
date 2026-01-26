'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { X, Upload, BarChart3, Users, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { UPLOAD_SCHEDULE, CADENCE_CONFIG } from '@/config/uploadSchedule';
import { DEFAULT_EXECUTIVES } from '@/config/executives';
import type { LucideIcon } from 'lucide-react';

interface UploadCompliance {
  executiveId: string;
  executiveName: string;
  title: string;
  totalRequired: number;
  totalCompleted: number;
  pendingUploads: string[];
}

type StatType = 'uploads' | 'compliance' | 'pending' | 'executives';

interface StatCardModalProps {
  type: StatType;
  isOpen: boolean;
  onClose: () => void;
  compliance: UploadCompliance[];
  totalCompleted: number;
  totalRequired: number;
}

const STAT_CONFIG: Record<StatType, { title: string; icon: LucideIcon; color: string }> = {
  uploads: { title: 'Uploads This Period', icon: Upload, color: 'blue' },
  compliance: { title: 'Compliance Rate', icon: BarChart3, color: 'green' },
  pending: { title: 'Pending Uploads', icon: Users, color: 'amber' },
  executives: { title: 'Active Executives', icon: Shield, color: 'purple' },
};

export function StatCardModal({
  type,
  isOpen,
  onClose,
  compliance,
  totalCompleted,
  totalRequired,
}: StatCardModalProps) {
  const config = STAT_CONFIG[type];
  const Icon = config.icon;

  // Calculate cadence breakdown
  const weeklyCadence = UPLOAD_SCHEDULE.filter(s => s.cadence === 'weekly');
  const monthlyCadence = UPLOAD_SCHEDULE.filter(s => s.cadence === 'monthly');
  const quarterlyCadence = UPLOAD_SCHEDULE.filter(s => s.cadence === 'quarterly');

  // Get all pending uploads with executive info
  const allPendingUploads = compliance.flatMap(c =>
    c.pendingUploads.map(upload => ({
      uploadName: upload,
      executiveName: c.executiveName,
      executiveTitle: c.title,
    }))
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                config.color === 'blue' && 'bg-blue-100',
                config.color === 'green' && 'bg-green-100',
                config.color === 'amber' && 'bg-amber-100',
                config.color === 'purple' && 'bg-purple-100',
              )}>
                <Icon size={18} className={cn(
                  config.color === 'blue' && 'text-blue-600',
                  config.color === 'green' && 'text-green-600',
                  config.color === 'amber' && 'text-amber-600',
                  config.color === 'purple' && 'text-purple-600',
                )} />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {config.title}
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-full p-1 hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
            {type === 'uploads' && (
              <>
                {/* Summary */}
                <div className="text-center pb-4 border-b">
                  <p className="text-3xl font-bold text-gray-900">{totalCompleted}/{totalRequired}</p>
                  <p className="text-sm text-gray-500 mt-1">uploads completed this period</p>
                </div>

                {/* Cadence Breakdown */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">What&apos;s Included</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium text-gray-900">Weekly uploads</span>
                      </div>
                      <span className="text-sm text-gray-600">{weeklyCadence.length} types</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium text-gray-900">Monthly uploads</span>
                      </div>
                      <span className="text-sm text-gray-600">{monthlyCadence.length} types</span>
                    </div>
                  </div>
                </section>

                {/* Excluded */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Not Included (Tracked Separately)</h3>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium text-gray-900">Quarterly uploads</span>
                      </div>
                      <span className="text-sm text-gray-600">{quarterlyCadence.length} types</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {quarterlyCadence.map(q => q.uploadTypeName).join(', ')}
                    </div>
                  </div>
                </section>

                {/* Explanation */}
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <strong>Why {totalRequired} instead of 13?</strong> The dashboard tracks {weeklyCadence.length + monthlyCadence.length} weekly and monthly uploads per period.
                  The {quarterlyCadence.length} quarterly uploads are tracked separately on a quarterly basis.
                </div>
              </>
            )}

            {type === 'compliance' && (
              <>
                {/* Summary */}
                <div className="text-center pb-4 border-b">
                  <p className="text-3xl font-bold text-gray-900">
                    {totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">overall compliance rate</p>
                </div>

                {/* By Executive */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">By Executive</h3>
                  <div className="space-y-2">
                    {compliance.map((c) => {
                      const rate = c.totalRequired > 0 ? Math.round((c.totalCompleted / c.totalRequired) * 100) : 0;
                      return (
                        <div key={c.executiveId} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{c.executiveName}</p>
                            <p className="text-xs text-gray-500">{c.title}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              'text-lg font-bold',
                              rate === 100 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'
                            )}>
                              {rate}%
                            </p>
                            <p className="text-xs text-gray-500">{c.totalCompleted}/{c.totalRequired}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {type === 'pending' && (
              <>
                {/* Summary */}
                <div className="text-center pb-4 border-b">
                  <p className="text-3xl font-bold text-gray-900">{allPendingUploads.length}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    pending uploads across {compliance.filter(c => c.pendingUploads.length > 0).length} executives
                  </p>
                </div>

                {/* Pending List */}
                {allPendingUploads.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
                    <p className="text-gray-600">All uploads are complete!</p>
                  </div>
                ) : (
                  <section>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Pending Uploads</h3>
                    <div className="space-y-2">
                      {allPendingUploads.map((pending, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
                          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pending.uploadName}</p>
                            <p className="text-xs text-gray-500">{pending.executiveName} ({pending.executiveTitle})</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {type === 'executives' && (
              <>
                {/* Summary */}
                <div className="text-center pb-4 border-b">
                  <p className="text-3xl font-bold text-gray-900">{DEFAULT_EXECUTIVES.length}</p>
                  <p className="text-sm text-gray-500 mt-1">active executives with upload responsibilities</p>
                </div>

                {/* Executive List */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Executive Roster</h3>
                  <div className="space-y-2">
                    {DEFAULT_EXECUTIVES.map((exec) => {
                      const execCompliance = compliance.find(c => c.executiveId === exec.id);
                      const uploadsForExec = UPLOAD_SCHEDULE.filter(s => s.executiveId === exec.id);
                      return (
                        <div key={exec.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{exec.name}</p>
                            <p className="text-xs text-gray-500">{exec.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">
                              {uploadsForExec.length} upload{uploadsForExec.length !== 1 ? 's' : ''}
                            </p>
                            {execCompliance && (
                              <p className="text-xs text-gray-500">
                                {execCompliance.totalCompleted}/{execCompliance.totalRequired} this period
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
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

interface StatCardProps {
  type: StatType;
  value: string | number;
  label: string;
  tooltipText: string;
  onClick: () => void;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export function StatCard({
  type,
  value,
  label,
  tooltipText,
  onClick,
  icon: Icon,
  iconBgColor,
  iconColor,
}: StatCardProps) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className="bg-white rounded-lg border p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left w-full group"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', iconBgColor)}>
                <Icon size={18} className={iconColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 group-hover:text-gray-700">{label}</p>
              </div>
            </div>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
            sideOffset={5}
          >
            <p className="text-sm text-gray-700">{tooltipText}</p>
            <p className="text-xs text-gray-400 mt-1">Click for details</p>
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
