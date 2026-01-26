'use client';

/**
 * MPA Upload Wizard Component
 *
 * 5-step file upload flow for Monthly Performance Analysis:
 * 1. Pro Forma Workbook
 * 2. Compensation File
 * 3. Harvest Hours
 * 4. Harvest Expenses
 * 5. P&L Statement
 */

import { useState, useCallback } from 'react';
import {
  Upload,
  Check,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  ChevronRight,
  Play,
} from 'lucide-react';
import type { MPAFileType } from '@/lib/supabase/types';

interface FileState {
  file: File | null;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  path: string | null;
  error: string | null;
}

interface MPAUploadWizardProps {
  monthName: string;
  userEmail: string;
  onComplete: (batchId: string) => void;
  onCancel: () => void;
}

const FILE_STEPS: { type: MPAFileType; label: string; description: string }[] = [
  {
    type: 'proforma',
    label: 'Pro Forma Workbook',
    description: 'Excel file with PRO FORMA 2025 sheet containing revenue by project code',
  },
  {
    type: 'compensation',
    label: 'Compensation File',
    description: 'Staff compensation data with hourly rates or salary components',
  },
  {
    type: 'hours',
    label: 'Harvest Hours',
    description: 'Harvest time tracking export for the analysis month',
  },
  {
    type: 'expenses',
    label: 'Harvest Expenses',
    description: 'Harvest expenses export with Billable column for filtering',
  },
  {
    type: 'pnl',
    label: 'P&L Statement',
    description: 'QuickBooks P&L with IncomeStatement sheet for overhead pools',
  },
];

export function MPAUploadWizard({
  monthName,
  userEmail,
  onComplete,
  onCancel,
}: MPAUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [uploadPaths, setUploadPaths] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<MPAFileType, FileState>>({
    proforma: { file: null, status: 'pending', path: null, error: null },
    compensation: { file: null, status: 'pending', path: null, error: null },
    hours: { file: null, status: 'pending', path: null, error: null },
    expenses: { file: null, status: 'pending', path: null, error: null },
    pnl: { file: null, status: 'pending', path: null, error: null },
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  // Initialize batch on first step - returns the batch ID
  const initializeBatch = useCallback(async (): Promise<string | null> => {
    if (batchId) return batchId;

    try {
      const response = await fetch('/api/mpa/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthName, createdBy: userEmail }),
      });

      const data = await response.json();
      if (data.success) {
        setBatchId(data.batch.id);
        setUploadPaths(data.uploadPaths);
        return data.batch.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to initialize batch:', error);
      return null;
    }
  }, [batchId, monthName, userEmail]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (type: MPAFileType, file: File) => {
      // Get or create batch and get the ID directly
      const currentBatchId = await initializeBatch();

      if (!currentBatchId) {
        setFiles((prev) => ({
          ...prev,
          [type]: {
            file,
            status: 'error',
            path: null,
            error: 'Failed to initialize batch',
          },
        }));
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [type]: { file, status: 'uploading', path: null, error: null },
      }));

      try {
        // Upload to Supabase Storage
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', uploadPaths[type] || `mpa_${type}/${Date.now()}_${file.name}`);

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { path } = await response.json();

        // Update batch with file path using the returned batch ID
        const patchResponse = await fetch(`/api/mpa/batches/${currentBatchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [`${type}FilePath`]: path }),
        });

        if (!patchResponse.ok) {
          throw new Error('Failed to update batch');
        }

        setFiles((prev) => ({
          ...prev,
          [type]: { file, status: 'uploaded', path, error: null },
        }));
      } catch (error) {
        setFiles((prev) => ({
          ...prev,
          [type]: {
            file,
            status: 'error',
            path: null,
            error: error instanceof Error ? error.message : 'Upload failed',
          },
        }));
      }
    },
    [initializeBatch, uploadPaths]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent, type: MPAFileType) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        handleFileSelect(type, file);
      }
    },
    [handleFileSelect]
  );

  // Run analysis
  const runAnalysis = useCallback(async () => {
    if (!batchId) return;

    setIsProcessing(true);
    setProcessingStatus('Starting analysis...');

    try {
      const response = await fetch(`/api/mpa/batches/${batchId}/process`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setProcessingStatus('Analysis complete!');
        onComplete(batchId);
      } else {
        setProcessingStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setProcessingStatus(
        `Error: ${error instanceof Error ? error.message : 'Processing failed'}`
      );
    } finally {
      setIsProcessing(false);
    }
  }, [batchId, onComplete]);

  const allFilesUploaded = Object.values(files).every((f) => f.status === 'uploaded');
  const currentFileType = FILE_STEPS[currentStep]?.type;
  const currentFileState = currentFileType ? files[currentFileType] : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Monthly Performance Analysis</h2>
      <p className="text-gray-600 mb-6">Upload files for {monthName}</p>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {FILE_STEPS.map((step, index) => (
          <div key={step.type} className="flex items-center">
            <button
              onClick={() => setCurrentStep(index)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index < currentStep || files[step.type].status === 'uploaded'
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {files[step.type].status === 'uploaded' ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </button>
            {index < FILE_STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  files[step.type].status === 'uploaded'
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      {currentStep < FILE_STEPS.length && (
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-1">
            {FILE_STEPS[currentStep].label}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {FILE_STEPS[currentStep].description}
          </p>

          {/* File Drop Zone */}
          <div
            onDrop={(e) => handleDrop(e, currentFileType!)}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              currentFileState?.status === 'uploading'
                ? 'border-blue-300 bg-blue-50'
                : currentFileState?.status === 'uploaded'
                ? 'border-green-300 bg-green-50'
                : currentFileState?.status === 'error'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {currentFileState?.status === 'uploading' ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                <span className="text-blue-600">Uploading...</span>
              </div>
            ) : currentFileState?.status === 'uploaded' ? (
              <div className="flex flex-col items-center">
                <Check className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-green-600 font-medium">
                  {currentFileState.file?.name}
                </span>
                <span className="text-sm text-green-500">Uploaded successfully</span>
              </div>
            ) : currentFileState?.status === 'error' ? (
              <div className="flex flex-col items-center">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-red-600">{currentFileState.error}</span>
                <label className="mt-2 cursor-pointer text-blue-500 hover:underline">
                  Try again
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(currentFileType!, file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-gray-600 mb-1">
                    Drag and drop Excel file here, or click to browse
                  </span>
                  <span className="text-sm text-gray-400">.xlsx or .xls</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(currentFileType!, file);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* File Summary */}
      <div className="border rounded-lg divide-y mb-6">
        {FILE_STEPS.map((step) => (
          <div
            key={step.type}
            className="flex items-center justify-between p-3 text-sm"
          >
            <span className="text-gray-600">{step.label}</span>
            <div className="flex items-center gap-2">
              {files[step.type].status === 'uploaded' ? (
                <>
                  <span className="text-gray-500 truncate max-w-[200px]">
                    {files[step.type].file?.name}
                  </span>
                  <Check className="w-4 h-4 text-green-500" />
                </>
              ) : files[step.type].status === 'uploading' ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : files[step.type].status === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <span className="text-gray-400">Not uploaded</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={isProcessing}
        >
          Cancel
        </button>

        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isProcessing}
            >
              Back
            </button>
          )}

          {currentStep < FILE_STEPS.length - 1 && (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
              disabled={
                !currentFileState ||
                currentFileState.status !== 'uploaded' ||
                isProcessing
              }
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === FILE_STEPS.length - 1 && allFilesUploaded && (
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {processingStatus}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Analysis
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
