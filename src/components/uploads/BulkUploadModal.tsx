'use client';

import { useState, useCallback } from 'react';
import { UPLOAD_TYPES, type UploadType } from '@/config/uploadTypes';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTypes: UploadType[];
  uploaderEmail: string;
  uploaderName: string;
  executiveId?: string;
  onUploadComplete?: () => void;
}

interface FileEntry {
  id: string;
  file: File;
  detectedType: string | null;
  selectedType: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  recordsProcessed?: number;
}

/**
 * Auto-detect upload type from filename
 */
function detectTypeFromFilename(filename: string, availableTypes: UploadType[]): string | null {
  const lower = filename.toLowerCase();

  // Map of filename patterns to upload type IDs
  const patterns: Record<string, string[]> = {
    'excel_harvest': ['harvest', 'time_tracking', 'timesheet'],
    'excel_training': ['training', 'certification', 'compliance_training'],
    'excel_staffing': ['staffing', 'utilization', 'headcount'],
    'excel_ar': ['ar_aging', 'ar_', 'accounts_receivable', 'receivable'],
    'excel_ap': ['ap_aging', 'ap_', 'accounts_payable', 'payable'],
    'excel_month_close': ['month_close', 'close_', 'financial_close'],
    'excel_cash': ['cash_position', 'cash_', 'bank_balance'],
    'excel_pipeline': ['pipeline', 'bd_', 'opportunities', 'sales_pipeline'],
    'excel_delivery': ['delivery', 'milestone', 'project_status'],
    'excel_client_satisfaction': ['satisfaction', 'csat', 'nps', 'client_feedback'],
    'excel_starset': ['starset', 'analytics_platform'],
    'excel_hmrf': ['hmrf', 'mrf_', 'hospital_mrf'],
    'excel_strategic': ['strategic', 'initiative', 'okr'],
  };

  for (const [typeId, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Check if this type is available to the user
        if (availableTypes.some(t => t.id === typeId)) {
          return typeId;
        }
      }
    }
  }

  return null;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  availableTypes,
  uploaderEmail,
  uploaderName,
  executiveId,
  onUploadComplete,
}: BulkUploadModalProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const newEntries: FileEntry[] = fileArray
      .filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))
      .map(file => {
        const detectedType = detectTypeFromFilename(file.name, availableTypes);
        return {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          detectedType,
          selectedType: detectedType || '',
          status: 'pending' as const,
        };
      });

    setFiles(prev => [...prev, ...newEntries]);
  }, [availableTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateFileType = useCallback((id: string, typeId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, selectedType: typeId } : f
    ));
  }, []);

  const uploadAll = async () => {
    const filesToUpload = files.filter(f => f.selectedType && f.status === 'pending');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    for (const entry of filesToUpload) {
      // Mark as uploading
      setFiles(prev => prev.map(f =>
        f.id === entry.id ? { ...f, status: 'uploading' } : f
      ));

      try {
        const formData = new FormData();
        formData.append('file', entry.file);
        formData.append('sourceType', entry.selectedType);
        formData.append('uploaderEmail', uploaderEmail);
        formData.append('uploaderName', uploaderName);
        if (executiveId) {
          formData.append('executiveId', executiveId);
        }

        const response = await fetch('/api/data/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setFiles(prev => prev.map(f =>
            f.id === entry.id ? {
              ...f,
              status: 'error',
              error: result.errors?.[0]?.message || 'Upload failed'
            } : f
          ));
        } else {
          setFiles(prev => prev.map(f =>
            f.id === entry.id ? {
              ...f,
              status: 'success',
              recordsProcessed: result.recordsProcessed,
            } : f
          ));
        }
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === entry.id ? {
            ...f,
            status: 'error',
            error: 'Network error'
          } : f
        ));
      }
    }

    setIsUploading(false);
    onUploadComplete?.();
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  const readyCount = files.filter(f => f.selectedType && f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Upload</h2>
            <p className="text-sm text-gray-500">Upload multiple files at once</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors mb-6',
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <Upload size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop Excel files here, or
            </p>
            <label className="inline-flex cursor-pointer">
              <span className="text-blue-600 hover:text-blue-800 font-medium">
                browse to select
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
            <p className="text-xs text-gray-400 mt-3">
              Accepts .xlsx files only. File types will be auto-detected when possible.
            </p>
          </div>

          {/* Files table */}
          {files.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">File</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 w-64">Upload Type</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-700 w-28">Status</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {files.map((entry) => (
                    <tr key={entry.id} className={cn(
                      entry.status === 'success' && 'bg-green-50',
                      entry.status === 'error' && 'bg-red-50',
                    )}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet size={20} className="text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(entry.file.size / 1024).toFixed(1)} KB
                              {entry.detectedType && (
                                <span className="text-green-600 ml-2">
                                  (auto-detected)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={entry.selectedType}
                          onChange={(e) => updateFileType(entry.id, e.target.value)}
                          disabled={entry.status !== 'pending'}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm text-gray-900',
                            !entry.selectedType && 'border-amber-300 bg-amber-50',
                            entry.status !== 'pending' && 'opacity-60 cursor-not-allowed'
                          )}
                        >
                          <option value="">Select type...</option>
                          {availableTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.status === 'pending' && (
                          entry.selectedType ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle size={16} />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                              <AlertCircle size={16} />
                              Select type
                            </span>
                          )
                        )}
                        {entry.status === 'uploading' && (
                          <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                            <Loader2 size={16} className="animate-spin" />
                            Uploading
                          </span>
                        )}
                        {entry.status === 'success' && (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle size={16} />
                            {entry.recordsProcessed} rows
                          </span>
                        )}
                        {entry.status === 'error' && (
                          <span className="inline-flex items-center gap-1 text-sm text-red-600" title={entry.error}>
                            <AlertCircle size={16} />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {entry.status === 'pending' && (
                          <button
                            onClick={() => removeFile(entry.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={16} className="text-gray-400" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {files.length > 0 && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                {files.length} file{files.length !== 1 && 's'}
              </span>
              {successCount > 0 && (
                <span className="text-green-600">
                  {successCount} uploaded
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">
                  {errorCount} failed
                </span>
              )}
              {successCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear completed
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {successCount > 0 && readyCount === 0 ? 'Done' : 'Cancel'}
          </button>
          <button
            onClick={uploadAll}
            disabled={readyCount === 0 || isUploading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              readyCount > 0 && !isUploading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </span>
            ) : (
              `Upload All (${readyCount})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
