"use client";

import { CalendarEvent } from "@/lib/calendar/types";
import { getEventColor } from "@/lib/calendar/color-utils";
import { hasProximityFlag } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils/cn";
import { Clock, AlertTriangle, Flag, Database, Users, Calendar } from "lucide-react";

function CategoryIcon({ category }: { category: CalendarEvent["category"] }) {
  const size = 10;
  switch (category) {
    case "pto":
      return <Clock size={size} />;
    case "holiday":
      return <Calendar size={size} />;
    case "milestone":
      return <Flag size={size} />;
    case "data-update":
      return <Database size={size} />;
    case "firm-event":
      return <Users size={size} />;
  }
}

interface EventPillProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: (event: CalendarEvent) => void;
}

export function EventPill({ event, compact = false, onClick }: EventPillProps) {
  const colors = getEventColor(event.category, event.ptoStatus);
  const flagged = hasProximityFlag(event);

  const label = compact
    ? event.employee
      ? event.employee.split(" ")[0]
      : event.title.split(" ").slice(0, 2).join(" ")
    : event.employee
      ? event.employee
      : event.title;

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        "group flex items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight transition-all",
        "border hover:shadow-sm w-full truncate",
        colors.bg,
        colors.border,
        colors.text,
        event.ptoStatus === "declined" && "opacity-50 line-through",
        event.isHalfDay && "border-dashed"
      )}
    >
      <CategoryIcon category={event.category} />
      <span className="truncate">{label}</span>
      {event.isHalfDay && (
        <span className="ml-auto text-[9px] opacity-60 shrink-0">½</span>
      )}
      {flagged && (
        <Flag size={9} className="ml-auto shrink-0 text-amber-500" />
      )}
      {event.ptoStatus === "pending" && !flagged && (
        <AlertTriangle size={9} className="ml-auto shrink-0 opacity-60" />
      )}
    </button>
  );
}
