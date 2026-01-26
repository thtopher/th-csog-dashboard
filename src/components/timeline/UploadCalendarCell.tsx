'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/common/Avatar';
import { CADENCE_CONFIG } from '@/config/uploadSchedule';
import { Check, AlertTriangle, Clock } from 'lucide-react';
import type { CalendarEvent, UploadStatus, UploadCadence } from '@/types';

interface UploadCalendarCellProps {
  date: Date | null;
  events: CalendarEvent[];
  isToday?: boolean;
  isCurrentMonth?: boolean;
  onClick?: () => void;
}

function StatusIcon({ status, size = 10 }: { status: UploadStatus; size?: number }) {
  switch (status) {
    case 'completed':
      return <Check size={size} className="text-green-600" />;
    case 'overdue':
      return <AlertTriangle size={size} className="text-red-600" />;
    case 'pending':
      return <Clock size={size} className="text-amber-600" />;
    default:
      return null;
  }
}

function CadenceDot({ cadence }: { cadence: UploadCadence }) {
  const config = CADENCE_CONFIG[cadence];
  return (
    <span
      className={cn('inline-block w-1.5 h-1.5 rounded-full', config.dotClass)}
      title={config.label}
    />
  );
}

export function UploadCalendarCell({
  date,
  events,
  isToday = false,
  isCurrentMonth = true,
  onClick,
}: UploadCalendarCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!date) {
    return <div className="h-20 bg-gray-50 border-r border-b border-gray-100" />;
  }

  const dayNumber = date.getDate();

  // Group events by executive for display
  const executiveEvents = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.executiveId]) {
      acc[event.executiveId] = [];
    }
    acc[event.executiveId].push(event);
    return acc;
  }, {});

  const hasOverdue = events.some((e) => e.status === 'overdue');
  const hasPending = events.some((e) => e.status === 'pending');
  const hasEvents = events.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-20 p-1 border-r border-b border-gray-100 transition-colors text-left w-full',
        !isCurrentMonth && 'bg-gray-50 opacity-50',
        isToday && 'bg-blue-50 ring-1 ring-inset ring-blue-200',
        hasOverdue && 'bg-red-50',
        hasPending && !hasOverdue && 'bg-amber-50',
        hasEvents && 'hover:ring-2 hover:ring-inset hover:ring-gray-300 cursor-pointer',
        !hasEvents && 'cursor-default'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Day number */}
      <div
        className={cn(
          'text-xs font-medium mb-1',
          isToday ? 'text-blue-700' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
        )}
      >
        {dayNumber}
      </div>

      {/* Events */}
      {events.length > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {Object.entries(executiveEvents).slice(0, 3).map(([executiveId, exEvents]) => {
            const firstEvent = exEvents[0];
            const hasMultiple = exEvents.length > 1;

            return (
              <div
                key={executiveId}
                className="relative flex items-center"
                title={`${firstEvent.executiveName}: ${exEvents.map((e) => e.uploadTypeName).join(', ')}`}
              >
                <Avatar
                  executiveId={executiveId}
                  name={firstEvent.executiveName}
                  size="xs"
                />
                <div className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5">
                  <StatusIcon status={firstEvent.status} size={8} />
                </div>
                {hasMultiple && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gray-700 text-white text-[8px] flex items-center justify-center font-medium">
                    {exEvents.length}
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(executiveEvents).length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
              +{Object.keys(executiveEvents).length - 3}
            </div>
          )}
        </div>
      )}

      {/* Cadence dots at bottom */}
      {events.length > 0 && (
        <div className="absolute bottom-1 left-1 flex gap-0.5">
          {[...new Set(events.map((e) => e.cadence))].map((cadence) => (
            <CadenceDot key={cadence} cadence={cadence} />
          ))}
        </div>
      )}

      {/* Tooltip */}
      {isHovered && events.length > 0 && (
        <CalendarCellTooltip date={date} events={events} />
      )}
    </button>
  );
}

interface CalendarCellTooltipProps {
  date: Date;
  events: CalendarEvent[];
}

function CalendarCellTooltip({ date, events }: CalendarCellTooltipProps) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1 w-56 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="mb-2 pb-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-900">
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {events.map((event, idx) => {
          const cadenceConfig = CADENCE_CONFIG[event.cadence];
          return (
            <div key={`${event.executiveId}-${event.uploadTypeId}-${idx}`} className="flex items-start gap-2">
              <Avatar
                executiveId={event.executiveId}
                name={event.executiveName}
                size="xs"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {event.uploadTypeName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    'text-[10px] px-1 py-0.5 rounded',
                    cadenceConfig.bgClass,
                    cadenceConfig.textClass
                  )}>
                    {cadenceConfig.shortLabel}
                  </span>
                  <StatusIcon status={event.status} size={10} />
                  <span className={cn(
                    'text-[10px]',
                    event.status === 'completed' ? 'text-green-600' :
                    event.status === 'overdue' ? 'text-red-600' :
                    event.status === 'pending' ? 'text-amber-600' : 'text-gray-500'
                  )}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />
    </div>
  );
}
