'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { X, Calendar, Check, AlertTriangle, Clock, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/common/Avatar';
import { CADENCE_CONFIG } from '@/config/uploadSchedule';
import type { CalendarEvent, UploadStatus } from '@/types';

interface CalendarDayModalProps {
  date: Date;
  events: CalendarEvent[];
  isOpen: boolean;
  onClose: () => void;
}

function StatusIcon({ status }: { status: UploadStatus }) {
  switch (status) {
    case 'completed':
      return <Check size={14} className="text-green-600" />;
    case 'overdue':
      return <AlertTriangle size={14} className="text-red-600" />;
    case 'pending':
      return <Clock size={14} className="text-amber-600" />;
    default:
      return <Clock size={14} className="text-gray-400" />;
  }
}

function StatusBadge({ status }: { status: UploadStatus }) {
  const config = {
    completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
    overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-700' },
    pending: { label: 'Due Soon', bg: 'bg-amber-100', text: 'text-amber-700' },
    upcoming: { label: 'Upcoming', bg: 'bg-gray-100', text: 'text-gray-700' },
  };
  const { label, bg, text } = config[status];

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', bg, text)}>
      {label}
    </span>
  );
}

export function CalendarDayModal({ date, events, isOpen, onClose }: CalendarDayModalProps) {
  // Group events by executive
  const eventsByExecutive = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.executiveId]) {
      acc[event.executiveId] = [];
    }
    acc[event.executiveId].push(event);
    return acc;
  }, {});

  const completedCount = events.filter(e => e.status === 'completed').length;
  const overdueCount = events.filter(e => e.status === 'overdue').length;
  const pendingCount = events.filter(e => e.status === 'pending').length;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  {format(date, 'EEEE, MMMM d')}
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  {events.length} upload{events.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
            </div>
            <Dialog.Close className="rounded-full p-1 hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Summary Stats */}
          {events.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-4 text-sm">
              {completedCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600">{completedCount} completed</span>
                </span>
              )}
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-600">{pendingCount} pending</span>
                </span>
              )}
              {overdueCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-600">{overdueCount} overdue</span>
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <FileSpreadsheet size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No uploads scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(eventsByExecutive).map(([executiveId, execEvents]) => {
                  const firstEvent = execEvents[0];
                  return (
                    <div key={executiveId} className="border rounded-lg overflow-hidden">
                      {/* Executive Header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b">
                        <Avatar
                          executiveId={executiveId}
                          name={firstEvent.executiveName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{firstEvent.executiveName}</p>
                          <p className="text-xs text-gray-500">
                            {execEvents.length} upload{execEvents.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Uploads List */}
                      <div className="divide-y">
                        {execEvents.map((event, idx) => {
                          const cadenceConfig = CADENCE_CONFIG[event.cadence];
                          return (
                            <div
                              key={`${event.uploadTypeId}-${idx}`}
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <StatusIcon status={event.status} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {event.uploadTypeName}
                                  </p>
                                  <span className={cn(
                                    'inline-block text-[10px] px-1.5 py-0.5 rounded mt-1',
                                    cadenceConfig.bgClass,
                                    cadenceConfig.textClass
                                  )}>
                                    {cadenceConfig.label}
                                  </span>
                                </div>
                              </div>
                              <StatusBadge status={event.status} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
