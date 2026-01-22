import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface MetricValue {
  metricId: string;
  value: number | undefined;
  trend?: 'up' | 'down' | 'flat';
  previousValue?: number;
  calculatedAt?: string;
  sourceUploadId?: string;
}

/**
 * GET /api/metrics
 *
 * Fetches calculated metrics for an executive
 * Query params:
 * - executiveId: The executive to fetch metrics for
 * - metricIds: Optional comma-separated list of metric IDs to fetch
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const executiveId = searchParams.get('executiveId');
    const metricIds = searchParams.get('metricIds')?.split(',').filter(Boolean);

    if (!executiveId) {
      return NextResponse.json(
        { error: 'executiveId is required' },
        { status: 400 }
      );
    }

    // Build query for latest metrics per metric_id
    let query = supabase
      .from('calculated_metrics')
      .select('*')
      .eq('executive_id', executiveId)
      .order('calculated_at', { ascending: false });

    if (metricIds && metricIds.length > 0) {
      query = query.in('metric_id', metricIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    // Group by metric_id and get the latest value for each
    const latestByMetric = new Map<string, MetricValue>();
    const previousByMetric = new Map<string, number>();

    // First pass: identify latest and previous values
    for (const row of data || []) {
      const metricId = row.metric_id;

      if (!latestByMetric.has(metricId)) {
        latestByMetric.set(metricId, {
          metricId,
          value: Number(row.value),
          calculatedAt: row.calculated_at,
          sourceUploadId: row.source_upload_id,
        });
      } else if (!previousByMetric.has(metricId)) {
        previousByMetric.set(metricId, Number(row.value));
      }
    }

    // Second pass: calculate trends
    const metrics: Record<string, MetricValue> = {};

    for (const [metricId, metricValue] of latestByMetric) {
      const previousValue = previousByMetric.get(metricId);

      let trend: 'up' | 'down' | 'flat' | undefined;
      if (previousValue !== undefined && metricValue.value !== undefined) {
        if (metricValue.value > previousValue) {
          trend = 'up';
        } else if (metricValue.value < previousValue) {
          trend = 'down';
        } else {
          trend = 'flat';
        }
      }

      metrics[metricId] = {
        ...metricValue,
        previousValue,
        trend,
      };
    }

    return NextResponse.json({
      executiveId,
      metrics,
      source: 'database',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
