'use client';

import type { ValidationError, ValidationResult } from '@/lib/upload/validator';
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

interface ValidationSummaryProps {
  result: ValidationResult;
  showDetails?: boolean;
}

export function ValidationSummary({ result, showDetails = true }: ValidationSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const { isValid, errors, warnings, validRowCount, invalidRowCount } = result;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div
        className={cn(
          'p-4 rounded-lg border-2',
          isValid
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        )}
      >
        <div className="flex items-center gap-3">
          {isValid ? (
            <CheckCircle size={24} className="text-green-600" />
          ) : (
            <AlertCircle size={24} className="text-red-600" />
          )}
          <div>
            <p className={cn('font-semibold', isValid ? 'text-green-800' : 'text-red-800')}>
              {isValid ? 'Validation Passed' : 'Validation Failed'}
            </p>
            <p className={cn('text-sm', isValid ? 'text-green-700' : 'text-red-700')}>
              {validRowCount} valid rows, {invalidRowCount} invalid rows
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{validRowCount}</p>
            <p className="text-xs text-gray-500">Valid Rows</p>
          </div>
          <div className="text-center">
            <p className={cn('text-2xl font-bold', errors.length > 0 ? 'text-red-600' : 'text-gray-400')}>
              {errors.length}
            </p>
            <p className="text-xs text-gray-500">Errors</p>
          </div>
          <div className="text-center">
            <p className={cn('text-2xl font-bold', warnings.length > 0 ? 'text-amber-600' : 'text-gray-400')}>
              {warnings.length}
            </p>
            <p className="text-xs text-gray-500">Warnings</p>
          </div>
        </div>
      </div>

      {/* Errors List */}
      {showDetails && (errors.length > 0 || warnings.length > 0) && (
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">
              View Issues ({errors.length + warnings.length})
            </span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expanded && (
            <div className="divide-y max-h-80 overflow-y-auto">
              {/* Errors */}
              {errors.map((error, i) => (
                <ErrorRow key={`error-${i}`} error={error} type="error" />
              ))}

              {/* Warnings */}
              {warnings.map((warning, i) => (
                <ErrorRow key={`warning-${i}`} error={warning} type="warning" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ErrorRow({ error, type }: { error: ValidationError; type: 'error' | 'warning' }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {type === 'error' ? (
        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', type === 'error' ? 'text-red-700' : 'text-amber-700')}>
          Row {error.row}: {error.message}
        </p>
        {error.value !== undefined && (
          <p className="text-xs text-gray-500 mt-0.5">
            Column: {error.column}, Value: {String(error.value)}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Compact validation indicator for upload cards
 */
export function ValidationIndicator({
  errors,
  warnings,
}: {
  errors: number;
  warnings: number;
}) {
  if (errors === 0 && warnings === 0) {
    return (
      <div className="flex items-center gap-1.5 text-green-600">
        <CheckCircle size={14} />
        <span className="text-xs font-medium">Valid</span>
      </div>
    );
  }

  if (errors > 0) {
    return (
      <div className="flex items-center gap-1.5 text-red-600">
        <AlertCircle size={14} />
        <span className="text-xs font-medium">{errors} errors</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-amber-600">
      <AlertTriangle size={14} />
      <span className="text-xs font-medium">{warnings} warnings</span>
    </div>
  );
}
