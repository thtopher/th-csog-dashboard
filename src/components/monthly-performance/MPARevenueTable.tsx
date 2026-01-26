'use client';

/**
 * MPA Revenue Centers Table
 *
 * Sortable, filterable table of revenue centers with margins
 */

import { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface RevenueCenter {
  id: string;
  contractCode: string;
  projectName: string | null;
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

interface MPARevenueTableProps {
  revenueCenters: RevenueCenter[];
  onSelectProject: (contractCode: string) => void;
}

type SortKey = keyof RevenueCenter;
type SortDirection = 'asc' | 'desc';

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

export function MPARevenueTable({
  revenueCenters,
  onSelectProject,
}: MPARevenueTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(
      revenueCenters.map((rc) => rc.analysisCategory).filter(Boolean)
    );
    return Array.from(cats).sort();
  }, [revenueCenters]);

  // Filter and sort
  const displayedCenters = useMemo(() => {
    let filtered = [...revenueCenters];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (rc) =>
          rc.contractCode.toLowerCase().includes(term) ||
          rc.projectName?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((rc) => rc.analysisCategory === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const numA = Number(aVal);
      const numB = Number(bVal);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return filtered;
  }, [revenueCenters, searchTerm, categoryFilter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getMarginColor = (percent: number) => {
    if (percent >= 30) return 'text-green-600 bg-green-50';
    if (percent >= 20) return 'text-yellow-600 bg-yellow-50';
    if (percent >= 0) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat!}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('contractCode')}
              >
                <div className="flex items-center gap-1">
                  Code <SortIcon column="contractCode" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Project
              </th>
              <th
                className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center justify-end gap-1">
                  Revenue <SortIcon column="revenue" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('laborCost')}
              >
                <div className="flex items-center justify-end gap-1">
                  Labor <SortIcon column="laborCost" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('sgaAllocation')}
              >
                <div className="flex items-center justify-end gap-1">
                  Overhead <SortIcon column="sgaAllocation" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('marginDollars')}
              >
                <div className="flex items-center justify-end gap-1">
                  Margin $ <SortIcon column="marginDollars" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('marginPercent')}
              >
                <div className="flex items-center justify-end gap-1">
                  Margin % <SortIcon column="marginPercent" />
                </div>
              </th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayedCenters.map((rc) => (
              <tr
                key={rc.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectProject(rc.contractCode)}
              >
                <td className="px-4 py-3">
                  <div className="font-mono text-sm">{rc.contractCode}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{rc.projectName || '-'}</span>
                    {rc.allocationTag && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded ${
                          rc.allocationTag === 'Data'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {rc.allocationTag}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm">
                  {formatCurrency(rc.revenue)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm">
                  {formatCurrency(rc.laborCost)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm">
                  {formatCurrency(rc.sgaAllocation + rc.dataAllocation + rc.workplaceAllocation)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm">
                  {formatCurrency(rc.marginDollars)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded font-mono text-sm ${getMarginColor(
                      rc.marginPercent
                    )}`}
                  >
                    {formatPercent(rc.marginPercent)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
        Showing {displayedCenters.length} of {revenueCenters.length} revenue centers
      </div>
    </div>
  );
}
