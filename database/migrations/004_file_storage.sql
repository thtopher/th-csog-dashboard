-- Migration: 004_file_storage.sql
-- Purpose: Add file storage path to upload_history for Supabase Storage integration
-- Created: 2026-01-21

-- Add file_path column to store Supabase Storage path
ALTER TABLE upload_history
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);

-- Add index for looking up files by path
CREATE INDEX IF NOT EXISTS idx_upload_history_file_path
    ON upload_history(file_path) WHERE file_path IS NOT NULL;

COMMENT ON COLUMN upload_history.file_path IS 'Path to the file in Supabase Storage (uploads bucket)';

-- Also add file_content_type for proper MIME handling
ALTER TABLE upload_history
ADD COLUMN IF NOT EXISTS file_content_type VARCHAR(100);

COMMENT ON COLUMN upload_history.file_content_type IS 'MIME type of the uploaded file';
