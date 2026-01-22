'use client';

import { cn } from '@/lib/utils/cn';
import { DataSourceBadges } from '@/components/common/DataSourceBadge';
import { CompactRACILegend } from './CompactRACILegend';
import { getDataSourcesForProcess } from '@/lib/utils/dataSourceMapping';
import type { TaskWithRACI } from '@/types';

interface RACIMatrixProps {
  tasks: TaskWithRACI[];
  processCode: string;
  processName: string;
}

export function RACIMatrix({ tasks, processCode, processName }: RACIMatrixProps) {
  const dataSources = getDataSourcesForProcess(processCode);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <CompactRACILegend className="mb-0" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Data from:</span>
          <DataSourceBadges sources={dataSources} size="sm" />
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Task
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Accountable
              </span>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Responsible
              </span>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Contributors
              </span>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                Informed
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {task.code}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
                {task.description}
              </td>
              <td className="px-4 py-3 text-center">
                <RACIBadge role="A" person={task.accountable} />
              </td>
              <td className="px-4 py-3 text-center">
                <RACIBadge role="R" person={task.responsible} />
              </td>
              <td className="px-4 py-3 text-center">
                {task.contributors && task.contributors.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-1">
                    {task.contributors.map((c, i) => (
                      <RACIBadge key={i} role="C" person={c} />
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {task.informed && task.informed.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-1">
                    {task.informed.map((inf, i) => (
                      <RACIBadge key={i} role="I" person={inf} />
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RACIBadgeProps {
  role: 'A' | 'R' | 'C' | 'I';
  person?: string;
}

function RACIBadge({ role, person }: RACIBadgeProps) {
  if (!person) return <span className="text-gray-300">—</span>;

  const colors = {
    A: 'bg-red-100 text-red-700 border-red-200',
    R: 'bg-blue-100 text-blue-700 border-blue-200',
    C: 'bg-amber-100 text-amber-700 border-amber-200',
    I: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', colors[role])}>
      {person}
    </span>
  );
}

