'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfWeek,
  endOfWeek,
  differenceInDays,
  getQuarter,
  getYear,
  getDaysInMonth,
  getDate,
  addDays,
} from 'date-fns';

interface MonthInfo {
  start: Date;
  end: Date;
  name: string;
  dayNumber: number;
  totalDays: number;
}

interface QuarterInfo {
  start: Date;
  end: Date;
  number: number;
  fiscalYear: number;
}

interface WeekInfo {
  start: Date;
  end: Date;
  number: number;
}

interface DaysRemaining {
  inMonth: number;
  inQuarter: number;
  inWeek: number;
}

interface ReportingDeadline {
  type: 'week' | 'month' | 'quarter';
  name: string;
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
}

interface TemporalContextType {
  today: Date;
  currentMonth: MonthInfo;
  currentQuarter: QuarterInfo;
  currentWeek: WeekInfo;
  daysRemaining: DaysRemaining;
  reportingDeadlines: ReportingDeadline[];
  formattedDate: string;
  dayOfWeek: string;
}

const TemporalContext = createContext<TemporalContextType | undefined>(undefined);

// Calculate deadlines based on period ends
function calculateDeadlines(today: Date): ReportingDeadline[] {
  const deadlines: ReportingDeadline[] = [];

  // Monthly deadline: 5 days after month end
  const monthEnd = endOfMonth(today);
  const monthlyDueDate = addDays(monthEnd, 5);
  const monthlyDaysUntil = differenceInDays(monthlyDueDate, today);
  deadlines.push({
    type: 'month',
    name: `${format(today, 'MMMM')} Data`,
    dueDate: monthlyDueDate,
    daysUntilDue: monthlyDaysUntil,
    isOverdue: monthlyDaysUntil < 0,
  });

  // Quarterly deadline: 15 days after quarter end
  const quarterEnd = endOfQuarter(today);
  const quarterlyDueDate = addDays(quarterEnd, 15);
  const quarterlyDaysUntil = differenceInDays(quarterlyDueDate, today);
  const quarterNum = getQuarter(today);
  deadlines.push({
    type: 'quarter',
    name: `Q${quarterNum} Report`,
    dueDate: quarterlyDueDate,
    daysUntilDue: quarterlyDaysUntil,
    isOverdue: quarterlyDaysUntil < 0,
  });

  // Weekly deadline: Every Monday for previous week
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const weeklyDueDate = addDays(weekEnd, 2); // Due Wednesday
  const weeklyDaysUntil = differenceInDays(weeklyDueDate, today);
  deadlines.push({
    type: 'week',
    name: 'Weekly Update',
    dueDate: weeklyDueDate,
    daysUntilDue: weeklyDaysUntil,
    isOverdue: weeklyDaysUntil < 0,
  });

  // Sort by days until due
  return deadlines.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = differenceInDays(date, startOfYear);
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export function TemporalProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState(() => new Date());

  // Update at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setToday(new Date());
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [today]);

  const value = useMemo<TemporalContextType>(() => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const quarterStart = startOfQuarter(today);
    const quarterEnd = endOfQuarter(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const currentMonth: MonthInfo = {
      start: monthStart,
      end: monthEnd,
      name: format(today, 'MMMM yyyy'),
      dayNumber: getDate(today),
      totalDays: getDaysInMonth(today),
    };

    const currentQuarter: QuarterInfo = {
      start: quarterStart,
      end: quarterEnd,
      number: getQuarter(today),
      fiscalYear: getYear(today),
    };

    const currentWeek: WeekInfo = {
      start: weekStart,
      end: weekEnd,
      number: getWeekNumber(today),
    };

    const daysRemaining: DaysRemaining = {
      inMonth: differenceInDays(monthEnd, today),
      inQuarter: differenceInDays(quarterEnd, today),
      inWeek: differenceInDays(weekEnd, today),
    };

    return {
      today,
      currentMonth,
      currentQuarter,
      currentWeek,
      daysRemaining,
      reportingDeadlines: calculateDeadlines(today),
      formattedDate: format(today, 'EEEE, MMMM d, yyyy'),
      dayOfWeek: format(today, 'EEEE'),
    };
  }, [today]);

  return (
    <TemporalContext.Provider value={value}>
      {children}
    </TemporalContext.Provider>
  );
}

export function useTemporal() {
  const context = useContext(TemporalContext);
  if (context === undefined) {
    throw new Error('useTemporal must be used within a TemporalProvider');
  }
  return context;
}
