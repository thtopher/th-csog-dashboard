'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'csog_member' | 'steward' | 'staff';
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

// Mock users for demo - includes all 7 executives plus admin
const MOCK_USERS: Record<string, User & { password: string }> = {
  // Executives
  'david@thirdhorizon.com': {
    id: 'user-ceo',
    email: 'david@thirdhorizon.com',
    name: 'David Smith',
    role: 'admin',
    executiveId: 'exec-ceo',
    title: 'CEO',
    password: 'demo',
  },
  'greg@thirdhorizon.com': {
    id: 'user-president',
    email: 'greg@thirdhorizon.com',
    name: 'Greg Williams',
    role: 'csog_member',
    executiveId: 'exec-president',
    title: 'President',
    password: 'demo',
  },
  'jordana@thirdhorizon.com': {
    id: 'user-coo',
    email: 'jordana@thirdhorizon.com',
    name: 'Jordana Choucair',
    role: 'csog_member',
    executiveId: 'exec-coo',
    title: 'COO',
    password: 'demo',
  },
  'aisha@thirdhorizon.com': {
    id: 'user-cfo',
    email: 'aisha@thirdhorizon.com',
    name: 'Aisha Waheed',
    role: 'csog_member',
    executiveId: 'exec-cfo',
    title: 'CFO',
    password: 'demo',
  },
  'chris@thirdhorizon.com': {
    id: 'user-cdao',
    email: 'chris@thirdhorizon.com',
    name: 'Chris Hart',
    role: 'csog_member',
    executiveId: 'exec-cdao',
    title: 'CDAO',
    password: 'demo',
  },
  'cheryl@thirdhorizon.com': {
    id: 'user-cgo',
    email: 'cheryl@thirdhorizon.com',
    name: 'Cheryl Matochik',
    role: 'csog_member',
    executiveId: 'exec-cgo',
    title: 'CGO',
    password: 'demo',
  },
  'ashley@thirdhorizon.com': {
    id: 'user-cso',
    email: 'ashley@thirdhorizon.com',
    name: 'Ashley DeGarmo',
    role: 'csog_member',
    executiveId: 'exec-cso',
    title: 'CSO',
    password: 'demo',
  },
  // Admin user (non-executive)
  'topher@thirdhorizon.com': {
    id: 'user-admin',
    email: 'topher@thirdhorizon.com',
    name: 'Topher Rasmussen',
    role: 'admin',
    title: 'System Administrator',
    password: 'demo',
  },
  // Demo user
  'demo@thirdhorizon.com': {
    id: 'user-demo',
    email: 'demo@thirdhorizon.com',
    name: 'Demo User',
    role: 'staff',
    password: 'demo',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(false);
  const router = useRouter();

  // Check for existing demo session on mount
  useEffect(() => {
    if (IS_DEMO_MODE) {
      const stored = localStorage.getItem('th_dashboard_user');
      if (stored) {
        try {
          setDemoUser(JSON.parse(stored));
          setIsUsingDemo(true);
        } catch {
          localStorage.removeItem('th_dashboard_user');
        }
      }
    }
  }, []);

  // Derive user from session or demo mode
  const user: User | null = (() => {
    // If using demo mode with local user
    if (isUsingDemo && demoUser) {
      return demoUser;
    }

    // If using NextAuth session
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user.role as User['role']) || 'staff',
        executiveId: session.user.executiveId,
        title: session.user.title,
        avatar: session.user.image,
      };
    }

    return null;
  })();

  const isLoading = status === 'loading' && !isUsingDemo;
  const isAuthenticated = !!user;

  // Demo login function
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // In demo mode, use local auth
    if (IS_DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const normalizedEmail = email.toLowerCase().trim();
      const mockUser = MOCK_USERS[normalizedEmail];

      if (!mockUser) {
        return { success: false, error: 'No account found with this email' };
      }

      if (mockUser.password !== password) {
        return { success: false, error: 'Incorrect password' };
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = mockUser;
      setDemoUser(userWithoutPassword);
      setIsUsingDemo(true);
      localStorage.setItem('th_dashboard_user', JSON.stringify(userWithoutPassword));

      return { success: true };
    }

    // In production mode, use NextAuth credentials provider
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
    if (isUsingDemo) {
      setDemoUser(null);
      setIsUsingDemo(false);
      localStorage.removeItem('th_dashboard_user');
      router.push('/login');
    } else {
      nextAuthSignOut({ callbackUrl: '/login' });
    }
  }, [isUsingDemo, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithMicrosoft,
        logout,
        isAuthenticated,
        isDemoMode: IS_DEMO_MODE || isUsingDemo,
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
