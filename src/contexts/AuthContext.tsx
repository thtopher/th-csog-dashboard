'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'csog_member' | 'steward' | 'staff';
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

// Mock users for demo
const MOCK_USERS: Record<string, User & { password: string }> = {
  'cheryl@thirdhorizon.co': {
    id: '1',
    email: 'cheryl@thirdhorizon.co',
    name: 'Cheryl Robinson',
    role: 'csog_member',
    password: 'demo',
  },
  'jordana@thirdhorizon.co': {
    id: '2',
    email: 'jordana@thirdhorizon.co',
    name: 'Jordana Smith',
    role: 'steward',
    password: 'demo',
  },
  'topher@thirdhorizon.co': {
    id: '3',
    email: 'topher@thirdhorizon.co',
    name: 'Topher Rodriguez',
    role: 'admin',
    password: 'demo',
  },
  'demo@thirdhorizon.co': {
    id: '4',
    email: 'demo@thirdhorizon.co',
    name: 'Demo User',
    role: 'csog_member',
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
