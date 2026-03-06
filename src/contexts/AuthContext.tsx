'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'csog_member' | 'staff';
  executiveId?: string;
  title?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we're in demo mode (no Azure AD configured)
const IS_DEMO_MODE = !process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // Derive user from NextAuth session
  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user.role as User['role']) || 'staff',
    executiveId: session.user.executiveId,
    title: session.user.title,
    avatar: session.user.image,
  } : null;

  const isLoading = status === 'loading';
  const isAuthenticated = !!user;

  // Login always goes through NextAuth credentials provider
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await nextAuthSignIn('demo-login', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: 'Invalid credentials' };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  }, []);

  // Microsoft SSO login
  const loginWithMicrosoft = useCallback(async () => {
    await nextAuthSignIn('microsoft-entra-id', { callbackUrl: '/' });
  }, []);

  // Logout function
  const logout = useCallback(() => {
    nextAuthSignOut({ callbackUrl: '/login' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithMicrosoft,
        logout,
        isAuthenticated,
        isDemoMode: IS_DEMO_MODE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
