import { NextResponse } from 'next/server';
import type { UploadResponse, ValidationError } from '@/types';
import { uploadFile, isStorageConfigured } from '@/lib/supabase/storage';
import { createClient } from '@supabase/supabase-js';
import { calculateMetricsFromUpload } from '@/lib/metrics/calculateMetrics';
import { getUploadTypeById } from '@/config/uploadTypes';
import * as XLSX from 'xlsx';

// Create server-side client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// In-memory store for upload history (fallback when Supabase not configured)
const uploadHistory: Map<string, {
  id: string;
  uploadType: string;
  fileName: string;
  fileSize: number;
  filePath?: string;
  uploaderEmail: string;
  uploaderName: string;
  executiveId?: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  recordsProcessed: number;
  status: string;
  uploadedAt: string;
}> = new Map();

/**
 * POST /api/data/upload
 *
 * Handles Excel file uploads for KPI data ingestion.
 * Supports two actions:
 * - action=preview: Parse, map, validate, return preview data
 * - action=commit: Validate again, save to DB and storage, return success
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string || 'commit';
    const file = formData.get('file') as File | null;
    const sourceType = formData.get('sourceType') as string | null;
    const uploaderEmail = formData.get('uploaderEmail') as string || 'demo@thirdhorizon.com';
    const uploaderName = formData.get('uploaderName') as string || 'Demo User';
    const executiveId = formData.get('executiveId') as string | undefined;

    // Validation
    const errors: ValidationError[] = [];

    if (!file) {
      errors.push({
        message: 'No file provided',
        severity: 'error',
      });
    }

    if (!sourceType) {
      errors.push({
        message: 'Source type is required',
        severity: 'error',
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          ingestionId: '',
          recordsProcessed: 0,
          errors,
        } as UploadResponse,
        { status: 400 }
      );
    }

    // Handle preview action - parse the actual file
    if (action === 'preview') {
      try {
        const fileBuffer = await file!.arrayBuffer();
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

        // Create column mappings (direct mapping - column name is the mapping)
        const mappings = headers.map((header) => ({
          sourceColumn: header,
          targetColumn: header.toLowerCase().replace(/\s+/g, '_'),
          confidence: 1.0,
          isManual: false,
        }));

        // Get sample rows (first 5)
        const sampleRows = jsonData.slice(0, 5).map((row, i) => ({
          rowNumber: i + 2, // +2 because row 1 is headers, data starts at row 2
          data: row,
        }));

        const preview = {
          success: true,
          headers,
          mappings,
          sampleRows,
          totalRows: jsonData.length,
          validation: {
            isValid: true,
            errors: [],
            warnings: [],
            validRowCount: jsonData.length,
            invalidRowCount: 0,
          },
          overallConfidence: 1.0,
        };

        return NextResponse.json(preview);
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to parse file',
          message: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        }, { status: 400 });
      }
    }

    // Handle commit action
    const ingestionId = crypto.randomUUID();
    const now = new Date();

    // Calculate period based on source type
    const periodType = sourceType?.includes('harvest') ? 'week' : 'month';
    const periodEnd = now.toISOString().split('T')[0];
    const periodStart = periodType === 'week'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    let filePath: string | undefined;

    // Try to upload to Supabase Storage if configured
    if (isStorageConfigured()) {
      const uploadResult = await uploadFile(file!, {
        uploadType: sourceType!,
        executiveId,
        uploaderEmail,
      });

      if ('path' in uploadResult) {
        filePath = uploadResult.path;
      } else {
        console.warn('Storage upload failed, continuing without file storage:', uploadResult.error);
      }
    }

    // Save to in-memory history (and optionally to Supabase DB)
    const uploadRecord = {
      id: ingestionId,
      uploadType: sourceType!,
      fileName: file!.name,
      fileSize: file!.size,
      filePath,
      uploaderEmail,
      uploaderName,
      executiveId,
      periodType,
      periodStart,
      periodEnd,
      recordsProcessed: 24, // Mock value
      status: 'completed',
      uploadedAt: now.toISOString(),
    };

    uploadHistory.set(ingestionId, uploadRecord);

    // Also try to save to Supabase DB
    try {
      const { error: dbError } = await supabase.from('upload_history').insert({
        id: ingestionId,
        upload_type: sourceType!,
        file_name: file!.name,
        file_size: file!.size,
        file_path: filePath,
        file_content_type: file!.type,
        uploader_email: uploaderEmail,
        uploader_name: uploaderName,
        executive_id: executiveId,
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        records_processed: 24,
        status: 'completed',
        uploaded_at: now.toISOString(),
      });

      if (dbError) {
        console.error('Database insert error:', dbError);
      } else {
        console.log('Upload saved to database:', ingestionId);
      }
    } catch (dbError) {
      console.error('Failed to save to database:', dbError);
    }

    // Calculate metrics from the uploaded file
    let metricsCalculated = 0;
    try {
      const fileBuffer = await file!.arrayBuffer();
      const metricResult = await calculateMetricsFromUpload(sourceType!, fileBuffer, ingestionId);

      if (metricResult.success && metricResult.metrics.length > 0) {
        // Determine executive ID for metrics
        const uploadType = getUploadTypeById(sourceType!);
        const metricExecutiveId = executiveId || uploadType?.allowedExecutives[0];

        // Save metrics to database
        const metricsToInsert = metricResult.metrics.map((metric) => ({
          metric_id: metric.metricId,
          executive_id: metricExecutiveId,
          value: metric.value,
          source_upload_id: ingestionId,
          calculated_at: now.toISOString(),
          period_start: periodStart,
          period_end: periodEnd,
          details: metric.details || null,
        }));

        const { error: metricsError } = await supabase
          .from('calculated_metrics')
          .insert(metricsToInsert);

        if (metricsError) {
          console.error('Metrics insert error:', metricsError);
        } else {
          metricsCalculated = metricResult.metrics.length;
          console.log(`Calculated ${metricsCalculated} metrics from upload:`, metricResult.metrics.map(m => `${m.metricId}=${m.value}`).join(', '));
        }
      }
    } catch (metricsError) {
      console.error('Failed to calculate metrics:', metricsError);
    }

    const response: UploadResponse = {
      success: true,
      ingestionId,
      recordsProcessed: 24, // Mock value
      metricsCalculated,
      errors: [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        ingestionId: '',
        recordsProcessed: 0,
        errors: [
          {
            message: 'Internal server error during upload',
            severity: 'error',
          },
        ],
      } as UploadResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/data/upload
 *
 * Returns recent upload history for the current user
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const executiveId = searchParams.get('executiveId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeAll = searchParams.get('all') === 'true'; // For admin view

    // Try to fetch from Supabase DB first
    try {
      let query = supabase
        .from('upload_history')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (!includeAll) {
        if (email) {
          query = query.eq('uploader_email', email);
        }
        if (executiveId) {
          query = query.eq('executive_id', executiveId);
        }
      }

      const { data, error } = await query;

      if (!error && data) {
        // Transform snake_case to camelCase
        const uploads = data.map((row) => ({
          id: row.id,
          uploadType: row.upload_type,
          fileName: row.file_name,
          fileSize: row.file_size,
          filePath: row.file_path,
          uploaderEmail: row.uploader_email,
          uploaderName: row.uploader_name,
          executiveId: row.executive_id,
          periodType: row.period_type,
          periodStart: row.period_start,
          periodEnd: row.period_end,
          recordsProcessed: row.records_processed,
          status: row.status,
          uploadedAt: row.uploaded_at,
        }));

        return NextResponse.json({
          uploads,
          total: uploads.length,
          source: 'database',
        });
      }
    } catch (dbError) {
      console.warn('Database query failed, using in-memory store:', dbError);
    }

    // Fallback to in-memory store
    const history = Array.from(uploadHistory.values())
      .filter(u => {
        if (includeAll) return true;
        if (email && u.uploaderEmail !== email) return false;
        if (executiveId && u.executiveId !== executiveId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, limit);

    return NextResponse.json({
      uploads: history,
      total: history.length,
      source: 'memory',
    });
  } catch (error) {
    console.error('Error fetching upload history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload history' },
      { status: 500 }
    );
  }
}
