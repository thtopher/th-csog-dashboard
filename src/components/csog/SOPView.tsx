'use client';

import { useState, useEffect } from 'react';
import { RACIMatrix } from '@/components/raci/RACIMatrix';
import { CompactRACILegend } from '@/components/raci/CompactRACILegend';
import { DEFAULT_EXECUTIVES } from '@/config/executives';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils/cn';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { ProcessWithTasks } from '@/types';

export function SOPView() {
  const [selectedExecId, setSelectedExecId] = useState<string>('exec-ceo');
  const [processes, setProcesses] = useState<ProcessWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/executives/${selectedExecId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const all = [...(data.processes || []), ...(data.functions || [])];
        setProcesses(all);
      } catch {
        setProcesses([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedExecId]);

  const selectedExec = DEFAULT_EXECUTIVES.find((e) => e.id === selectedExecId);

  return (
    <div className="space-y-6">
      {/* Executive Selector */}
      <div className="flex flex-wrap gap-2">
        {DEFAULT_EXECUTIVES.map((exec) => (
          <button
            key={exec.id}
            onClick={() => {
              setSelectedExecId(exec.id!);
              setExpandedProcess(null);
            }}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              selectedExecId === exec.id
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            <Avatar executiveId={exec.id} name={exec.name} size="xs" />
            <span className="hidden sm:inline">{exec.name?.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Selected Executive Info */}
      {selectedExec && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Avatar executiveId={selectedExec.id} name={selectedExec.name} size="md" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedExec.name}</h3>
              <p className="text-sm text-gray-500">{selectedExec.title}</p>
            </div>
            <div className="ml-auto text-sm text-gray-400">
              {processes.length} process{processes.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>
      )}

      {/* RACI Legend */}
      <CompactRACILegend />

      {/* Process List with Expandable RACI */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : processes.length > 0 ? (
        <div className="space-y-2">
          {processes.map((process) => {
            const isExpanded = expandedProcess === process.id;
            return (
              <div
                key={process.id}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setExpandedProcess(isExpanded ? null : process.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  )}
                  <span className="text-xs font-mono font-medium text-gray-400 w-16 shrink-0">
                    {process.code}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{process.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {process.tasks?.length || 0} tasks
                  </span>
                </button>
                {isExpanded && process.tasks && process.tasks.length > 0 && (
                  <div className="border-t px-4 py-4 bg-gray-50">
                    <RACIMatrix
                      tasks={process.tasks}
                      processCode={process.code || ''}
                      processName={process.name}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-400">No processes found for this executive.</p>
        </div>
      )}
    </div>
  );
}
