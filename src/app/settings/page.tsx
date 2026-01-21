'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils/cn';
import {
  Users,
  Bell,
  Palette,
  Link as LinkIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import type { UserRole } from '@/types';

const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: LinkIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const MOCK_USERS = [
  { id: '1', name: 'Cheryl Robinson', email: 'cheryl@thirdhorizon.co', role: 'csog_member' as UserRole, lastLogin: '2024-12-29' },
  { id: '2', name: 'Jordana Smith', email: 'jordana@thirdhorizon.co', role: 'steward' as UserRole, lastLogin: '2024-12-29' },
  { id: '3', name: 'Topher Rodriguez', email: 'topher@thirdhorizon.co', role: 'admin' as UserRole, lastLogin: '2024-12-29' },
  { id: '4', name: 'Alex Chen', email: 'alex@thirdhorizon.co', role: 'staff' as UserRole, lastLogin: '2024-12-27' },
];

const MOCK_INTEGRATIONS = [
  { id: 'netsuite', name: 'NetSuite', description: 'Financial data and project accounting', status: 'not_configured', icon: '📊' },
  { id: 'notion', name: 'Notion', description: 'BD pipeline and opportunity tracking', status: 'not_configured', icon: '📝' },
  { id: 'harvest', name: 'Harvest', description: 'Time tracking (via Excel export)', status: 'configured', icon: '⏱️' },
  { id: 'slack', name: 'Slack', description: 'Notifications and alerts', status: 'not_configured', icon: '💬' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Settings' }]} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">
            Manage dashboard configuration and user access
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-56 flex-shrink-0">
            <ul className="space-y-1">
              {TABS.map(tab => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'users' && <UsersSettings />}
            {activeTab === 'integrations' && <IntegrationsSettings />}
            {activeTab === 'notifications' && <NotificationsSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
          </div>
        </div>
      </main>
    </div>
  );
}

function UsersSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Manage user access and roles</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_USERS.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600 mr-3">
                    <Edit2 size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border bg-gray-50 p-4">
        <h3 className="font-medium text-gray-900 mb-2">Role Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <RoleBadge role="admin" />
            <span className="text-gray-600">Full access to all features and settings</span>
          </div>
          <div className="flex items-start gap-2">
            <RoleBadge role="csog_member" />
            <span className="text-gray-600">View all domains and individual-level data</span>
          </div>
          <div className="flex items-start gap-2">
            <RoleBadge role="steward" />
            <span className="text-gray-600">Manage assigned domains only</span>
          </div>
          <div className="flex items-start gap-2">
            <RoleBadge role="staff" />
            <span className="text-gray-600">View aggregated metrics only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-500">Connect external data sources</p>
      </div>

      <div className="space-y-4">
        {MOCK_INTEGRATIONS.map(integration => (
          <div key={integration.id} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {integration.status === 'configured' ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      <Check size={14} />
                      Connected
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      Configure
                    </button>
                  </>
                ) : (
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-gray-600 mb-2">Need a different integration?</p>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
          Request a new integration →
        </a>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [thresholdAlerts, setThresholdAlerts] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500">Configure alerts and notification preferences</p>
      </div>

      <div className="rounded-lg border bg-white divide-y shadow-sm">
        <div className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-medium text-gray-900">Email Alerts</h3>
            <p className="text-sm text-gray-500">Receive email notifications for critical KPI changes</p>
          </div>
          <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
        </div>

        <div className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-medium text-gray-900">Weekly Digest</h3>
            <p className="text-sm text-gray-500">Receive a weekly summary email every Monday</p>
          </div>
          <Toggle enabled={weeklyDigest} onChange={setWeeklyDigest} />
        </div>

        <div className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-medium text-gray-900">Threshold Alerts</h3>
            <p className="text-sm text-gray-500">Get notified when KPIs cross warning or critical thresholds</p>
          </div>
          <Toggle enabled={thresholdAlerts} onChange={setThresholdAlerts} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Alert Recipients</h3>
        <p className="text-sm text-gray-500 mb-4">
          Alerts are sent to users based on their role and stewarded domains.
        </p>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Manage alert recipients →
        </button>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
        <p className="text-sm text-gray-500">Customize the dashboard look and feel</p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Brand Colors</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-2 block">Primary</label>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-gray-900" />
              <input type="text" value="#1a1a1a" readOnly className="text-sm text-gray-600 border rounded px-2 py-1 w-24" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-2 block">Accent</label>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-blue-600" />
              <input type="text" value="#2563eb" readOnly className="text-sm text-gray-600 border rounded px-2 py-1 w-24" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-2 block">Background</label>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-gray-50 border" />
              <input type="text" value="#fafafa" readOnly className="text-sm text-gray-600 border rounded px-2 py-1 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Logo</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-2xl font-bold text-white">TH</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current: Text logo "TH"</p>
            <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
              Upload custom logo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const config: Record<UserRole, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
    csog_member: { label: 'CSOG', className: 'bg-blue-100 text-blue-700' },
    steward: { label: 'Steward', className: 'bg-green-100 text-green-700' },
    staff: { label: 'Staff', className: 'bg-gray-100 text-gray-700' },
    viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-600' },
  };
  const { label, className } = config[role];

  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}
