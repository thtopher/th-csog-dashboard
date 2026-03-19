"use client";

import { CalendarEvent } from "@/lib/calendar/types";
import { getEventColor, getCategoryLabel, getStatusLabel } from "@/lib/calendar/color-utils";
import { format, parseISO, hasProximityFlag } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils/cn";
import { X, ExternalLink, Clock, MapPin, Calendar, User, Flag } from "lucide-react";
import { isSameDay } from "date-fns";

interface EventDetailProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EventDetail({ event, onClose }: EventDetailProps) {
  if (!event) return null;

  const colors = getEventColor(event.category, event.ptoStatus);
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const isMultiDay = !isSameDay(start, end);
  const flagged = hasProximityFlag(event);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-[20%] mx-auto max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200">
        <div className={cn("px-6 py-4 border-b border-gray-200", colors.bg)}>
          <div className="flex items-start justify-between">
            <div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-0.5 ring-1 ring-inset",
                  colors.badge
                )}
              >
                {getCategoryLabel(event.category)}
                {event.ptoStatus && ` · ${getStatusLabel(event.ptoStatus)}`}
              </span>
              <h2 className="text-lg font-semibold text-gray-900 mt-2">
                {event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/60 rounded-lg transition"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400 shrink-0" />
            <span>
              {format(start, "EEEE, MMMM d, yyyy")}
              {isMultiDay && ` — ${format(end, "EEEE, MMMM d, yyyy")}`}
            </span>
          </div>

          {event.isHalfDay && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock size={16} className="text-gray-400 shrink-0" />
              <span>Half day ({event.halfDayPeriod})</span>
            </div>
          )}

          {event.employee && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User size={16} className="text-gray-400 shrink-0" />
              <span>{event.employee}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <MapPin size={16} className="shrink-0" />
            <span>
              Source: {event.source === "bamboohr" ? "BambooHR" : "Manual entry"}
            </span>
          </div>
        </div>

        {flagged && (
          <div className="mx-6 my-3 flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2.5">
            <Flag size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              This PTO request spans three or more consecutive days within the next six weeks.
            </p>
          </div>
        )}

        {event.source === "bamboohr" && event.bamboohrUrl && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <a
              href={event.bamboohrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition"
            >
              <ExternalLink size={14} />
              Review in BambooHR
            </a>
          </div>
        )}
      </div>
    </>
  );
}
