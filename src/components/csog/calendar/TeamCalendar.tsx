"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import {
  getMonthDays,
  getWeekDays,
  navigateDate,
  filterEvents,
  getConflicts,
  format,
} from "@/lib/calendar/calendar-utils";
import { CalendarEvent, ViewMode } from "@/lib/calendar/types";
import { EMPLOYEES } from "@/lib/calendar/employees";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { SwimlaneView } from "./SwimlaneView";
import { CapacityBar } from "./CapacityBar";
import { FilterSidebar } from "./FilterSidebar";
import { EventDetail } from "./EventDetail";
import { Legend } from "./Legend";
import { cn } from "@/lib/utils/cn";
import { useUrlFilters } from "@/lib/calendar/use-url-filters";
import { useCalendarEvents } from "@/lib/calendar/use-events";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function TeamCalendarInner() {
  const { filters, setFilters, view, setView } = useUrlFilters();
  const { events, loading, error, refetch } = useCalendarEvents();
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Fetch last sync timestamp
  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/sync-status");
      if (!res.ok) return;
      const data = await res.json();
      setLastSynced(data.lastSync);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const isWeekBased = view === "week" || view === "swimlane";

  const days = useMemo(
    () => (view === "month" ? getMonthDays(currentDate) : getWeekDays(currentDate)),
    [currentDate, view]
  );

  const filteredEvents = useMemo(
    () => filterEvents(events, filters),
    [events, filters]
  );

  const conflicts = useMemo(
    () => getConflicts(filteredEvents, days),
    [filteredEvents, days]
  );

  const hasActiveFilters =
    filters.employees.length > 0 ||
    filters.categories.length > 0;

  const navigate = (dir: "prev" | "next") => {
    setCurrentDate(navigateDate(currentDate, dir, view));
  };

  const goToToday = () => setCurrentDate(new Date());

  const viewLabel = isWeekBased
    ? `${format(days[0], "MMM d")} — ${format(days[6], "MMM d, yyyy")}`
    : format(currentDate, "MMMM yyyy");

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={32} className="text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("prev")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() => navigate("next")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 tabular-nums">
              {viewLabel}
            </h2>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["month", "week", "swimlane"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition",
                    view === v
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {v === "swimlane" ? "Swimlane" : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition",
                hasActiveFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <span className="bg-white text-gray-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {filters.employees.length + filters.categories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3">
          <Legend />
        </div>
      </header>

      {/* Capacity Bar */}
      <CapacityBar
        days={isWeekBased ? days : getWeekDays(currentDate)}
        events={filteredEvents}
        totalEmployees={EMPLOYEES.length}
      />

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {view === "month" && (
              <MonthView
                days={days}
                currentMonth={currentDate}
                events={filteredEvents}
                conflicts={conflicts}
                onEventClick={handleEventClick}
              />
            )}
            {view === "week" && (
              <div className="bg-white min-h-full">
                <WeekView
                  days={days}
                  events={filteredEvents}
                  conflicts={conflicts}
                  onEventClick={handleEventClick}
                />
              </div>
            )}
            {view === "swimlane" && (
              <div className="bg-white min-h-full">
                <SwimlaneView
                  days={days}
                  events={filteredEvents}
                  conflicts={conflicts}
                  onEventClick={handleEventClick}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sync Status Bar */}
      <footer className="bg-white border-t border-gray-100 px-6 py-2 flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          {lastSynced
            ? `Last synced with BambooHR: ${formatRelativeTime(lastSynced)}`
            : "Not yet synced with BambooHR"}
        </p>
        <p className="text-[11px] text-gray-400">
          Auto-sync daily at ~8 AM ET
        </p>
      </footer>

      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export function TeamCalendar() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <TeamCalendarInner />
    </Suspense>
  );
}
