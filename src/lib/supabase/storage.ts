/**
 * Supabase Storage utilities for file uploads
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'uploads';

/**
 * Create a storage client with service role for server-side operations
 */
function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if storage is configured
 */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: {
    uploadType: string;
    executiveId?: string;
    uploaderEmail: string;
  }
): Promise<{ path: string; url: string } | { error: string }> {
  try {
    const supabase = getStorageClient();

    // Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${options.uploadType}/${timestamp}_${safeName}`;

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, {
        contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { error: uploadError.message };
    }

    // Get the public URL (or signed URL for private files)
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return {
      path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

/**
 * Get a signed URL for file download (private bucket)
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600 // 1 hour
): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = getStorageClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error('Signed URL error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to generate URL' };
  }
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
  path: string
): Promise<{ data: Blob; contentType: string } | { error: string }> {
  try {
    const supabase = getStorageClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);

    if (error) {
      return { error: error.message };
    }

    return {
      data,
      contentType: data.type,
    };
  } catch (error) {
    console.error('Download error:', error);
    return { error: error instanceof Error ? error.message : 'Download failed' };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getStorageClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

/**
 * List files in a folder
 */
export async function listFiles(
  folder: string
): Promise<{ files: Array<{ name: string; path: string; size: number; createdAt: string }> } | { error: string }> {
  try {
    const supabase = getStorageClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      return { error: error.message };
    }

    const files = data
      .filter((item) => item.name !== '.emptyFolderPlaceholder')
      .map((item) => ({
        name: item.name,
        path: `${folder}/${item.name}`,
        size: item.metadata?.size || 0,
        createdAt: item.created_at || new Date().toISOString(),
      }));

    return { files };
  } catch (error) {
    console.error('List error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to list files' };
  }
}
