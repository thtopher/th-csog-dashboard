/**
 * Schedule Utility Functions
 * Date calculations for upload due dates and compliance tracking
 */

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
  isAfter,
  isBefore,
  isWithinInterval,
  eachDayOfInterval,
  getDate,
} from 'date-fns';
import { UPLOAD_SCHEDULE, getScheduleForExecutive } from '@/config/uploadSchedule';
import { DEFAULT_EXECUTIVES } from '@/config/executives';
import type {
  UploadScheduleItem,
  UploadStatusItem,
  ThermometerData,
  CalendarEvent,
  UploadStatus,
  UploadCadence,
  UploadComplianceResponse,
} from '@/types';

/**
 * Calculate the due date for an upload based on its cadence
 */
export function calculateDueDate(
  scheduleItem: UploadScheduleItem,
  referenceDate: Date
): Date {
  let periodEnd: Date;

  switch (scheduleItem.cadence) {
    case 'weekly':
      // Week ends on Sunday (weekStartsOn: 1 means Monday is start)
      periodEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
      break;
    case 'monthly':
      periodEnd = endOfMonth(referenceDate);
      break;
    case 'quarterly':
      periodEnd = endOfQuarter(referenceDate);
      break;
    default:
      periodEnd = endOfMonth(referenceDate);
  }

  return addDays(periodEnd, scheduleItem.daysAfterPeriodEnd);
}

/**
 * Get the start of the current period for a given cadence
 */
export function getPeriodStart(cadence: UploadCadence, referenceDate: Date): Date {
  switch (cadence) {
    case 'weekly':
      return startOfWeek(referenceDate, { weekStartsOn: 1 });
    case 'monthly':
      return startOfMonth(referenceDate);
    case 'quarterly':
      return startOfQuarter(referenceDate);
  }
}

/**
 * Get the end of the current period for a given cadence
 */
export function getPeriodEnd(cadence: UploadCadence, referenceDate: Date): Date {
  switch (cadence) {
    case 'weekly':
      return endOfWeek(referenceDate, { weekStartsOn: 1 });
    case 'monthly':
      return endOfMonth(referenceDate);
    case 'quarterly':
      return endOfQuarter(referenceDate);
  }
}

/**
 * Determine the status of an upload based on due date and completion
 */
export function getUploadStatus(
  dueDate: Date,
  today: Date,
  isCompleted: boolean
): UploadStatus {
  if (isCompleted) {
    return 'completed';
  }

  const daysUntilDue = differenceInDays(dueDate, today);

  if (daysUntilDue < 0) {
    return 'overdue';
  } else if (daysUntilDue <= 7) {
    return 'pending';
  } else {
    return 'upcoming';
  }
}

/**
 * Generate upload status items for a given period
 * In production, this would check against actual upload records
 */
export function generateUploadStatusItems(
  scheduleItems: UploadScheduleItem[],
  today: Date,
  completedUploads: Set<string> = new Set()
): UploadStatusItem[] {
  return scheduleItems.map((item) => {
    const dueDate = calculateDueDate(item, today);
    const isCompleted = completedUploads.has(`${item.executiveId}-${item.uploadTypeId}`);

    return {
      uploadTypeId: item.uploadTypeId,
      uploadTypeName: item.uploadTypeName,
      executiveId: item.executiveId,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      status: getUploadStatus(dueDate, today, isCompleted),
      completedAt: isCompleted ? format(today, 'yyyy-MM-dd') : undefined,
    };
  });
}

/**
 * Build thermometer data for all executives
 */
export function buildThermometerData(
  today: Date,
  completedUploads: Set<string> = new Set()
): ThermometerData[] {
  const executives = DEFAULT_EXECUTIVES;
  const thermometers: ThermometerData[] = [];

  for (const exec of executives) {
    if (!exec.id) continue;

    const scheduleItems = getScheduleForExecutive(exec.id);
    const uploadStatuses = generateUploadStatusItems(scheduleItems, today, completedUploads);

    // Count monthly uploads (focus on current period)
    const monthlyUploads = uploadStatuses.filter((u) => {
      const item = UPLOAD_SCHEDULE.find(
        (s) => s.uploadTypeId === u.uploadTypeId && s.executiveId === u.executiveId
      );
      return item?.cadence === 'monthly' || item?.cadence === 'weekly';
    });

    const totalRequired = monthlyUploads.length;
    const totalCompleted = monthlyUploads.filter((u) => u.status === 'completed').length;
    const percentComplete = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 100;

    thermometers.push({
      executiveId: exec.id,
      executiveName: exec.name || '',
      title: exec.title || '',
      photoUrl: undefined, // Will be populated by component
      totalRequired,
      totalCompleted,
      percentComplete,
      uploads: uploadStatuses,
    });
  }

  return thermometers.sort((a, b) => {
    // Sort by display order based on executive config
    const execA = executives.find((e) => e.id === a.executiveId);
    const execB = executives.find((e) => e.id === b.executiveId);
    return (execA?.displayOrder || 0) - (execB?.displayOrder || 0);
  });
}

