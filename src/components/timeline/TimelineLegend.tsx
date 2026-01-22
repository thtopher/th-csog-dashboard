'use client';

import { cn } from '@/lib/utils/cn';
import { CADENCE_CONFIG } from '@/config/uploadSchedule';
import { Check, Clock, AlertTriangle, CalendarClock } from 'lucide-react';

interface TimelineLegendProps {
  showCadence?: boolean;
  showStatus?: boolean;
  compact?: boolean;
}

export function TimelineLegend({
  showCadence = true,
  showStatus = true,
  compact = false,
}: TimelineLegendProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-xs text-gray-500', compact ? 'gap-3' : 'gap-6')}>
      {/* Cadence Legend */}
      {showCadence && (
        <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-4')}>
          <span className="font-medium text-gray-700">Cadence:</span>
          {Object.entries(CADENCE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={cn('w-2 h-2 rounded-full', config.dotClass)} />
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {showCadence && showStatus && (
        <div className="h-4 w-px bg-gray-200" />
      )}

      {/* Status Legend */}
      {showStatus && (
        <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-4')}>
          <span className="font-medium text-gray-700">Status:</span>
          <div className="flex items-center gap-1">
            <Check size={12} className="text-green-600" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-amber-600" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle size={12} className="text-red-600" />
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarClock size={12} className="text-gray-400" />
            <span>Upcoming</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function CadenceLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-4')}>
      {Object.entries(CADENCE_CONFIG).map(([key, config]) => (
        <div key={key} className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-medium',
              config.bgClass,
              config.textClass
            )}
          >
            {config.shortLabel}
          </span>
          <span className="text-gray-600">{config.label}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusLegend({ compact = false }: { compact?: boolean }) {
  const statuses = [
    { icon: Check, label: 'Complete', color: 'text-green-600' },
    { icon: Clock, label: 'Pending', color: 'text-amber-600' },
    { icon: AlertTriangle, label: 'Overdue', color: 'text-red-600' },
    { icon: CalendarClock, label: 'Upcoming', color: 'text-gray-400' },
  ];

  return (
    <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-4')}>
      {statuses.map(({ icon: Icon, label, color }) => (
        <div key={label} className="flex items-center gap-1 text-xs text-gray-600">
          <Icon size={12} className={color} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
