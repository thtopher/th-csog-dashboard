import { NextResponse } from 'next/server';
import type { UploadResponse, ValidationError } from '@/types';

/**
 * POST /api/data/upload
 *
 * Handles Excel file uploads for KPI data ingestion.
 *
 * Request body: FormData with:
 * - file: The Excel file
 * - sourceType: 'excel_harvest' | 'excel_training' | 'excel_billable'
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sourceType = formData.get('sourceType') as string | null;

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

    // TODO: Implement actual file processing
    // 1. Save file to storage
    // 2. Validate schema against expected template
    // 3. Parse rows and transform to KPI values
    // 4. Insert into database
    // 5. Log ingestion result

    // For now, return a placeholder success response
    const response: UploadResponse = {
      success: true,
      ingestionId: crypto.randomUUID(),
      recordsProcessed: 0,
      errors: [
        {
          message: 'File upload endpoint is scaffolded but not yet implemented',
          severity: 'warning',
        },
      ],
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
