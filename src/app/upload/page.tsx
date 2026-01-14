'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type UploadStatus = 'idle' | 'uploading' | 'validating' | 'success' | 'error';

interface UploadResult {
  success: boolean;
  recordsProcessed: number;
  errors: { message: string; severity: 'error' | 'warning' }[];
}

const DATA_TYPES = [
  {
    id: 'excel_harvest',
    name: 'Harvest Compliance',
    description: 'Weekly time tracking compliance data',
    icon: Clock,
    template: 'harvest_compliance_template.xlsx',
  },
  {
    id: 'excel_training',
    name: 'Training Status',
    description: 'Staff training completion tracking',
    icon: FileText,
    template: 'training_status_template.xlsx',
  },
  {
    id: 'excel_billable',
    name: 'Billable Hours',
    description: 'Weekly billable hour allocation',
    icon: FileSpreadsheet,
    template: 'billable_hours_template.xlsx',
  },
];

const RECENT_UPLOADS = [
  {
    id: '1',
    fileName: 'harvest_compliance_2024-W50.xlsx',
    dataType: 'Harvest Compliance',
    uploadedBy: 'Jordana',
    uploadedAt: '2024-12-29T14:30:00Z',
    status: 'success',
    recordsProcessed: 24,
  },
  {
    id: '2',
    fileName: 'training_status_2024-12.xlsx',
    dataType: 'Training Status',
    uploadedBy: 'Jordana',
    uploadedAt: '2024-12-28T10:15:00Z',
    status: 'success',
    recordsProcessed: 48,
  },
  {
    id: '3',
    fileName: 'harvest_compliance_2024-W49.xlsx',
    dataType: 'Harvest Compliance',
    uploadedBy: 'Jordana',
    uploadedAt: '2024-12-22T16:00:00Z',
    status: 'warning',
    recordsProcessed: 22,
  },
];

export default function UploadPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) return;

    setUploadStatus('uploading');

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadStatus('validating');

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate result
    setUploadResult({
      success: true,
      recordsProcessed: 24,
      errors: [
        { message: 'Row 15: hours_logged exceeds 60 hours', severity: 'warning' },
      ],
    });
    setUploadStatus('success');
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Upload Data' }]} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upload Data</h1>
          <p className="mt-1 text-gray-500">
            Upload Excel files to update dashboard KPIs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Data Type */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                1. Select Data Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DATA_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all',
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <type.icon
                      size={24}
                      className={selectedType === type.id ? 'text-blue-600' : 'text-gray-400'}
                    />
                    <span className="mt-2 font-medium text-gray-900">{type.name}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Upload File */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                2. Upload File
              </h2>

              {uploadStatus === 'idle' && (
                <>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400',
                      !selectedType && 'opacity-50 pointer-events-none'
                    )}
                  >
                    <Upload size={40} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your Excel file here, or
                    </p>
                    <label className="inline-flex cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        browse to select
                      </span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="sr-only"
                        disabled={!selectedType}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-3">
                      Accepts .xlsx files only
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet size={24} className="text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={resetUpload}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Remove
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={!selectedType}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {(uploadStatus === 'uploading' || uploadStatus === 'validating') && (
                <div className="text-center py-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </div>
                  <p className="text-gray-900 font-medium">
                    {uploadStatus === 'uploading' ? 'Uploading file...' : 'Validating data...'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedFile?.name}
                  </p>
                </div>
              )}

              {uploadStatus === 'success' && uploadResult && (
                <div className="text-center py-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <p className="text-gray-900 font-medium">Upload Successful</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {uploadResult.recordsProcessed} records processed
                  </p>

                  {uploadResult.errors.length > 0 && (
                    <div className="mt-4 text-left rounded-lg bg-amber-50 border border-amber-200 p-4">
                      <p className="text-sm font-medium text-amber-800 mb-2">Warnings:</p>
                      <ul className="space-y-1">
                        {uploadResult.errors.map((err, i) => (
                          <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={resetUpload}
                    className="mt-6 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Upload Another File
                  </button>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="text-center py-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <XCircle size={24} className="text-red-600" />
                  </div>
                  <p className="text-gray-900 font-medium">Upload Failed</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please check your file and try again
                  </p>
                  <button
                    onClick={resetUpload}
                    className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Templates</h3>
              <p className="text-sm text-gray-500 mb-4">
                Download the template for the data type you're uploading
              </p>
              <div className="space-y-2">
                {DATA_TYPES.map(type => (
                  <a
                    key={type.id}
                    href={`/templates/${type.template}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={16} className="text-green-600" />
                      <span className="text-sm text-gray-700">{type.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </a>
                ))}
              </div>
              <a
                href="/docs/excel-templates"
                className="block mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View template documentation →
              </a>
            </div>

            {/* Recent Uploads */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Uploads</h3>
              <div className="space-y-3">
                {RECENT_UPLOADS.map(upload => (
                  <div key={upload.id} className="flex items-start gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0',
                      upload.status === 'success' ? 'bg-green-100' :
                      upload.status === 'warning' ? 'bg-amber-100' : 'bg-red-100'
                    )}>
                      {upload.status === 'success' ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : upload.status === 'warning' ? (
                        <AlertCircle size={14} className="text-amber-600" />
                      ) : (
                        <XCircle size={14} className="text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {upload.uploadedBy} • {new Date(upload.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
