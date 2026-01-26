'use client';

/**
 * MPA Results Summary Component
 *
 * Displays summary cards with key metrics:
 * - Total Revenue
 * - Total Margin
 * - Overall Margin %
 * - Overhead Pools breakdown
 */

import { DollarSign, TrendingUp, PieChart, Building2 } from 'lucide-react';

interface MPAResultsSummaryProps {
  totalRevenue: number;
  totalMarginDollars: number;
  overallMarginPercent: number;
  sgaPool: number;
  dataPool: number;
  workplacePool: number;
  revenueCenterCount: number;
  costCenterCount: number;
  nonRevenueClientCount: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function MPAResultsSummary({
  totalRevenue,
  totalMarginDollars,
  overallMarginPercent,
  sgaPool,
  dataPool,
  workplacePool,
  revenueCenterCount,
  costCenterCount,
  nonRevenueClientCount,
}: MPAResultsSummaryProps) {
  const totalPools = sgaPool + dataPool + workplacePool;
  const marginColor =
    overallMarginPercent >= 30
      ? 'text-green-600'
      : overallMarginPercent >= 20
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-gray-500 mt-1">
            {revenueCenterCount} revenue centers
          </div>
        </div>

        {/* Total Margin */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Total Margin</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalMarginDollars)}</div>
          <div className={`text-sm font-medium mt-1 ${marginColor}`}>
            {formatPercent(overallMarginPercent)} margin
          </div>
        </div>

        {/* Overhead Pools */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Total Overhead</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalPools)}</div>
          <div className="text-sm text-gray-500 mt-1">
            {costCenterCount} cost centers
          </div>
        </div>
      </div>

      {/* Pool Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          Overhead Pool Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SG&A Pool */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">SG&A</span>
              <span className="text-sm font-medium">{formatCurrency(sgaPool)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${totalPools > 0 ? (sgaPool / totalPools) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              All revenue centers
            </div>
          </div>

          {/* Data Pool */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Data Infrastructure</span>
              <span className="text-sm font-medium">{formatCurrency(dataPool)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${totalPools > 0 ? (dataPool / totalPools) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Data-tagged projects only
            </div>
          </div>

          {/* Workplace Pool */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Workplace Well-being</span>
              <span className="text-sm font-medium">{formatCurrency(workplacePool)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${totalPools > 0 ? (workplacePool / totalPools) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Wellness-tagged projects only
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      {nonRevenueClientCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 rounded">
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-amber-800">
                Non-Revenue Activity Detected
              </div>
              <div className="text-sm text-amber-700">
                {nonRevenueClientCount} projects have activity (hours or expenses) but no
                revenue in Pro Forma. Review the Non-Revenue Clients tab for details.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
