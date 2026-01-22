'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { AdminOverview } from '@/components/dashboard/AdminOverview';
import { OperatingRhythmView } from '@/components/dashboard/OperatingRhythmView';
import { SpreadsheetViewer } from '@/components/uploads';
import { useAuth } from '@/contexts/AuthContext';
import { getUploadTypeById } from '@/config/uploadTypes';
import { DEFAULT_EXECUTIVES } from '@/config/executives';
import {
  Loader2,
  Shield,
  Upload,
  Users,
  BarChart3,
  FileSpreadsheet,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UploadCompliance {
  executiveId: string;
  executiveName: string;
  title: string;
  totalRequired: number;
  totalCompleted: number;
  pendingUploads: string[];
  lastUpload?: string;
}

interface UploadRecord {
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
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [compliance, setCompliance] = useState<UploadCompliance[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadRecord[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);

  // Spreadsheet viewer state
  const [viewingUpload, setViewingUpload] = useState<UploadRecord | null>(null);

  // Check for admin access
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Load compliance data with cache-busting
  const loadComplianceData = useCallback(async (skipLoadingState = false) => {
    if (!skipLoadingState) setIsLoading(true);
    try {
      // Fetch real compliance data from API with cache-busting
      const res = await fetch(`/api/uploads/compliance?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        // Transform thermometer data to compliance format
        if (data.thermometers) {
          const complianceData: UploadCompliance[] = data.thermometers.map((t: {
            executiveId: string;
            executiveName: string;
            title: string;
            totalRequired: number;
            totalCompleted: number;
            uploads: { uploadTypeName: string; status: string }[];
          }) => ({
            executiveId: t.executiveId,
            executiveName: t.executiveName,
            title: t.title,
            totalRequired: t.totalRequired,
            totalCompleted: t.totalCompleted,
            pendingUploads: t.uploads
              .filter((u) => u.status === 'pending' || u.status === 'overdue')
              .map((u) => u.uploadTypeName),
            lastUpload: undefined, // Could be fetched separately
          }));
          setCompliance(complianceData);
        }
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      // Set empty compliance on error
      setCompliance([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRecentUploads = useCallback(async (skipLoadingState = false) => {
    if (!skipLoadingState) setUploadsLoading(true);
    try {
      const res = await fetch(`/api/data/upload?all=true&limit=10&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setRecentUploads(data.uploads || []);
      }
    } catch (error) {
      console.error('Failed to load recent uploads:', error);
    } finally {
      setUploadsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadComplianceData();
      loadRecentUploads();
    }
  }, [isAuthenticated, user, loadComplianceData, loadRecentUploads]);

  // Refetch when page becomes visible (user returns from upload page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user?.role === 'admin') {
        loadComplianceData(true);
        loadRecentUploads(true);
      }
    };

    const handleFocus = () => {
      if (isAuthenticated && user?.role === 'admin') {
        loadComplianceData(true);
        loadRecentUploads(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadComplianceData, loadRecentUploads, isAuthenticated, user]);

  // Get upload type display name
  function getUploadTypeName(uploadType: string): string {
    const type = getUploadTypeById(uploadType);
    return type?.name || uploadType;
  }

  // Get executive name from ID
  function getExecutiveName(executiveId?: string): string {
    if (!executiveId) return 'Unknown';
    const exec = DEFAULT_EXECUTIVES.find(e => e.id === executiveId);
    return exec?.name || executiveId;
  }

  // Format file size
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Download file
  async function handleDownload(upload: UploadRecord) {
    try {
      const response = await fetch(`/api/uploads/${upload.id}?action=download`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = upload.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  }

  if (authLoading || (isAuthenticated && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Calculate summary stats
  const totalRequired = compliance.reduce((sum, c) => sum + c.totalRequired, 0);
  const totalCompleted = compliance.reduce((sum, c) => sum + c.totalCompleted, 0);
  const executivesWithPending = compliance.filter(c => c.pendingUploads.length > 0).length;
  const overallComplianceRate = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-900 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-500">
            Manage uploads, monitor compliance, and oversee all executive domains
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCompleted}/{totalRequired}</p>
                <p className="text-sm text-gray-500">Uploads This Period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overallComplianceRate}%</p>
                <p className="text-sm text-gray-500">Compliance Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{executivesWithPending}</p>
                <p className="text-sm text-gray-500">Pending Uploads</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-sm text-gray-500">Active Executives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Upload size={16} />
              Upload Data
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 size={16} />
              View CEO Scorecard
            </Link>
          </div>
        </div>

        {/* Operating Rhythm View */}
        <div className="mb-8">
          <OperatingRhythmView />
        </div>

        {/* Executive Compliance Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Upload Compliance</h2>
          <AdminOverview compliance={compliance} isLoading={isLoading} />
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
            <span className="text-sm text-gray-500">
              {recentUploads.length} uploads
            </span>
          </div>

          {uploadsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : recentUploads.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No uploads yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Uploads will appear here when executives submit their data
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {recentUploads.map((upload) => {
                const uploadType = getUploadTypeById(upload.uploadType);
                const Icon = uploadType?.icon || FileSpreadsheet;
                const hasFile = Boolean(upload.filePath);

                return (
                  <div
                    key={upload.id}
                    className="px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        'p-2 rounded-lg flex-shrink-0',
                        hasFile ? 'bg-green-100' : 'bg-gray-100'
                      )}>
                        <Icon
                          size={20}
                          className={hasFile ? 'text-green-600' : 'text-gray-400'}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {/* Upload Type */}
                            <p className="font-medium text-gray-900">
                              {getUploadTypeName(upload.uploadType)}
                            </p>
                            {/* File name */}
                            <p className="text-sm text-gray-500 truncate max-w-md" title={upload.fileName}>
                              {upload.fileName}
                            </p>
                            {/* Meta */}
                            <p className="text-xs text-gray-400 mt-1">
                              {upload.uploaderName} &middot;{' '}
                              {formatFileSize(upload.fileSize)} &middot;{' '}
                              {upload.recordsProcessed} records
                            </p>
                          </div>

                          {/* Date & Actions */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(upload.uploadedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {new Date(upload.uploadedAt).toLocaleTimeString()}
                            </p>

                            {/* Action buttons */}
                            {hasFile && (
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  onClick={() => setViewingUpload(upload)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Preview spreadsheet"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownload(upload)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title="Download file"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Spreadsheet Viewer Modal */}
      {viewingUpload && (
        <SpreadsheetViewer
          uploadId={viewingUpload.id}
          fileName={viewingUpload.fileName}
          uploadType={getUploadTypeName(viewingUpload.uploadType)}
          uploaderName={viewingUpload.uploaderName}
          uploadedAt={viewingUpload.uploadedAt}
          onClose={() => setViewingUpload(null)}
        />
      )}
    </div>
  );
}
