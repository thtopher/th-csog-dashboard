/**
 * Upload Validator
 * Type-specific validation rules for uploaded data
 */

import { parseExcelDate, parseNumber, parseBoolean } from './parser';
import type { ColumnSchema, UploadSchema } from './schemas';

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  validRowCount: number;
  invalidRowCount: number;
}

/**
 * Validate a single cell value against its schema
 */
function validateCell(
  value: unknown,
  schema: ColumnSchema,
  rowNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required
  if (schema.required && (value === undefined || value === null || value === '')) {
    errors.push({
      row: rowNumber,
      column: schema.name,
      message: `${schema.name} is required`,
      severity: 'error',
      value,
    });
    return errors;
  }

  // Skip validation for empty optional fields
  if (value === undefined || value === null || value === '') {
    return errors;
  }

  // Type-specific validation
  switch (schema.type) {
    case 'number': {
      const numValue = parseNumber(value);
      if (numValue === null) {
        errors.push({
          row: rowNumber,
          column: schema.name,
          message: `${schema.name} must be a number`,
          severity: 'error',
          value,
        });
      } else {
        if (schema.min !== undefined && numValue < schema.min) {
          errors.push({
            row: rowNumber,
            column: schema.name,
            message: `${schema.name} must be at least ${schema.min}`,
            severity: schema.required ? 'error' : 'warning',
            value,
          });
        }
        if (schema.max !== undefined && numValue > schema.max) {
          errors.push({
            row: rowNumber,
            column: schema.name,
            message: `${schema.name} must be at most ${schema.max}`,
            severity: schema.required ? 'error' : 'warning',
            value,
          });
        }
      }
      break;
    }

    case 'date': {
      const dateValue = parseExcelDate(value);
      if (dateValue === null) {
        errors.push({
          row: rowNumber,
          column: schema.name,
          message: `${schema.name} must be a valid date`,
          severity: 'error',
          value,
        });
      }
      break;
    }

    case 'boolean': {
      const boolValue = parseBoolean(value);
      if (boolValue === null) {
        errors.push({
          row: rowNumber,
          column: schema.name,
          message: `${schema.name} must be a boolean (yes/no, true/false)`,
          severity: 'error',
          value,
        });
      }
      break;
    }

    case 'email': {
      const strValue = String(value);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(strValue)) {
        errors.push({
          row: rowNumber,
          column: schema.name,
          message: `${schema.name} must be a valid email address`,
          severity: 'error',
          value,
        });
      }
      break;
    }

    case 'string': {
      if (schema.pattern) {
        const strValue = String(value);
        if (!schema.pattern.test(strValue)) {
          errors.push({
            row: rowNumber,
            column: schema.name,
            message: `${schema.name} has an invalid format`,
            severity: 'warning',
            value,
          });
        }
      }
      break;
    }
  }

  return errors;
}

/**
 * Validate an entire dataset against a schema
 */
export function validateData(
  rows: { rowNumber: number; data: Record<string, unknown> }[],
  schema: UploadSchema
): ValidationResult {
  const allErrors: ValidationError[] = [];
  let invalidRowCount = 0;

  for (const row of rows) {
    let rowHasError = false;

    for (const columnSchema of schema.columns) {
      const value = row.data[columnSchema.name];
      const cellErrors = validateCell(value, columnSchema, row.rowNumber);

      for (const error of cellErrors) {
        allErrors.push(error);
        if (error.severity === 'error') {
          rowHasError = true;
        }
      }
    }

    if (rowHasError) {
      invalidRowCount++;
    }
  }

  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validRowCount: rows.length - invalidRowCount,
    invalidRowCount,
  };
}

/**
 * Quick validation check for preview
 */
export function quickValidate(
  rows: { rowNumber: number; data: Record<string, unknown> }[],
  schema: UploadSchema,
  sampleSize: number = 10
): {
  hasErrors: boolean;
  errorCount: number;
  warningCount: number;
  sampleErrors: ValidationError[];
} {
  const sampleRows = rows.slice(0, sampleSize);
  const result = validateData(sampleRows, schema);

  return {
    hasErrors: !result.isValid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    sampleErrors: [...result.errors, ...result.warnings].slice(0, 5),
  };
}

/**
 * Type-specific business rule validation
 */
export function validateBusinessRules(
  rows: { rowNumber: number; data: Record<string, unknown> }[],
  uploadTypeId: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (uploadTypeId) {
    case 'excel_harvest':
      // Check for unrealistic hours
      for (const row of rows) {
        const hours = parseNumber(row.data.hours_logged);
        if (hours !== null && hours > 60) {
          errors.push({
            row: row.rowNumber,
            column: 'hours_logged',
            message: `Unusually high hours (${hours}) - please verify`,
            severity: 'warning',
            value: hours,
          });
        }
      }
      break;

    case 'excel_ar':
      // Check for very old receivables
      for (const row of rows) {
        const days = parseNumber(row.data.days_outstanding);
        if (days !== null && days > 180) {
          errors.push({
            row: row.rowNumber,
            column: 'days_outstanding',
            message: `Receivable over 180 days old - may need review`,
            severity: 'warning',
            value: days,
          });
        }
      }
      break;

    case 'excel_pipeline':
      // Check for high-value opportunities with low probability
      for (const row of rows) {
        const value = parseNumber(row.data.value);
        const prob = parseNumber(row.data.probability);
        if (value !== null && prob !== null && value > 500000 && prob < 25) {
          errors.push({
            row: row.rowNumber,
            column: 'probability',
            message: `High-value opportunity with low probability - verify forecast`,
            severity: 'warning',
            value: { value, probability: prob },
          });
        }
      }
      break;
  }

  return errors;
}
