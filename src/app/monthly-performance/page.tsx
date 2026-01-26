'use client';

/**
 * Monthly Performance Analysis - Main Page
 *
 * Displays:
 * - Upload wizard for new analysis
 * - History of past analyses
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { MPAUploadWizard } from '@/components/monthly-performance';
import { Header } from '@/components/layout/Header';

interface BatchSummary {
  id: string;
  monthName: string;
  status: string;
  errorMessage: string | null;
  totalRevenue: number | null;
  totalMarginDollars: number | null;
  overallMarginPercent: number | null;
  validationPassed: boolean;
  createdBy: string;
  createdAt: string;
  processedAt: string | null;
}

// Generate month options for the last 24 months
function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    options.push({
      value: `${monthName}${year}`,
      label: `${monthName} ${year}`,
    });
  }

  return options;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MonthlyPerformancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // TODO: Get from auth context
  const userEmail = 'user@example.com';

  const monthOptions = getMonthOptions();

  // Load batch history
  useEffect(() => {
    const fetchBatches = async () => {
      setLoadingBatches(true);
      try {
        const response = await fetch(`/api/mpa/batches?email=${userEmail}&limit=20`);
        const data = await response.json();
        if (data.success) {
          setBatches(data.batches);
        }
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [userEmail]);

  const handleStartAnalysis = () => {
    if (!selectedMonth) return;
    setShowWizard(true);
  };

  const handleWizardComplete = (batchId: string) => {
    router.push(`/monthly-performance/${batchId}`);
  };

  const handleViewBatch = (batchId: string) => {
    router.push(`/monthly-performance/${batchId}`);
  };

  const getStatusBadge = (status: string, validationPassed: boolean) => {
    switch (status) {
      case 'completed':
        return validationPassed ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
            <CheckCircle2 className="w-3 h-3" />
            Completed with warnings
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-8">
          <MPAUploadWizard
            monthName={selectedMonth}
            userEmail={userEmail}
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Monthly Performance Analysis</h1>
              <p className="text-gray-500">
                Analyze project margins with overhead allocation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        {/* New Analysis Tab */}
        {activeTab === 'new' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Start New Analysis</h2>
            <p className="text-gray-600 mb-6">
              Select a month and upload the 5 required files to run a new
              monthly performance analysis.
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analysis Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a month...</option>
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleStartAnalysis}
                  disabled={!selectedMonth}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start Upload
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Required Files</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. Pro Forma Workbook (with PRO FORMA 2025 sheet)</li>
                <li>2. Compensation File (with hourly rates or salary data)</li>
                <li>3. Harvest Hours Export (time tracking for the month)</li>
                <li>4. Harvest Expenses Export (with Billable column)</li>
                <li>5. P&L Statement (with IncomeStatement sheet)</li>
              </ul>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            {loadingBatches ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : batches.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No analyses yet
                </h3>
                <p className="text-gray-500">
                  Start a new analysis to see it here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {batches.map((batch) => (
                      <tr
                        key={batch.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewBatch(batch.id)}
                      >
                        <td className="px-6 py-4 font-medium">
                          {batch.monthName.replace(/(\d{4})$/, ' $1')}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(batch.status, batch.validationPassed)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {batch.totalRevenue
                            ? formatCurrency(batch.totalRevenue)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {batch.overallMarginPercent != null ? (
                            <span
                              className={`font-mono ${
                                batch.overallMarginPercent >= 30
                                  ? 'text-green-600'
                                  : batch.overallMarginPercent >= 20
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {batch.overallMarginPercent.toFixed(1)}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(batch.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
