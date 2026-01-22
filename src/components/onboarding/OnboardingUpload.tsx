'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UPLOAD_TYPES } from '@/config/uploadTypes';
import { DEFAULT_EXECUTIVES } from '@/config/executives';
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnboardingUploadProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function OnboardingUpload({ onNext, onBack, onSkip }: OnboardingUploadProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const userExecutiveId = user?.executiveId;

  // Get user's own uploads
  const myUploads = UPLOAD_TYPES.filter(type =>
    userExecutiveId && type.allowedExecutives.includes(userExecutiveId)
  );

  // For admins, also get team uploads with executive info
  const teamUploads = isAdmin
    ? UPLOAD_TYPES
        .filter(type => !userExecutiveId || !type.allowedExecutives.includes(userExecutiveId))
        .map(type => {
          const execId = type.allowedExecutives[0];
          const exec = DEFAULT_EXECUTIVES.find(e => e.id === execId);
          return { ...type, responsibleExec: exec };
        })
    : [];

  // Combined list for selection - user's uploads first, then team uploads
  const allAvailableUploads = [...myUploads, ...teamUploads];

  const [selectedType, setSelectedType] = useState(myUploads[0]?.id || allAvailableUploads[0]?.id || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');

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
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    setUploadStatus('success');
  };

  const selectedTypeInfo = allAvailableUploads.find(t => t.id === selectedType);
  const selectedIsTeamUpload = teamUploads.some(t => t.id === selectedType);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Your First Upload
        </h1>
        <p className="text-gray-600">
          Let&apos;s walk through uploading your first data file.
          Don&apos;t worry - you can always upload more later.
        </p>
      </div>

      {uploadStatus !== 'success' ? (
        <>
          {/* Step 1: Select Type */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              1. Select a data type
            </h2>

            {/* User's own uploads */}
            {myUploads.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your Uploads</p>
                <div className="grid grid-cols-2 gap-3">
                  {myUploads.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <type.icon
                        size={20}
                        className={selectedType === type.id ? 'text-blue-600' : 'text-gray-400'}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{type.name}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Team uploads (admin only) */}
            {isAdmin && teamUploads.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Team Uploads (upload on behalf of)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {teamUploads.slice(0, 4).map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <type.icon
                        size={20}
                        className={selectedType === type.id ? 'text-blue-600' : 'text-gray-400'}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{type.name}</p>
                        <p className="text-xs text-gray-500">
                          {type.responsibleExec?.title}: {type.responsibleExec?.name?.split(' ')[0]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {teamUploads.length > 4 && (
                  <p className="text-xs text-gray-400 mt-2">
                    +{teamUploads.length - 4} more available on the upload page
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Upload File */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              2. Upload your file
            </h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {uploadStatus === 'uploading' ? (
                <div className="flex flex-col items-center">
                  <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600">Uploading {selectedFile?.name}...</p>
                </div>
              ) : (
                <>
                  <Upload size={40} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your {selectedTypeInfo?.name} file here
                  </p>
                  <label className="inline-flex cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      or browse to select
                    </span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-3">
                    Accepts .xlsx files only
                  </p>
                </>
              )}
            </div>

            {selectedFile && uploadStatus === 'idle' && (
              <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={24} className="text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Success State */
        <div className="text-center py-8 mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your {selectedTypeInfo?.name} data has been processed.
          </p>
          <div className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
            24 records processed
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex items-center gap-3">
          {uploadStatus !== 'success' && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={onNext}
            disabled={uploadStatus === 'uploading'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
