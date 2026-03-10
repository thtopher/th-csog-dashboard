'use client';

import { FileText, ArrowRight } from 'lucide-react';

export function ContractPerformance() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-12 py-16 text-center max-w-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Contract Performance</h3>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Upload and query contract performance data. Ask questions like &ldquo;How did this
          contract perform last month?&rdquo; or &ldquo;Show all-time performance.&rdquo;
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white">
          Coming Soon
        </div>
        <div className="mt-8 space-y-2 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Planned Features</p>
          <Feature text="Upload contracts and associate with executives" />
          <Feature text="Query contract all-time or period performance" />
          <Feature text="AI-powered contract analysis and insights" />
          <Feature text="Performance comparison across contracts" />
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <ArrowRight size={12} className="text-gray-300 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
