"use client";

import { CalendarEvent } from "@/lib/calendar/types";
import { format, getEventsForDay } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils/cn";
import { EventPill } from "./EventPill";
import { isToday } from "date-fns";

interface WeekViewProps {
  days: Date[];
  events: CalendarEvent[];
  conflicts: Map<string, string[]>;
  onEventClick?: (event: CalendarEvent) => void;
}

export function WeekView({ days, events, conflicts, onEventClick }: WeekViewProps) {
  return (
    <div className="grid grid-cols-7 divide-x divide-gray-100">
      {days.map((day) => {
        const dayEvents = getEventsForDay(day, events);
        const key = format(day, "yyyy-MM-dd");
        const dayConflicts = conflicts.get(key);
        const today = isToday(day);

        return (
          <div key={key} className={cn("min-h-[400px] p-3", today && "bg-blue-50/30")}>
            <div className="text-center mb-3">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                {format(day, "EEE")}
              </p>
              <p
                className={cn(
                  "text-2xl font-semibold mt-0.5 tabular-nums",
                  today ? "text-blue-600" : "text-gray-800"
                )}
              >
                {format(day, "d")}
              </p>
              {dayConflicts && dayConflicts.length > 0 && (
                <div className="mt-1">
                  {dayConflicts.map((c, i) => (
                    <p
                      key={i}
                      className="text-[10px] text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5"
                    >
                      {c}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {dayEvents.map((event) => (
                <EventPill
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
