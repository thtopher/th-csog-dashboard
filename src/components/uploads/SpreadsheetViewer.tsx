'use client';

import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils/cn';
import {
  X,
  Download,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface SpreadsheetViewerProps {
  uploadId: string;
  fileName: string;
  uploadType: string;
  uploaderName: string;
  uploadedAt: string;
  onClose: () => void;
}

interface SheetData {
  name: string;
  data: (string | number | boolean | null)[][];
  headers: string[];
}

export function SpreadsheetViewer({
  uploadId,
  fileName,
  uploadType,
  uploaderName,
  uploadedAt,
  onClose,
}: SpreadsheetViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);

  // Load and parse the spreadsheet
  const loadSpreadsheet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the file
      const response = await fetch(`/api/uploads/${uploadId}?action=download`);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const arrayBuffer = await response.arrayBuffer();

      // Parse with SheetJS
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Convert all sheets
      const parsedSheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];

        // Get actual column count from sheet range
        const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
        const colCount = range ? range.e.c + 1 : 0;

        // Use defval to include empty cells
        const jsonData = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
          worksheet,
          { header: 1, defval: '' }
        );

        // First row is typically headers - ensure we have all columns
        const firstRow = jsonData[0] || [];
        const headers = Array.from({ length: Math.max(colCount, firstRow.length) }, (_, i) =>
          String(firstRow[i] || `Column ${String.fromCharCode(65 + i)}`)
        );
        const data = jsonData.slice(1);

        return {
          name: sheetName,
          headers,
          data,
        };
      });

      setSheets(parsedSheets);
    } catch (err) {
      console.error('Error loading spreadsheet:', err);
      setError(err instanceof Error ? err.message : 'Failed to load spreadsheet');
    } finally {
      setIsLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    loadSpreadsheet();
  }, [loadSpreadsheet]);

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/uploads/${uploadId}?action=download`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const currentSheet = sheets[activeSheet];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[95vw] h-[90vh] max-w-7xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <FileSpreadsheet size={24} className="text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{fileName}</h2>
              <p className="text-sm text-gray-500">
                {uploadType} &middot; Uploaded by {uploaderName} on{' '}
                {new Date(uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sheet Tabs */}
        {sheets.length > 1 && (
          <div className="flex items-center gap-1 px-6 py-2 border-b bg-gray-50 overflow-x-auto">
            {sheets.map((sheet, index) => (
              <button
                key={sheet.name}
                onClick={() => setActiveSheet(index)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  index === activeSheet
                    ? 'bg-white text-gray-900 shadow-sm border'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                )}
              >
                {sheet.name}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 size={40} className="animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading spreadsheet...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium mb-2">Failed to load spreadsheet</p>
                <p className="text-gray-500 text-sm">{error}</p>
                <button
                  onClick={loadSpreadsheet}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : currentSheet ? (
            <div className="overflow-x-auto overflow-y-auto h-full">
              <table className="text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-500 border-b border-r bg-gray-200 w-12 sticky left-0 z-20">
                      #
                    </th>
                    {currentSheet.headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-r bg-gray-100 whitespace-nowrap min-w-[120px]"
                      >
                        {header || `Column ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentSheet.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={cn(
                        'hover:bg-blue-50 transition-colors',
                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      )}
                    >
                      <td className="px-4 py-2 text-gray-400 border-b border-r bg-gray-50 font-mono text-xs sticky left-0 z-10">
                        {rowIndex + 2}
                      </td>
                      {currentSheet.headers.map((_, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-2 text-gray-900 border-b border-r whitespace-nowrap"
                          title={String(row[colIndex] ?? '')}
                        >
                          {formatCellValue(row[colIndex])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data to display</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentSheet && (
          <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-500">
            <div>
              {currentSheet.data.length} rows &middot; {currentSheet.headers.length} columns
            </div>
            {sheets.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSheet(Math.max(0, activeSheet - 1))}
                  disabled={activeSheet === 0}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Sheet {activeSheet + 1} of {sheets.length}
                </span>
                <button
                  onClick={() => setActiveSheet(Math.min(sheets.length - 1, activeSheet + 1))}
                  disabled={activeSheet === sheets.length - 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatCellValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    // Format numbers nicely
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}
