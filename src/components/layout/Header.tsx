'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Upload, Settings, LogOut, User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

export function Header({ userName = 'User', userRole }: HeaderProps) {
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
            <p className="text-xs text-gray-500 -mt-0.5">CSOG Dashboard</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink href="/" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink href="/upload" icon={Upload}>
            Upload
          </NavLink>
          <NavLink href="/settings" icon={Settings}>
            Settings
          </NavLink>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            {userRole && <p className="text-xs text-gray-500">{userRole}</p>}
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <User size={18} />
          </button>
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
