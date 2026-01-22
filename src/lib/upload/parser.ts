/**
 * Excel File Parser
 * Uses xlsx library to parse Excel files
 */

import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, unknown>;
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  sheetName: string;
  totalRows: number;
}

/**
 * Parse an Excel file and return the data
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    cellNF: true,
    cellStyles: false,
  });

  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    dateNF: 'yyyy-mm-dd',
  }) as unknown[][];

  if (jsonData.length === 0) {
    return {
      headers: [],
      rows: [],
      sheetName,
      totalRows: 0,
    };
  }

  // First row is headers
  const headers = (jsonData[0] as string[]).map(h =>
    normalizeHeaderName(String(h || ''))
  );

  // Rest are data rows
  const rows: ParsedRow[] = [];
  for (let i = 1; i < jsonData.length; i++) {
    const rowData = jsonData[i] as unknown[];

    // Skip completely empty rows
    if (rowData.every(cell => cell === undefined || cell === null || cell === '')) {
      continue;
    }

    const data: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      if (header) {
        data[header] = rowData[index];
      }
    });

    rows.push({
      rowNumber: i + 1, // 1-indexed for user display
      data,
    });
  }

  return {
    headers: headers.filter(h => h !== ''),
    rows,
    sheetName,
    totalRows: rows.length,
  };
}

/**
 * Normalize header name for matching
 */
export function normalizeHeaderName(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Parse a date value from Excel
 */
export function parseExcelDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    // Excel serial date
    return XLSX.SSF.parse_date_code(value);
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

/**
 * Parse a numeric value
 */
export function parseNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    // Remove currency symbols, commas
    const cleaned = value.replace(/[$,]/g, '').trim();
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Parse a boolean value
 */
export function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (['yes', 'true', '1', 'y', 'x'].includes(lower)) {
      return true;
    }
    if (['no', 'false', '0', 'n', ''].includes(lower)) {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return null;
}
