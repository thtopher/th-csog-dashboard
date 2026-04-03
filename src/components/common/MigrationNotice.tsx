'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowUpRight, Construction } from 'lucide-react';

const STORAGE_KEY = 'th-migration-notice-dismissed';
const TOOLS_URL = 'https://th-tools-puce.vercel.app/';

export function MigrationNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleDismiss();
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white shadow-xl focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-100 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Construction size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Dashboard Migration
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  Important update for CSOG members
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              The CSOG Dashboard is being migrated to <strong>Third Horizon Tools</strong>, a new
              unified platform currently in development. This dashboard will continue to operate
              during the transition, but all future features and updates will be built on the new
              platform.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              CSOG members who wish to preview the new platform and sign up for early access can
              visit the development site below.
            </p>

            {/* Link Card */}
            <a
              href={TOOLS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 hover:border-gray-300 hover:bg-gray-100 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Third Horizon Tools</p>
                <p className="text-xs text-gray-500">Development preview</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </a>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-100 px-6 py-4">
            <button
              onClick={handleDismiss}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Small button for the Header to reopen the notice */
export function MigrationNoticeButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
          title="View migration notice"
        >
          <Construction size={14} />
          <span className="hidden sm:inline">Migration</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white shadow-xl focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-100 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Construction size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Dashboard Migration
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  Important update for CSOG members
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              The CSOG Dashboard is being migrated to <strong>Third Horizon Tools</strong>, a new
              unified platform currently in development. This dashboard will continue to operate
              during the transition, but all future features and updates will be built on the new
              platform.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              CSOG members who wish to preview the new platform and sign up for early access can
              visit the development site below.
            </p>

            {/* Link Card */}
            <a
              href={TOOLS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 hover:border-gray-300 hover:bg-gray-100 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Third Horizon Tools</p>
                <p className="text-xs text-gray-500">Development preview</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </a>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-100 px-6 py-4">
            <Dialog.Close asChild>
              <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                Got it
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
