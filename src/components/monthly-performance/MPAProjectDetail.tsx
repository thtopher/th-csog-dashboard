'use client';

/**
 * MPA Project Detail Modal
 *
 * Drill-down view showing:
 * - Hours by person
 * - Expense line items
 * - Allocation calculations
 */

import { useState, useEffect } from 'react';
import { X, Loader2, Clock, Receipt, Calculator, User } from 'lucide-react';

interface HoursDetail {
  staffKey: string;
  hours: number;
  hourlyCost: number;
  laborCost: number;
}

interface ExpenseDetail {
  expenseDate: string | null;
  amount: number;
  notes: string | null;
}

interface AllocationBreakdown {
  sga: {
    pool: number;
    totalRevenue: number;
    projectRevenue: number;
    sharePercent: number;
    allocation: number;
    formula: string;
  };
  data: {
    pool: number;
    taggedRevenue: number;
    projectRevenue: number;
    sharePercent: number;
    allocation: number;
    formula: string;
  } | null;
  workplace: {
    pool: number;
    taggedRevenue: number;
    projectRevenue: number;
    sharePercent: number;
    allocation: number;
    formula: string;
  } | null;
}

interface ProjectInfo {
  type: string;
  contractCode: string;
  projectName?: string;
  allocationTag?: string;
  revenue?: number;
  hours?: number;
  laborCost?: number;
  expenseCost?: number;
  sgaAllocation?: number;
  dataAllocation?: number;
  workplaceAllocation?: number;
  marginDollars?: number;
  marginPercent?: number;
  totalCost?: number;
  pool?: string;
  description?: string;
}

interface MPAProjectDetailProps {
  batchId: string;
  contractCode: string;
  projectType: 'revenue' | 'cost' | 'nonrevenue';
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function MPAProjectDetail({
  batchId,
  contractCode,
  projectType,
  onClose,
}: MPAProjectDetailProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [hoursDetail, setHoursDetail] = useState<HoursDetail[]>([]);
  const [expensesDetail, setExpensesDetail] = useState<ExpenseDetail[]>([]);
  const [allocationBreakdown, setAllocationBreakdown] =
    useState<AllocationBreakdown | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/mpa/batches/${batchId}/detail/${projectType}/${encodeURIComponent(
            contractCode
          )}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch detail');
        }

        setProject(data.project);
        setHoursDetail(data.hoursDetail || []);
        setExpensesDetail(data.expensesDetail || []);
        setAllocationBreakdown(data.allocationBreakdown);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load detail');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [batchId, contractCode, projectType]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{contractCode}</h2>
            <p className="text-sm text-gray-500">
              {project?.projectName || project?.description || 'Project Detail'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Hours Detail */}
              <div>
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Hours by Person ({hoursDetail.length})
                </h3>
                {hoursDetail.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Staff
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-600">
                            Hours
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-600">
                            Rate
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-600">
                            Labor Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {hoursDetail.map((h, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {h.staffKey}
                            </td>
                            <td className="px-4 py-2 text-right font-mono">
                              {h.hours.toFixed(1)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono">
                              {formatCurrency(h.hourlyCost)}/hr
                            </td>
                            <td className="px-4 py-2 text-right font-mono">
                              {formatCurrency(h.laborCost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="px-4 py-2">Total</td>
                          <td className="px-4 py-2 text-right font-mono">
                            {hoursDetail.reduce((s, h) => s + h.hours, 0).toFixed(1)}
                          </td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right font-mono">
                            {formatCurrency(
                              hoursDetail.reduce((s, h) => s + h.laborCost, 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hours recorded for this project
                  </p>
                )}
              </div>

              {/* Expenses Detail */}
              <div>
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  Expenses ({expensesDetail.length})
                </h3>
                {expensesDetail.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Notes
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-600">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {expensesDetail.map((e, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              {e.expenseDate || '-'}
                            </td>
                            <td className="px-4 py-2 text-gray-600 truncate max-w-[300px]">
                              {e.notes || '-'}
                            </td>
                            <td className="px-4 py-2 text-right font-mono">
                              {formatCurrency(e.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="px-4 py-2" colSpan={2}>
                            Total
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            {formatCurrency(
                              expensesDetail.reduce((s, e) => s + e.amount, 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No expenses recorded for this project
                  </p>
                )}
              </div>

              {/* Allocation Breakdown (Revenue centers only) */}
              {allocationBreakdown && (
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-gray-400" />
                    Allocation Calculations
                  </h3>
                  <div className="space-y-4">
                    {/* SG&A */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="font-medium text-sm mb-2">SG&A Allocation</div>
                      <div className="text-xs text-gray-500 font-mono mb-2">
                        {allocationBreakdown.sga.formula}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Pool</div>
                          <div className="font-mono">
                            {formatCurrency(allocationBreakdown.sga.pool)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Share</div>
                          <div className="font-mono">
                            {allocationBreakdown.sga.sharePercent.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Allocation</div>
                          <div className="font-mono font-medium">
                            {formatCurrency(allocationBreakdown.sga.allocation)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data (if applicable) */}
                    {allocationBreakdown.data && (
                      <div className="border rounded-lg p-4 bg-purple-50">
                        <div className="font-medium text-sm mb-2 text-purple-800">
                          Data Infrastructure Allocation
                        </div>
                        <div className="text-xs text-purple-600 font-mono mb-2">
                          {allocationBreakdown.data.formula}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-purple-600">Pool</div>
                            <div className="font-mono">
                              {formatCurrency(allocationBreakdown.data.pool)}
                            </div>
                          </div>
                          <div>
                            <div className="text-purple-600">Share</div>
                            <div className="font-mono">
                              {allocationBreakdown.data.sharePercent.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-purple-600">Allocation</div>
                            <div className="font-mono font-medium">
                              {formatCurrency(allocationBreakdown.data.allocation)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Workplace (if applicable) */}
                    {allocationBreakdown.workplace && (
                      <div className="border rounded-lg p-4 bg-green-50">
                        <div className="font-medium text-sm mb-2 text-green-800">
                          Workplace Well-being Allocation
                        </div>
                        <div className="text-xs text-green-600 font-mono mb-2">
                          {allocationBreakdown.workplace.formula}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-green-600">Pool</div>
                            <div className="font-mono">
                              {formatCurrency(allocationBreakdown.workplace.pool)}
                            </div>
                          </div>
                          <div>
                            <div className="text-green-600">Share</div>
                            <div className="font-mono">
                              {allocationBreakdown.workplace.sharePercent.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-green-600">Allocation</div>
                            <div className="font-mono font-medium">
                              {formatCurrency(allocationBreakdown.workplace.allocation)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
