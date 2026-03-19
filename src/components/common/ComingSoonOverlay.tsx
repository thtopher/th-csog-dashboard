'use client';

import { Construction } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonOverlayProps {
  title: string;
  children: React.ReactNode;
}

export function ComingSoonOverlay({ title, children }: ComingSoonOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred content underneath */}
      <div className="pointer-events-none select-none blur-[2px] opacity-40">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-32 z-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-8 py-6 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Construction size={24} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Coming Soon</h2>
          <p className="text-sm text-gray-500 mb-4">
            {title} is under development and will be available in a future release.
          </p>
          <Link
            href="/csog"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
          >
            Go to CSOG Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
