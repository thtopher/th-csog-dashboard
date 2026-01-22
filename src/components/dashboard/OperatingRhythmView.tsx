'use client';

import { useState, useEffect } from 'react';
import { MonthlyTimeline } from '@/components/timeline';
import { useTemporal } from '@/contexts/TemporalContext';
import { Activity, Calendar } from 'lucide-react';
import type { UploadComplianceResponse } from '@/types';

interface OperatingRhythmViewProps {
  executiveId?: string;
}

export function OperatingRhythmView({
  executiveId,
}: OperatingRhythmViewProps) {
  const { today } = useTemporal();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<UploadComplianceResponse | null>(null);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  useEffect(() => {
    fetchComplianceData();
  }, [executiveId]);

  useEffect(() => {
    fetchCalendarData(calendarYear, calendarMonth);
  }, [calendarYear, calendarMonth]);

  async function fetchComplianceData() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (executiveId) {
        params.set('executiveId', executiveId);
      }

      const res = await fetch(`/api/uploads/compliance?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch compliance data');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCalendarData(year: number, month: number) {
    try {
      const params = new URLSearchParams();
      params.set('year', year.toString());
      params.set('month', month.toString());
      if (executiveId) {
        params.set('executiveId', executiveId);
      }

      const res = await fetch(`/api/uploads/compliance?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch calendar data');
      const json = await res.json();
      setData((prev) => prev ? { ...prev, calendarEvents: json.calendarEvents } : json);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  }

  const handleMonthChange = (year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Operating Rhythm</h2>
      </div>

      {/* Summary Stats */}
      {data?.summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Total Required</p>
            <p className="text-2xl font-bold text-gray-900">{data.summary.totalRequired}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{data.summary.totalCompleted}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{data.summary.overdueCount}</p>
          </div>
        </div>
      )}

      {/* Timeline View */}
      <MonthlyTimeline
        year={calendarYear}
        month={calendarMonth}
        events={data?.calendarEvents || []}
        onMonthChange={handleMonthChange}
        isLoading={isLoading}
      />
    </div>
  );
}
