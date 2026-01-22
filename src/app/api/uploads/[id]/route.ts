import { NextResponse } from 'next/server';
import { downloadFile, getSignedUrl } from '@/lib/supabase/storage';
import { createClient } from '@supabase/supabase-js';

// Create server-side client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UploadRecord {
  id: string;
  file_path: string | null;
  file_name: string;
  file_content_type: string | null;
  upload_type: string;
  uploader_name: string;
  uploaded_at: string;
}

/**
 * GET /api/uploads/[id]
 *
 * Fetch upload metadata or download/preview the file
 * Query params:
 * - action=download: Download the raw file
 * - action=preview: Get a signed URL for preview
 * - (default): Return metadata
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Fetch upload record from database
    const { data: upload, error } = await supabase
      .from('upload_history')
      .select('*')
      .eq('id', id)
      .single() as { data: UploadRecord | null; error: unknown };

    if (error || !upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Handle download action
    if (action === 'download') {
      if (!upload.file_path) {
        return NextResponse.json(
          { error: 'File not available for download' },
          { status: 404 }
        );
      }

      const result = await downloadFile(upload.file_path);

      if ('error' in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      // Return the file as a download
      const arrayBuffer = await result.data.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': upload.file_content_type || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${upload.file_name}"`,
        },
      });
    }

    // Handle preview action (signed URL)
    if (action === 'preview') {
      if (!upload.file_path) {
        return NextResponse.json(
          { error: 'File not available for preview' },
          { status: 404 }
        );
      }

      const result = await getSignedUrl(upload.file_path, 3600); // 1 hour

      if ('error' in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: result.url,
        expiresIn: 3600,
      });
    }

    // Default: return metadata
    return NextResponse.json({
      id: upload.id,
      uploadType: upload.upload_type,
      fileName: upload.file_name,
      filePath: upload.file_path,
      uploaderName: upload.uploader_name,
      uploadedAt: upload.uploaded_at,
      hasFile: Boolean(upload.file_path),
    });
  } catch (error) {
    console.error('Upload fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload' },
      { status: 500 }
    );
  }
}