/**
 * Generate calendar events for a given month
 * Shows uploads on their period end date (when data should be ready)
 * rather than the grace period due date
 */
export function generateCalendarEvents(
  year: number,
  month: number,
  completedUploads: Set<string> = new Set()
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const monthStart = new Date(year, month, 1);
  const monthEnd = endOfMonth(monthStart);
  const today = new Date();

  // Get all days in the month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  for (const scheduleItem of UPLOAD_SCHEDULE) {
    const exec = DEFAULT_EXECUTIVES.find((e) => e.id === scheduleItem.executiveId);
    if (!exec) continue;

    if (scheduleItem.cadence === 'weekly') {
      // For weekly uploads, show on each Wednesday (end of week + 3 days)
      for (const day of days) {
        const weekEnd = endOfWeek(day, { weekStartsOn: 1 });
        const displayDate = addDays(weekEnd, scheduleItem.daysAfterPeriodEnd);

        // Check if this is a unique date within the month
        if (
          isWithinInterval(displayDate, { start: monthStart, end: monthEnd }) &&
          !events.some(
            (e) =>
              e.date === format(displayDate, 'yyyy-MM-dd') &&
              e.uploadTypeId === scheduleItem.uploadTypeId &&
              e.executiveId === scheduleItem.executiveId
          )
        ) {
          const isCompleted = completedUploads.has(
            `${scheduleItem.executiveId}-${scheduleItem.uploadTypeId}-${format(displayDate, 'yyyy-MM-dd')}`
          );

          events.push({
            date: format(displayDate, 'yyyy-MM-dd'),
            executiveId: scheduleItem.executiveId,
            executiveName: exec.name || '',
            uploadTypeId: scheduleItem.uploadTypeId,
            uploadTypeName: scheduleItem.uploadTypeName,
            status: getUploadStatus(displayDate, today, isCompleted),
            cadence: scheduleItem.cadence,
          });
        }
      }
    } else if (scheduleItem.cadence === 'monthly') {
      // For monthly uploads, show on the last day of the month
      // This is when the data period ends and upload should be prepared
      const displayDate = monthEnd;
      const dueDate = addDays(displayDate, scheduleItem.daysAfterPeriodEnd);
      const isCompleted = completedUploads.has(
        `${scheduleItem.executiveId}-${scheduleItem.uploadTypeId}`
      );

      events.push({
        date: format(displayDate, 'yyyy-MM-dd'),
        executiveId: scheduleItem.executiveId,
        executiveName: exec.name || '',
        uploadTypeId: scheduleItem.uploadTypeId,
        uploadTypeName: scheduleItem.uploadTypeName,
        status: getUploadStatus(dueDate, today, isCompleted),
        cadence: scheduleItem.cadence,
      });
    } else if (scheduleItem.cadence === 'quarterly') {
      // For quarterly uploads, show on the last day of the quarter
      // Only if this month is the last month of a quarter (March, June, Sept, Dec)
      const quarterEndMonth = month - (month % 3) + 2; // 2, 5, 8, 11 (0-indexed)
      if (month === quarterEndMonth) {
        const displayDate = endOfQuarter(monthStart);
        const dueDate = addDays(displayDate, scheduleItem.daysAfterPeriodEnd);
        const isCompleted = completedUploads.has(
          `${scheduleItem.executiveId}-${scheduleItem.uploadTypeId}`
        );

        events.push({
          date: format(displayDate, 'yyyy-MM-dd'),
          executiveId: scheduleItem.executiveId,
          executiveName: exec.name || '',
          uploadTypeId: scheduleItem.uploadTypeId,
          uploadTypeName: scheduleItem.uploadTypeName,
          status: getUploadStatus(dueDate, today, isCompleted),
          cadence: scheduleItem.cadence,
        });
      }
    }
  }

  // Sort events by date
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Build the complete compliance response
 */
export function buildComplianceResponse(
  today: Date = new Date(),
  completedUploads: Set<string> = new Set()
): UploadComplianceResponse {
  const thermometers = buildThermometerData(today, completedUploads);
  const calendarEvents = generateCalendarEvents(
    today.getFullYear(),
    today.getMonth(),
    completedUploads
  );

  const summary = {
    totalRequired: thermometers.reduce((sum, t) => sum + t.totalRequired, 0),
    totalCompleted: thermometers.reduce((sum, t) => sum + t.totalCompleted, 0),
    overdueCount: calendarEvents.filter((e) => e.status === 'overdue').length,
  };

  return {
    thermometers,
    calendarEvents,
    summary,
  };
}

/**
 * Get days array for calendar grid (including padding for start of week)
 */
export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = endOfMonth(monthStart);

  // Get the day of week the month starts on (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();

  // Adjust for Monday start (0 = Monday)
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days: (Date | null)[] = [];

  // Add null padding for days before the month starts
  for (let i = 0; i < paddingDays; i++) {
    days.push(null);
  }

  // Add all days of the month
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  days.push(...monthDays);

  // Pad to complete the last week
  const remainingDays = (7 - (days.length % 7)) % 7;
  for (let i = 0; i < remainingDays; i++) {
    days.push(null);
  }

  return days;
}
