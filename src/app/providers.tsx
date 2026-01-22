'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { TemporalProvider } from '@/contexts/TemporalContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <TemporalProvider>
          {children}
        </TemporalProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
