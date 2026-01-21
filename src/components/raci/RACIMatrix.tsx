'use client';

import { cn } from '@/lib/utils/cn';
import { CodeTooltip } from '@/components/common/CodeTooltip';
import type { TaskWithRACI } from '@/types';

interface RACIMatrixProps {
  tasks: TaskWithRACI[];
  processCode: string;
  processName: string;
}

export function RACIMatrix({ tasks, processCode, processName }: RACIMatrixProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
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
              <td className="px-4 py-3">
                <CodeTooltip code={task.code}>
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {task.code}
                  </span>
                </CodeTooltip>
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

interface RACILegendProps {
  className?: string;
}

export function RACILegend({ className }: RACILegendProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 text-sm', className)}>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="text-gray-600">
          <strong>A</strong> = Accountable (owns outcome)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-blue-500" />
        <span className="text-gray-600">
          <strong>R</strong> = Responsible (does work)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-amber-500" />
        <span className="text-gray-600">
          <strong>C</strong> = Contributor (provides input)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-gray-400" />
        <span className="text-gray-600">
          <strong>I</strong> = Informed (receives updates)
        </span>
      </div>
    </div>
  );
}
