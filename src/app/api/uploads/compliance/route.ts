/**
 * Upload Compliance API Endpoint
 * GET /api/uploads/compliance
 *
 * Returns thermometer data and calendar events for upload compliance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildComplianceResponse, generateCalendarEvents, getPeriodStart, getPeriodEnd } from '@/lib/upload/scheduleUtils';
import { UPLOAD_SCHEDULE } from '@/config/uploadSchedule';
import { createClient } from '@supabase/supabase-js';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executiveId = searchParams.get('executiveId');
    const period = searchParams.get('period') || 'month'; // month | quarter
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const today = new Date();
    const year = yearParam ? parseInt(yearParam) : today.getFullYear();
    const month = monthParam ? parseInt(monthParam) : today.getMonth();

    // Fetch actual completed uploads from database for current periods
    const completedUploads = await fetchCompletedUploadsForCurrentPeriods(today);

    // Build the compliance response
    const response = buildComplianceResponse(today, completedUploads);

    // If filtering by executive, filter the response
    if (executiveId) {
      response.thermometers = response.thermometers.filter(
        (t) => t.executiveId === executiveId
      );
      response.calendarEvents = response.calendarEvents.filter(
        (e) => e.executiveId === executiveId
      );
    }

    // Optionally get calendar events for a different month
    if (yearParam || monthParam) {
      response.calendarEvents = generateCalendarEvents(year, month, completedUploads);
      if (executiveId) {
        response.calendarEvents = response.calendarEvents.filter(
          (e) => e.executiveId === executiveId
        );
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating compliance data:', error);
    return NextResponse.json(
      { error: 'Failed to generate compliance data' },
      { status: 500 }
    );
  }
}

/**
 * Fetch completed uploads from the database for current periods
 * Checks if there's a completed upload for each scheduled item's current period
 * Returns a Set of keys matching what scheduleUtils expects
 */
async function fetchCompletedUploadsForCurrentPeriods(today: Date): Promise<Set<string>> {
  try {
    // Fetch all completed uploads with their period data
    const { data, error } = await supabase
      .from('upload_history')
      .select('executive_id, upload_type, period_start, period_end, uploaded_at')
      .eq('status', 'completed');

    if (error || !data) {
      console.error('Error fetching uploads:', error);
      return new Set();
    }

    const completed = new Set<string>();

    // For each scheduled upload, check if there's a matching completed upload for the current period
    for (const scheduleItem of UPLOAD_SCHEDULE) {
      // Calculate the current period boundaries based on cadence
      let periodStart: Date;
      let periodEnd: Date;

      switch (scheduleItem.cadence) {
        case 'weekly':
          periodStart = startOfWeek(today, { weekStartsOn: 1 });
          periodEnd = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case 'monthly':
          periodStart = startOfMonth(today);
          periodEnd = endOfMonth(today);
          break;
        case 'quarterly':
          periodStart = startOfQuarter(today);
          periodEnd = endOfQuarter(today);
          break;
        default:
          periodStart = startOfMonth(today);
          periodEnd = endOfMonth(today);
      }

      // Find a completed upload matching this executive, type, and period
      const matchingUpload = data.find((upload) => {
        if (upload.executive_id !== scheduleItem.executiveId) return false;
        if (upload.upload_type !== scheduleItem.uploadTypeId) return false;

        // Check if the upload's period overlaps with or matches the current period
        if (upload.period_start && upload.period_end) {
          const uploadStart = new Date(upload.period_start);
          const uploadEnd = new Date(upload.period_end);
          // Upload period should overlap with current period
          return uploadStart <= periodEnd && uploadEnd >= periodStart;
        }

        // Fallback: check if uploaded within the current period
        if (upload.uploaded_at) {
          const uploadedAt = new Date(upload.uploaded_at);
          return uploadedAt >= periodStart && uploadedAt <= periodEnd;
        }

        return false;
      });

      if (matchingUpload) {
        // Add the key that scheduleUtils expects
        completed.add(`${scheduleItem.executiveId}-${scheduleItem.uploadTypeId}`);

        // For weekly uploads, also add date-specific keys for calendar events
        if (scheduleItem.cadence === 'weekly') {
          const dueDate = endOfWeek(today, { weekStartsOn: 1 });
          completed.add(`${scheduleItem.executiveId}-${scheduleItem.uploadTypeId}-${format(dueDate, 'yyyy-MM-dd')}`);
        }
      }
    }

    return completed;
  } catch (err) {
    console.error('Failed to fetch completed uploads:', err);
    return new Set();
  }
}
