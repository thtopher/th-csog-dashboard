'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_EXECUTIVES, EXECUTIVE_COLORS, EXECUTIVE_INITIALS } from '@/config/executives';
import {
  LayoutDashboard,
  Upload,
  Settings,
  LogOut,
  ChevronDown,
  Users,
  Crown,
  Briefcase,
  Building,
  DollarSign,
  Database,
  TrendingUp,
  Handshake,
} from 'lucide-react';

// Map executive IDs to appropriate icons
const EXECUTIVE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'exec-ceo': Crown,
  'exec-president': Briefcase,
  'exec-coo': Building,
  'exec-cfo': DollarSign,
  'exec-cdao': Database,
  'exec-cgo': TrendingUp,
  'exec-cso': Handshake,
};

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExecMenu, setShowExecMenu] = useState(false);

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    csog_member: 'CSOG Member',
    steward: 'Steward',
    staff: 'Staff',
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-lg font-bold text-white">TH</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900">Third Horizon</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Executive Dashboard</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink href="/" icon={LayoutDashboard} isActive={pathname === '/'}>
            CEO Scorecard
          </NavLink>

          {/* Executives Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExecMenu(!showExecMenu)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/executive')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Users size={16} />
              <span className="hidden sm:inline">Executives</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showExecMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExecMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-72 rounded-lg border bg-white shadow-lg z-20">
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Executive Domains
                    </p>
                    {DEFAULT_EXECUTIVES.map((exec) => {
                      const Icon = EXECUTIVE_ICONS[exec.id!] || Users;
                      const color = EXECUTIVE_COLORS[exec.id!] || '#6b7280';
                      return (
                        <Link
                          key={exec.id}
                          href={`/executive/${exec.id}`}
                          onClick={() => setShowExecMenu(false)}
                          className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-medium"
                            style={{ backgroundColor: color }}
                          >
                            {EXECUTIVE_INITIALS[exec.id!]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{exec.name}</p>
                            <p className="text-xs text-gray-500">
                              {exec.title} &middot; {exec.role}
                            </p>
                          </div>
                          <Icon size={14} className="text-gray-400" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <NavLink href="/upload" icon={Upload} isActive={pathname === '/upload'}>
            Upload
          </NavLink>
          <NavLink href="/settings" icon={Settings} isActive={pathname.startsWith('/settings')}>
            Settings
          </NavLink>
        </nav>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role ? roleLabels[user.role] : ''}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white font-medium">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg z-20">
                <div className="p-3 border-b">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, icon: Icon, children, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}
