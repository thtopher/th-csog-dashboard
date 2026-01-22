/**
 * Column Mapper
 * Auto-matches uploaded columns to expected schema with confidence scores
 */

import { normalizeHeaderName } from './parser';
import type { ColumnSchema, UploadSchema } from './schemas';

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  confidence: number; // 0-1
  isManual: boolean;
}

export interface MappingResult {
  mappings: ColumnMapping[];
  unmappedSource: string[];
  unmappedTarget: string[];
  overallConfidence: number;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

/**
 * Find the best match for a source column in the target schema
 */
function findBestMatch(
  sourceColumn: string,
  targetColumns: ColumnSchema[]
): { column: ColumnSchema; confidence: number } | null {
  const normalized = normalizeHeaderName(sourceColumn);
  let bestMatch: { column: ColumnSchema; confidence: number } | null = null;

  for (const target of targetColumns) {
    // Exact match with name
    if (normalized === normalizeHeaderName(target.name)) {
      return { column: target, confidence: 1 };
    }

    // Check aliases
    for (const alias of target.aliases) {
      if (normalized === normalizeHeaderName(alias)) {
        return { column: target, confidence: 0.95 };
      }
    }

    // Fuzzy match with name
    const nameSimilarity = calculateSimilarity(normalized, normalizeHeaderName(target.name));
    if (nameSimilarity > 0.7 && (!bestMatch || nameSimilarity > bestMatch.confidence)) {
      bestMatch = { column: target, confidence: nameSimilarity };
    }

    // Fuzzy match with aliases
    for (const alias of target.aliases) {
      const aliasSimilarity = calculateSimilarity(normalized, normalizeHeaderName(alias));
      if (aliasSimilarity > 0.7 && (!bestMatch || aliasSimilarity > bestMatch.confidence)) {
        bestMatch = { column: target, confidence: aliasSimilarity * 0.9 }; // Slightly lower for alias
      }
    }
  }

  return bestMatch;
}

/**
 * Auto-map source columns to target schema
 */
export function autoMapColumns(
  sourceHeaders: string[],
  schema: UploadSchema
): MappingResult {
  const mappings: ColumnMapping[] = [];
  const mappedTargets = new Set<string>();
  const mappedSources = new Set<string>();

  // First pass: find high-confidence matches
  for (const source of sourceHeaders) {
    const match = findBestMatch(source, schema.columns);
    if (match && match.confidence >= 0.8 && !mappedTargets.has(match.column.name)) {
      mappings.push({
        sourceColumn: source,
        targetColumn: match.column.name,
        confidence: match.confidence,
        isManual: false,
      });
      mappedTargets.add(match.column.name);
      mappedSources.add(source);
    }
  }

  // Second pass: lower confidence matches for unmatched columns
  for (const source of sourceHeaders) {
    if (mappedSources.has(source)) continue;

    const match = findBestMatch(source, schema.columns);
    if (match && match.confidence >= 0.5 && !mappedTargets.has(match.column.name)) {
      mappings.push({
        sourceColumn: source,
        targetColumn: match.column.name,
        confidence: match.confidence,
        isManual: false,
      });
      mappedTargets.add(match.column.name);
      mappedSources.add(source);
    }
  }

  // Calculate unmapped
  const unmappedSource = sourceHeaders.filter(h => !mappedSources.has(h));
  const unmappedTarget = schema.columns
    .filter(c => !mappedTargets.has(c.name))
    .map(c => c.name);

  // Calculate overall confidence
  const requiredColumns = schema.columns.filter(c => c.required);
  const mappedRequired = requiredColumns.filter(c => mappedTargets.has(c.name));
  const requiredConfidence = mappedRequired.length / requiredColumns.length;

  const avgMappingConfidence =
    mappings.length > 0
      ? mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length
      : 0;

  const overallConfidence = (requiredConfidence * 0.6 + avgMappingConfidence * 0.4);

  return {
    mappings,
    unmappedSource,
    unmappedTarget,
    overallConfidence,
  };
}

/**
 * Apply column mappings to transform data
 */
export function applyMappings(
  rows: { rowNumber: number; data: Record<string, unknown> }[],
  mappings: ColumnMapping[]
): { rowNumber: number; data: Record<string, unknown> }[] {
  const mappingLookup = new Map(
    mappings.map(m => [m.sourceColumn, m.targetColumn])
  );

  return rows.map(row => ({
    rowNumber: row.rowNumber,
    data: Object.fromEntries(
      Object.entries(row.data)
        .filter(([key]) => mappingLookup.has(key))
        .map(([key, value]) => [mappingLookup.get(key)!, value])
    ),
  }));
}
