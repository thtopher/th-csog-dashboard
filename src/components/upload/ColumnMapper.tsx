'use client';

import { useState } from 'react';
import type { ColumnMapping } from '@/lib/upload/mapper';
import type { UploadSchema } from '@/lib/upload/schemas';
import { ArrowRight, Check, AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ColumnMapperProps {
  sourceHeaders: string[];
  schema: UploadSchema;
  mappings: ColumnMapping[];
  onMappingChange: (mappings: ColumnMapping[]) => void;
}

export function ColumnMapper({
  sourceHeaders,
  schema,
  mappings,
  onMappingChange,
}: ColumnMapperProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getMappingForTarget = (targetColumn: string) =>
    mappings.find(m => m.targetColumn === targetColumn);

  const getUnmappedSources = () =>
    sourceHeaders.filter(h => !mappings.some(m => m.sourceColumn === h));

  const handleMapColumn = (targetColumn: string, sourceColumn: string) => {
    // Remove any existing mapping for this target
    const newMappings = mappings.filter(m => m.targetColumn !== targetColumn);

    // Also remove any mapping that was using this source column
    const cleaned = newMappings.filter(m => m.sourceColumn !== sourceColumn);

    // Add new mapping
    cleaned.push({
      sourceColumn,
      targetColumn,
      confidence: 1, // Manual mapping
      isManual: true,
    });

    onMappingChange(cleaned);
    setExpandedRow(null);
  };

  const handleUnmap = (targetColumn: string) => {
    const newMappings = mappings.filter(m => m.targetColumn !== targetColumn);
    onMappingChange(newMappings);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Column Mapping</h3>
        <p className="text-sm text-gray-500">
          {mappings.length} of {schema.columns.length} columns mapped
        </p>
      </div>

      <div className="border rounded-lg divide-y">
        {schema.columns.map(column => {
          const mapping = getMappingForTarget(column.name);
          const isExpanded = expandedRow === column.name;

          return (
            <div key={column.name} className="p-4">
              <div className="flex items-center justify-between">
                {/* Target Column */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      column.required ? 'bg-red-500' : 'bg-gray-300'
                    )}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{column.name}</p>
                    <p className="text-xs text-gray-500">
                      {column.type} {column.required && '(required)'}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight size={16} className="text-gray-400 mx-4" />

                {/* Source Column / Mapping */}
                <div className="flex-1">
                  {mapping ? (
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                          mapping.confidence >= 0.9
                            ? 'bg-green-100 text-green-800'
                            : mapping.confidence >= 0.7
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        )}
                      >
                        {mapping.confidence >= 0.9 && <Check size={14} />}
                        {mapping.confidence < 0.7 && <AlertTriangle size={14} />}
                        <span className="font-medium">{mapping.sourceColumn}</span>
                        <span className="text-xs opacity-75">
                          {Math.round(mapping.confidence * 100)}%
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : column.name)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown
                          size={16}
                          className={cn(
                            'transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedRow(isExpanded ? null : column.name)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm border-2 border-dashed transition-colors',
                        column.required
                          ? 'border-red-300 text-red-600 hover:bg-red-50'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {column.required ? 'Select column (required)' : 'Select column (optional)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded selection */}
              {isExpanded && (
                <div className="mt-3 ml-[240px] p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">
                    Select a column from your file:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mapping && (
                      <button
                        onClick={() => handleUnmap(column.name)}
                        className="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-100 border border-red-200"
                      >
                        Clear mapping
                      </button>
                    )}
                    {getUnmappedSources().map(source => (
                      <button
                        key={source}
                        onClick={() => handleMapColumn(column.name, source)}
                        className="px-3 py-1 rounded text-sm bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        {source}
                      </button>
                    ))}
                    {/* Also show already-mapped sources for re-mapping */}
                    {sourceHeaders
                      .filter(h => !getUnmappedSources().includes(h) && h !== mapping?.sourceColumn)
                      .map(source => (
                        <button
                          key={source}
                          onClick={() => handleMapColumn(column.name, source)}
                          className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Currently mapped to another column"
                        >
                          {source}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unmapped Source Columns */}
      {getUnmappedSources().length > 0 && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Unmapped columns in your file:
          </p>
          <div className="flex flex-wrap gap-2">
            {getUnmappedSources().map(source => (
              <span
                key={source}
                className="px-2 py-1 bg-white rounded text-sm text-amber-700 border border-amber-200"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
