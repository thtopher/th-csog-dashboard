'use client';

import { useState } from 'react';
import type { ColumnMapping } from '@/lib/upload/mapper';
import type { UploadSchema } from '@/lib/upload/schemas';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ParsedRow {
  rowNumber: number;
  data: Record<string, unknown>;
}

interface UploadPreviewProps {
  rows: ParsedRow[];
  schema: UploadSchema;
  mappings: ColumnMapping[];
  maxRows?: number;
}

export function UploadPreview({
  rows,
  schema,
  mappings,
  maxRows = 10,
}: UploadPreviewProps) {
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const totalPages = Math.ceil(Math.min(rows.length, maxRows) / pageSize);

  const displayRows = rows.slice(page * pageSize, (page + 1) * pageSize);

  // Get mapped columns in schema order
  const mappedColumns = schema.columns
    .map(col => {
      const mapping = mappings.find(m => m.targetColumn === col.name);
      return mapping ? { schema: col, mapping } : null;
    })
    .filter(Boolean) as { schema: typeof schema.columns[0]; mapping: ColumnMapping }[];

  // Apply mappings to get display data
  const getMappedValue = (row: ParsedRow, targetColumn: string): unknown => {
    const mapping = mappings.find(m => m.targetColumn === targetColumn);
    if (!mapping) return undefined;
    return row.data[mapping.sourceColumn];
  };

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) return '-';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
        <p className="text-sm text-gray-500">
          Showing {displayRows.length} of {rows.length} rows
        </p>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left font-semibold text-gray-500 w-16">
                  Row
                </th>
                {mappedColumns.map(({ schema: col, mapping }) => (
                  <th key={col.name} className="px-3 py-2 text-left">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-900">{col.name}</span>
                      <span className="text-xs font-normal text-gray-400">
                        ← {mapping.sourceColumn}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayRows.map(row => (
                <tr key={row.rowNumber} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400 font-mono">
                    {row.rowNumber}
                  </td>
                  {mappedColumns.map(({ schema: col }) => {
                    const value = getMappedValue(row, col.name);
                    const isEmpty = value === undefined || value === null || value === '';

                    return (
                      <td
                        key={col.name}
                        className={cn(
                          'px-3 py-2',
                          isEmpty && col.required
                            ? 'text-red-500 bg-red-50'
                            : isEmpty
                              ? 'text-gray-300'
                              : 'text-gray-900'
                        )}
                      >
                        {formatValue(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Confirmation Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Does this look right?</h4>
        <p className="text-sm text-blue-700 mb-3">
          Please verify that the columns are mapped correctly and the data appears as expected.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Check size={16} className="text-green-600" />
            <span>{mappedColumns.length} columns mapped</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Check size={16} className="text-green-600" />
            <span>{rows.length} rows detected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple row count preview
 */
export function RowCountPreview({ total, valid, invalid }: { total: number; valid: number; invalid: number }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-gray-900">{total}</span>
        <span className="text-gray-500">total rows</span>
      </div>
      {valid > 0 && (
        <div className="flex items-center gap-1.5 text-green-600">
          <Check size={14} />
          <span>{valid} valid</span>
        </div>
      )}
      {invalid > 0 && (
        <div className="flex items-center gap-1.5 text-red-600">
          <X size={14} />
          <span>{invalid} invalid</span>
        </div>
      )}
    </div>
  );
}
