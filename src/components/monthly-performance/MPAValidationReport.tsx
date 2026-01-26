'use client';

/**
 * MPA Validation Report Component
 *
 * Displays validation results: passes, warnings, and failures
 */

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ValidationItem {
  type: 'pass' | 'warn' | 'fail';
  message: string;
}

interface MPAValidationReportProps {
  validationPassed: boolean;
  validationErrors: ValidationItem[];
}

export function MPAValidationReport({
  validationPassed,
  validationErrors,
}: MPAValidationReportProps) {
  const passes = validationErrors.filter((v) => v.type === 'pass');
  const warnings = validationErrors.filter((v) => v.type === 'warn');
  const failures = validationErrors.filter((v) => v.type === 'fail');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-medium mb-4">Validation Report</h3>

      {/* Summary */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm">
            <span className="font-medium">{passes.length}</span> passed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span className="text-sm">
            <span className="font-medium">{warnings.length}</span> warnings
          </span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm">
            <span className="font-medium">{failures.length}</span> failures
          </span>
        </div>
      </div>

      {/* Overall Status */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          validationPassed
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {validationPassed ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                All validation checks passed
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">
                Validation failed - review issues below
              </span>
            </>
          )}
        </div>
      </div>

      {/* Failures */}
      {failures.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Failures ({failures.length})
          </h4>
          <ul className="space-y-2">
            {failures.map((f, i) => (
              <li
                key={i}
                className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded"
              >
                {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Warnings ({warnings.length})
          </h4>
          <ul className="space-y-2">
            {warnings.map((w, i) => (
              <li
                key={i}
                className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded"
              >
                {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Passes (collapsed by default) */}
      {passes.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer font-medium text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Passed Checks ({passes.length})
            <span className="text-xs text-gray-500 font-normal">
              (click to expand)
            </span>
          </summary>
          <ul className="space-y-1 mt-2">
            {passes.map((p, i) => (
              <li
                key={i}
                className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded"
              >
                {p.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
