'use client';

/**
 * Monthly Performance Analysis - Results Page
 *
 * Displays analysis results with:
 * - Summary metrics
 * - Revenue centers table
 * - Cost centers table
 * - Non-revenue clients
 * - Validation report
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  Users,
  FileWarning,
  ClipboardCheck,
} from 'lucide-react';
import {
  MPAResultsSummary,
  MPARevenueTable,
  MPAProjectDetail,
  MPAValidationReport,
} from '@/components/monthly-performance';

interface BatchResults {
  id: string;
  monthName: string;
  status: string;
  totalRevenue: number;
  totalLaborCost: number;
  totalExpenseCost: number;
  totalMarginDollars: number;
  overallMarginPercent: number;
  sgaPool: number;
  dataPool: number;
  workplacePool: number;
  validationPassed: boolean;
  validationErrors: Array<{ type: string; message: string }>;
  processedAt: string;
}

interface RevenueCenter {
  id: string;
  contractCode: string;
  projectName: string | null;
  proformaSection: string | null;
  analysisCategory: string | null;
  allocationTag: string | null;
  revenue: number;
  hours: number;
  laborCost: number;
  expenseCost: number;
  sgaAllocation: number;
  dataAllocation: number;
  workplaceAllocation: number;
  marginDollars: number;
  marginPercent: number;
}

interface CostCenter {
  id: string;
  contractCode: string;
  description: string | null;
  pool: string;
  hours: number;
  laborCost: number;
  expenseCost: number;
  totalCost: number;
}

interface NonRevenueClient {
  id: string;
  contractCode: string;
  projectName: string | null;
  hours: number;
  laborCost: number;
  expenseCost: number;
  totalCost: number;
}

type TabType = 'revenue' | 'cost' | 'nonrevenue' | 'validation';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BatchResultsPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batchId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchResults | null>(null);
  const [revenueCenters, setRevenueCenters] = useState<RevenueCenter[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [nonRevenueClients, setNonRevenueClients] = useState<NonRevenueClient[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('revenue');
  const [selectedProject, setSelectedProject] = useState<{
    code: string;
    type: 'revenue' | 'cost' | 'nonrevenue';
  } | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/mpa/batches/${batchId}/results`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }

        setBatch(data.batch);
        setRevenueCenters(data.revenueCenters || []);
        setCostCenters(data.costCenters || []);
        setNonRevenueClients(data.nonRevenueClients || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      fetchResults();
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error || 'Results not found'}</p>
          <button
            onClick={() => router.push('/monthly-performance')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Monthly Performance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/monthly-performance')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Monthly Performance
          </button>
          <h1 className="text-2xl font-bold">
            {batch.monthName.replace(/(\d{4})$/, ' $1')} Analysis
          </h1>
          <p className="text-gray-500">
            Processed {new Date(batch.processedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <MPAResultsSummary
          totalRevenue={batch.totalRevenue}
          totalMarginDollars={batch.totalMarginDollars}
          overallMarginPercent={batch.overallMarginPercent}
          sgaPool={batch.sgaPool}
          dataPool={batch.dataPool}
          workplacePool={batch.workplacePool}
          revenueCenterCount={revenueCenters.length}
          costCenterCount={costCenters.length}
          nonRevenueClientCount={nonRevenueClients.length}
        />

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'revenue'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Revenue Centers ({revenueCenters.length})
          </button>
          <button
            onClick={() => setActiveTab('cost')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'cost'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Cost Centers ({costCenters.length})
          </button>
          <button
            onClick={() => setActiveTab('nonrevenue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'nonrevenue'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileWarning className="w-4 h-4" />
            Non-Revenue ({nonRevenueClients.length})
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'validation'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Validation
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'revenue' && (
          <MPARevenueTable
            revenueCenters={revenueCenters}
            onSelectProject={(code) =>
              setSelectedProject({ code, type: 'revenue' })
            }
          />
        )}

        {activeTab === 'cost' && (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Pool
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Hours
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Labor
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Expenses
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {costCenters.map((cc) => (
                    <tr
                      key={cc.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setSelectedProject({ code: cc.contractCode, type: 'cost' })
                      }
                    >
                      <td className="px-4 py-3 font-mono text-sm">
                        {cc.contractCode}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {cc.description || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            cc.pool === 'DATA'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {cc.pool}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {cc.hours.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {formatCurrency(cc.laborCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {formatCurrency(cc.expenseCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-medium">
                        {formatCurrency(cc.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'nonrevenue' && (
          <div className="bg-white rounded-lg shadow">
            {nonRevenueClients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No non-revenue client activity found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-sm">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Project Name
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">
                        Labor
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">
                        Expenses
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {nonRevenueClients.map((nrc) => (
                      <tr
                        key={nrc.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          setSelectedProject({
                            code: nrc.contractCode,
                            type: 'nonrevenue',
                          })
                        }
                      >
                        <td className="px-4 py-3 font-mono text-sm">
                          {nrc.contractCode}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {nrc.projectName || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {nrc.hours.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {formatCurrency(nrc.laborCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {formatCurrency(nrc.expenseCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-medium text-red-600">
                          {formatCurrency(nrc.totalCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'validation' && (
          <MPAValidationReport
            validationPassed={batch.validationPassed}
            validationErrors={batch.validationErrors as any}
          />
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <MPAProjectDetail
          batchId={batchId}
          contractCode={selectedProject.code}
          projectType={selectedProject.type}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
