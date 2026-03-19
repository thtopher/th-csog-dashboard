"use client";

import { CalendarEvent } from "@/lib/calendar/types";
import { getCapacity, format } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils/cn";
import { isToday } from "date-fns";

interface CapacityBarProps {
  days: Date[];
  events: CalendarEvent[];
  totalEmployees: number;
}

export function CapacityBar({ days, events, totalEmployees }: CapacityBarProps) {
  return (
    <div className="flex items-center bg-white border-b border-gray-200 px-4 py-1">
      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider w-16 shrink-0">
        Capacity
      </span>
      <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((day) => {
          const { out, total } = getCapacity(day, events, totalEmployees);
          const available = total - out;
          const pct = total > 0 ? available / total : 1;
          const today = isToday(day);
          const isLow = pct < 0.7;
          const isCritical = pct < 0.5;

          return (
            <div key={format(day, "yyyy-MM-dd")} className="group relative flex items-center gap-1">
              <div className={cn("flex-1 h-1.5 rounded-full overflow-hidden", "bg-gray-100")}>
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isCritical
                      ? "bg-red-400"
                      : isLow
                        ? "bg-amber-400"
                        : "bg-emerald-400",
                    today && "ring-1 ring-blue-400"
                  )}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[9px] font-medium rounded px-1.5 py-0.5 whitespace-nowrap z-20">
                {available}/{total} available
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
