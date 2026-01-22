'use client';

import { useMemo } from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { UploadCalendarCell } from './UploadCalendarCell';
import { TimelineLegend } from './TimelineLegend';
import { getCalendarDays } from '@/lib/upload/scheduleUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '@/types';

interface MonthlyTimelineProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onMonthChange?: (year: number, month: number) => void;
  isLoading?: boolean;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthlyTimeline({
  year,
  month,
  events,
  onMonthChange,
  isLoading = false,
}: MonthlyTimelineProps) {
  const today = new Date();
  const currentMonth = new Date(year, month, 1);

  // Get calendar grid days
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    }
    return grouped;
  }, [events]);

  const handlePrevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    onMonthChange?.(newYear, newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    onMonthChange?.(newYear, newMonth);
  };

  if (isLoading) {
    return <MonthlyTimelineSkeleton />;
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <h3 className="text-sm font-semibold text-gray-900 min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            <span className="font-medium text-gray-900">{events.length}</span> uploads scheduled
          </span>
          <span>
            <span className="font-medium text-green-600">
              {events.filter((e) => e.status === 'completed').length}
            </span>{' '}
            completed
          </span>
          <span>
            <span className="font-medium text-red-600">
              {events.filter((e) => e.status === 'overdue').length}
            </span>{' '}
            overdue
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b">
          {WEEKDAY_LABELS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-xs font-medium text-gray-500 text-center bg-gray-50 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, idx) => {
            const dateKey = date ? format(date, 'yyyy-MM-dd') : null;
            const dayEvents = dateKey ? eventsByDate[dateKey] || [] : [];
            const isToday = date ? isSameDay(date, today) : false;
            const isCurrentMonth = date ? isSameMonth(date, currentMonth) : false;

            return (
              <UploadCalendarCell
                key={idx}
                date={date}
                events={dayEvents}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <TimelineLegend />
      </div>
    </div>
  );
}

function MonthlyTimelineSkeleton() {
  return (
    <div className="bg-white rounded-lg border overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="px-2 py-2 text-center bg-gray-50 border-r last:border-r-0">
            <div className="h-3 w-8 mx-auto bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7">
        {[...Array(35)].map((_, idx) => (
          <div key={idx} className="h-20 border-r border-b border-gray-100 p-1">
            <div className="h-3 w-4 bg-gray-200 rounded mb-2" />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="h-4 w-64 mx-auto bg-gray-200 rounded" />
      </div>
    </div>
  );
}
