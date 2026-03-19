"use client";

import { CalendarEvent } from "@/lib/calendar/types";
import { format, getEventsForDay, parseISO, isSameDay } from "@/lib/calendar/calendar-utils";
import { getEventColor } from "@/lib/calendar/color-utils";
import { hasProximityFlag } from "@/lib/calendar/calendar-utils";
import { EMPLOYEES } from "@/lib/calendar/employees";
import { cn } from "@/lib/utils/cn";
import { isToday, getDay, differenceInCalendarDays } from "date-fns";
import { AlertTriangle, Flag } from "lucide-react";

interface SwimlaneViewProps {
  days: Date[];
  events: CalendarEvent[];
  conflicts: Map<string, string[]>;
  onEventClick?: (event: CalendarEvent) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

interface PersonEventBar {
  event: CalendarEvent;
  startCol: number;
  span: number;
}

function getPersonBars(
  employee: string,
  days: Date[],
  events: CalendarEvent[]
): PersonEventBar[] {
  const weekStart = days[0];
  const weekEnd = days[6];
  const bars: PersonEventBar[] = [];

  for (const event of events) {
    if (event.employee !== employee) continue;

    const eStart = parseISO(event.startDate);
    const eEnd = parseISO(event.endDate);

    const overlaps =
      isSameDay(eStart, weekStart) ||
      isSameDay(eEnd, weekEnd) ||
      (eStart <= weekEnd && eEnd >= weekStart);

    if (!overlaps) continue;

    const clampedStart = eStart < weekStart ? weekStart : eStart;
    const clampedEnd = eEnd > weekEnd ? weekEnd : eEnd;

    const startCol = getDay(clampedStart);
    const span = differenceInCalendarDays(clampedEnd, clampedStart) + 1;

    bars.push({ event, startCol, span });
  }

  return bars;
}

function getFirmBars(
  days: Date[],
  events: CalendarEvent[]
): PersonEventBar[] {
  const weekStart = days[0];
  const weekEnd = days[6];
  const bars: PersonEventBar[] = [];

  for (const event of events) {
    if (event.employee) continue;

    const eStart = parseISO(event.startDate);
    const eEnd = parseISO(event.endDate);

    const overlaps =
      isSameDay(eStart, weekStart) ||
      isSameDay(eEnd, weekEnd) ||
      (eStart <= weekEnd && eEnd >= weekStart);

    if (!overlaps) continue;

    const clampedStart = eStart < weekStart ? weekStart : eStart;
    const clampedEnd = eEnd > weekEnd ? weekEnd : eEnd;

    const startCol = getDay(clampedStart);
    const span = differenceInCalendarDays(clampedEnd, clampedStart) + 1;

    bars.push({ event, startCol, span });
  }

  return bars;
}

export function SwimlaneView({
  days,
  events,
  conflicts,
  onEventClick,
}: SwimlaneViewProps) {
  const firmBars = getFirmBars(days, events);

  const employeesWithEvents = EMPLOYEES.filter((name) =>
    events.some(
      (e) =>
        e.employee === name &&
        (() => {
          const eStart = parseISO(e.startDate);
          const eEnd = parseISO(e.endDate);
          return (
            isSameDay(eStart, days[0]) ||
            isSameDay(eEnd, days[6]) ||
            (eStart <= days[6] && eEnd >= days[0])
          );
        })()
    )
  );

  const employeesWithout = EMPLOYEES.filter(
    (n) => !employeesWithEvents.includes(n)
  );

  return (
    <div className="min-h-full">
      {/* Header row */}
      <div className="grid sticky top-0 z-10 bg-white border-b border-gray-200"
        style={{ gridTemplateColumns: "180px repeat(7, 1fr)" }}
      >
        <div className="p-2 border-r border-gray-200" />
        {days.map((day) => {
          const today = isToday(day);
          const key = format(day, "yyyy-MM-dd");
          const dayConflicts = conflicts.get(key);
          return (
            <div
              key={key}
              className={cn(
                "py-2 text-center border-r border-gray-100",
                today && "bg-blue-50/50"
              )}
            >
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                {format(day, "EEE")}
              </p>
              <p
                className={cn(
                  "text-lg font-semibold tabular-nums",
                  today ? "text-blue-600" : "text-gray-800"
                )}
              >
                {format(day, "d")}
              </p>
              {dayConflicts && (
                <p className="text-[9px] text-amber-500 font-medium mt-0.5">
                  {dayConflicts[0]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Firm-wide events banner */}
      {firmBars.length > 0 && (
        <div
          className="relative grid border-b border-gray-200 bg-gray-50/50"
          style={{ gridTemplateColumns: "180px repeat(7, 1fr)", minHeight: "36px" }}
        >
          <div className="flex items-center px-3 border-r border-gray-200">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Firm Events
            </span>
          </div>
          <div className="col-span-7 relative" style={{ minHeight: "32px" }}>
            {firmBars.map((bar) => {
              const colors = getEventColor(bar.event.category, bar.event.ptoStatus);
              return (
                <button
                  key={bar.event.id}
                  onClick={() => onEventClick?.(bar.event)}
                  className={cn(
                    "absolute top-1 h-6 rounded-md px-2 text-[10px] font-medium truncate border transition-all hover:shadow-sm",
                    colors.bg,
                    colors.border,
                    colors.text
                  )}
                  style={{
                    left: `${(bar.startCol / 7) * 100}%`,
                    width: `${(bar.span / 7) * 100}%`,
                  }}
                >
                  {bar.event.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee swimlanes - with events */}
      {employeesWithEvents.map((employee) => {
        const bars = getPersonBars(employee, days, events);
        return (
          <div
            key={employee}
            className="grid border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            style={{ gridTemplateColumns: "180px repeat(7, 1fr)", minHeight: "44px" }}
          >
            <div className="flex items-center gap-2 px-3 border-r border-gray-200">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-gray-500">
                  {getInitials(employee)}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-700 truncate">
                {employee}
              </span>
            </div>
            <div className="col-span-7 relative">
              <div className="absolute inset-0 grid grid-cols-7">
                {days.map((day) => (
                  <div
                    key={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "border-r border-gray-50",
                      isToday(day) && "bg-blue-50/30"
                    )}
                  />
                ))}
              </div>
              {bars.map((bar) => {
                const colors = getEventColor(bar.event.category, bar.event.ptoStatus);
                return (
                  <button
                    key={bar.event.id}
                    onClick={() => onEventClick?.(bar.event)}
                    className={cn(
                      "absolute top-2 h-7 rounded-md px-2 text-[10px] font-medium truncate border transition-all hover:shadow-sm flex items-center gap-1",
                      colors.bg,
                      colors.border,
                      colors.text,
                      bar.event.ptoStatus === "declined" && "opacity-50 line-through",
                      bar.event.isHalfDay && "border-dashed"
                    )}
                    style={{
                      left: `${(bar.startCol / 7) * 100}%`,
                      width: `${(bar.span / 7) * 100 - 0.5}%`,
                    }}
                  >
                    {bar.event.title.split(" - ").pop()}
                    {bar.event.isHalfDay && <span className="text-[8px] opacity-60">½</span>}
                    {hasProximityFlag(bar.event) && (
                      <Flag size={9} className="shrink-0 text-amber-500" />
                    )}
                    {bar.event.ptoStatus === "pending" && !hasProximityFlag(bar.event) && (
                      <AlertTriangle size={9} className="shrink-0 opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Employee swimlanes - no events (dimmed) */}
      {employeesWithout.map((employee) => (
        <div
          key={employee}
          className="grid border-b border-gray-50"
          style={{ gridTemplateColumns: "180px repeat(7, 1fr)", minHeight: "36px" }}
        >
          <div className="flex items-center gap-2 px-3 border-r border-gray-200 opacity-40">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-gray-500">
                {getInitials(employee)}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-500 truncate">
              {employee}
            </span>
          </div>
          <div className="col-span-7 relative">
            <div className="absolute inset-0 grid grid-cols-7">
              {days.map((day) => (
                <div
                  key={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "border-r border-gray-50",
                    isToday(day) && "bg-blue-50/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
