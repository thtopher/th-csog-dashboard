import type { OperationalDomain } from '@/types';

/**
 * Third Horizon brand colors
 */
export const BRAND_COLORS = {
  primary: '#1a1a1a',
  secondary: '#4a4a4a',
  accent: '#2563eb',
  background: '#fafafa',
  surface: '#ffffff',
  border: '#e5e5e5',
} as const;

/**
 * Domain color palette - coordinated with TH brand
 */
export const DOMAIN_COLORS: Record<string, string> = {
  growth: '#2563eb',      // Blue
  delivery: '#059669',    // Green
  closure: '#7c3aed',     // Purple
  finance: '#dc2626',     // Red
  ops: '#ea580c',         // Orange
  board: '#0891b2',       // Cyan
} as const;

/**
 * Status colors
 */
export const STATUS_COLORS = {
  healthy: '#16a34a',
  warning: '#d97706',
  critical: '#dc2626',
  neutral: '#6b7280',
} as const;

/**
 * Default domain configuration
 * Used for seeding and as fallback when DB is not available
 */
export const DEFAULT_DOMAINS: Partial<OperationalDomain>[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    name: 'Growth (BD)',
    shortName: 'Growth',
    stewardName: 'Cheryl',
    colorHex: DOMAIN_COLORS.growth,
    iconName: 'trending-up',
    displayOrder: 1,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    name: 'Service Delivery',
    shortName: 'Delivery',
    colorHex: DOMAIN_COLORS.delivery,
    iconName: 'briefcase',
    displayOrder: 2,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000003',
    name: 'Contract Closure',
    shortName: 'Closure',
    colorHex: DOMAIN_COLORS.closure,
    iconName: 'check-circle',
    displayOrder: 3,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000004',
    name: 'Finance',
    shortName: 'Finance',
    colorHex: DOMAIN_COLORS.finance,
    iconName: 'dollar-sign',
    displayOrder: 4,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000005',
    name: 'Internal Operations',
    shortName: 'Ops',
    stewardName: 'Jordana',
    colorHex: DOMAIN_COLORS.ops,
    iconName: 'settings',
    displayOrder: 5,
  },
  {
    id: 'd1000000-0000-0000-0000-000000000006',
    name: 'Board & CSOG',
    shortName: 'Board',
    colorHex: DOMAIN_COLORS.board,
    iconName: 'users',
    displayOrder: 6,
  },
];

/**
 * Time window options for global filter
 */
export const TIME_WINDOWS = [
  { value: 'week', label: 'This Week', periodsBack: 1 },
  { value: 'month', label: 'This Month', periodsBack: 4 },
  { value: 'quarter', label: 'This Quarter', periodsBack: 13 },
  { value: 'ytd', label: 'Year to Date', periodsBack: 52 },
] as const;
