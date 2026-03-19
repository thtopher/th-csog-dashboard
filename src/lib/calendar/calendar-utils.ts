import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
  isWithinInterval,
  parseISO,
  format,
  isSameMonth,
  differenceInCalendarDays,
  getDay,
  addDays,
} from "date-fns";
import { CalendarEvent, FilterState, ViewMode } from "./types";

export function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function navigateDate(
  date: Date,
  direction: "prev" | "next",
  view: ViewMode
): Date {
  if (view === "month") {
    return direction === "next" ? addMonths(date, 1) : subMonths(date, 1);
  }
  return direction === "next" ? addWeeks(date, 1) : subWeeks(date, 1);
}

export function getEventsForDay(
  day: Date,
  events: CalendarEvent[]
): CalendarEvent[] {
  return events.filter((event) => {
    const start = parseISO(event.startDate);
    const end = parseISO(event.endDate);
    return (
      isSameDay(day, start) ||
      isSameDay(day, end) ||
      isWithinInterval(day, { start, end })
    );
  });
}

export function filterEvents(
  events: CalendarEvent[],
  filters: FilterState
): CalendarEvent[] {
  return events.filter((event) => {
    if (filters.categories.length > 0 && !filters.categories.includes(event.category)) {
      return false;
    }
    if (filters.employees.length > 0 && event.employee && !filters.employees.includes(event.employee)) {
      return false;
    }
    return true;
  });
}

export function getConflicts(
  events: CalendarEvent[],
  days: Date[]
): Map<string, string[]> {
  const conflicts = new Map<string, string[]>();

  for (const day of days) {
    const dayEvents = getEventsForDay(day, events);
    const ptoEvents = dayEvents.filter(
      (e) => e.category === "pto" && e.ptoStatus !== "declined"
    );
    const milestones = dayEvents.filter((e) => e.category === "milestone");
    const firmEvents = dayEvents.filter((e) => e.category === "firm-event");

    const alerts: string[] = [];
    const key = format(day, "yyyy-MM-dd");

    if (ptoEvents.length >= 3) {
      alerts.push(`${ptoEvents.length} people out`);
    }

    if (ptoEvents.length > 0 && milestones.length > 0) {
      alerts.push("PTO overlaps milestone");
    }

    if (ptoEvents.length > 0 && firmEvents.length > 0) {
      alerts.push("PTO overlaps firm event");
    }

    if (alerts.length > 0) {
      conflicts.set(key, alerts);
    }
  }

  return conflicts;
}

// Multi-day event spanning for month view
export interface SpanningEvent {
  event: CalendarEvent;
  startCol: number;
  span: number;
  row: number;
}

export function getSpanningEventsForWeek(
  weekDays: Date[],
  events: CalendarEvent[]
): { spanning: SpanningEvent[]; singleDay: Map<string, CalendarEvent[]> } {
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  const multiDay: CalendarEvent[] = [];
  const singleDay = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const eStart = parseISO(event.startDate);
    const eEnd = parseISO(event.endDate);
    const isMulti = !isSameDay(eStart, eEnd);

    const overlaps =
      isSameDay(eStart, weekStart) ||
      isSameDay(eEnd, weekEnd) ||
      (eStart <= weekEnd && eEnd >= weekStart);

    if (!overlaps) continue;

    if (isMulti) {
      multiDay.push(event);
    } else {
      const key = format(eStart, "yyyy-MM-dd");
      const existing = singleDay.get(key) || [];
      existing.push(event);
      singleDay.set(key, existing);
    }
  }

  const spanning: SpanningEvent[] = [];
  const rowEnds: number[] = [];

  multiDay.sort((a, b) => {
    const diff = a.startDate.localeCompare(b.startDate);
    if (diff !== 0) return diff;
    const aDur = differenceInCalendarDays(parseISO(a.endDate), parseISO(a.startDate));
    const bDur = differenceInCalendarDays(parseISO(b.endDate), parseISO(b.startDate));
    return bDur - aDur;
  });

  for (const event of multiDay) {
    const eStart = parseISO(event.startDate);
    const eEnd = parseISO(event.endDate);

    const clampedStart = eStart < weekStart ? weekStart : eStart;
    const clampedEnd = eEnd > weekEnd ? weekEnd : eEnd;

    const startCol = getDay(clampedStart);
    const endCol = getDay(clampedEnd);
    const span = endCol - startCol + 1;

    let row = 0;
    while (row < rowEnds.length && rowEnds[row] >= startCol) {
      row++;
    }
    if (row >= rowEnds.length) {
      rowEnds.push(endCol);
    } else {
      rowEnds[row] = endCol;
    }

    spanning.push({ event, startCol, span, row });
  }

  return { spanning, singleDay };
}

export function getCapacity(
  day: Date,
  events: CalendarEvent[],
  totalEmployees: number
): { out: number; total: number } {
  const dayEvents = getEventsForDay(day, events);
  const ptoOut = new Set(
    dayEvents
      .filter((e) => e.category === "pto" && e.ptoStatus !== "declined")
      .map((e) => e.employee)
      .filter(Boolean)
  );
  return { out: ptoOut.size, total: totalEmployees };
}

export function hasProximityFlag(event: CalendarEvent, today: Date = new Date()): boolean {
  if (event.category !== "pto" || event.source !== "bamboohr") return false;
  if (event.ptoStatus === "declined") return false;

  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const duration = differenceInCalendarDays(end, start) + 1;
  if (duration < 3) return false;

  const sixWeeksOut = addDays(today, 42);
  return start >= today && start <= sixWeeksOut;
}

export { format, isSameMonth, isSameDay, parseISO, differenceInCalendarDays };
