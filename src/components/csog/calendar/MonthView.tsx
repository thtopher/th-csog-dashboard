"use client";

import { CalendarEvent } from "@/lib/calendar/types";
import {
  format,
  isSameMonth,
  getSpanningEventsForWeek,
  getEventsForDay,
  hasProximityFlag,
} from "@/lib/calendar/calendar-utils";
import { getEventColor } from "@/lib/calendar/color-utils";
import { cn } from "@/lib/utils/cn";
import { EventPill } from "./EventPill";
import { AlertCircle, Flag } from "lucide-react";
import { isToday } from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_SPANNING_ROWS = 2;
const MAX_SINGLE = 2;

interface MonthViewProps {
  days: Date[];
  currentMonth: Date;
  events: CalendarEvent[];
  conflicts: Map<string, string[]>;
  onEventClick?: (event: CalendarEvent) => void;
}

function SpanningBar({
  event,
  startCol,
  span,
  row,
  onClick,
}: {
  event: CalendarEvent;
  startCol: number;
  span: number;
  row: number;
  onClick?: (event: CalendarEvent) => void;
}) {
  const colors = getEventColor(event.category, event.ptoStatus);
  const label = event.employee || event.title;
  const flagged = hasProximityFlag(event);

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        "absolute h-5 rounded-md px-1.5 text-[10px] font-medium truncate border transition-all hover:shadow-sm z-10 flex items-center gap-1",
        colors.bg,
        colors.border,
        colors.text,
        event.ptoStatus === "declined" && "opacity-50 line-through"
      )}
      style={{
        top: `${26 + row * 22}px`,
        left: `${(startCol / 7) * 100}%`,
        width: `${(span / 7) * 100}%`,
        paddingLeft: "6px",
      }}
    >
      <span className="truncate">{label}</span>
      {flagged && <Flag size={10} className="shrink-0 text-amber-500" />}
    </button>
  );
}

export function MonthView({
  days,
  currentMonth,
  events,
  conflicts,
  onEventClick,
}: MonthViewProps) {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="h-full">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white sticky top-0 z-10">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => {
        const { spanning, singleDay } = getSpanningEventsForWeek(week, events);
        const visibleSpanning = spanning.filter((s) => s.row < MAX_SPANNING_ROWS);
        const hiddenSpanningCount = spanning.length - visibleSpanning.length;
        const spanningHeight = Math.min(spanning.length, MAX_SPANNING_ROWS) * 22;

        return (
          <div key={wi} className="relative grid grid-cols-7 bg-white">
            {/* Spanning event bars */}
            {visibleSpanning.map((s) => (
              <SpanningBar
                key={s.event.id}
                event={s.event}
                startCol={s.startCol}
                span={s.span}
                row={s.row}
                onClick={onEventClick}
              />
            ))}

            {/* Day cells */}
            {week.map((day) => {
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const key = format(day, "yyyy-MM-dd");
              const dayConflicts = conflicts.get(key);
              const singles = singleDay.get(key) || [];
              const allDayEvents = getEventsForDay(day, events);
              const singleDayEvents = singles.length > 0
                ? singles
                : allDayEvents.filter((e) => e.startDate === e.endDate);
              const totalHidden =
                Math.max(0, singleDayEvents.length - MAX_SINGLE) + (hiddenSpanningCount > 0 ? hiddenSpanningCount : 0);

              return (
                <div
                  key={key}
                  className={cn(
                    "relative border-b border-r border-gray-100 transition-colors",
                    !inMonth && "bg-gray-50/50",
                    today && "bg-blue-50/40"
                  )}
                  style={{ minHeight: `${90 + spanningHeight}px` }}
                >
                  <div className="flex items-center justify-between p-1.5 pb-0">
                    <span
                      className={cn(
                        "text-xs font-medium tabular-nums",
                        !inMonth && "text-gray-300",
                        inMonth && "text-gray-500",
                        today &&
                          "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-semibold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayConflicts && dayConflicts.length > 0 && (
                      <div className="group relative">
                        <AlertCircle size={14} className="text-amber-500" />
                        <div className="absolute right-0 top-5 z-50 hidden group-hover:block bg-white border border-amber-200 rounded-lg shadow-lg p-2 w-48">
                          {dayConflicts.map((c, i) => (
                            <p key={i} className="text-[11px] text-amber-700 flex items-center gap-1">
                              <AlertCircle size={10} className="shrink-0" />
                              {c}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 px-1.5 pb-1.5" style={{ marginTop: `${spanningHeight}px` }}>
                    {singleDayEvents.slice(0, MAX_SINGLE).map((event) => (
                      <EventPill
                        key={event.id}
                        event={event}
                        compact
                        onClick={onEventClick}
                      />
                    ))}
                    {totalHidden > 0 && (
                      <span className="text-[10px] text-gray-400 pl-1 font-medium">
                        +{totalHidden} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
