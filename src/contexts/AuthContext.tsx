'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    name: 'Topher Rodriguez',
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('th_dashboard_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('th_dashboard_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
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
    setUser(userWithoutPassword);
    localStorage.setItem('th_dashboard_user', JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('th_dashboard_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
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
