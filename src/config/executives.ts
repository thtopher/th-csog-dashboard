import type { Executive } from '@/types';

/**
 * Executive-specific color palette
 * Colors are coordinated with Third Horizon brand
 */
export const EXECUTIVE_COLORS: Record<string, string> = {
  'exec-ceo': '#1a1a1a',      // Black - CEO
  'exec-president': '#2563eb', // Blue - President
  'exec-coo': '#ea580c',      // Orange - COO
  'exec-cfo': '#dc2626',      // Red - CFO
  'exec-cdao': '#7c3aed',     // Purple - CDAO
  'exec-cgo': '#059669',      // Green - CGO
  'exec-cso': '#0891b2',      // Cyan - CSO
} as const;

/**
 * Executive initials for avatars
 */
export const EXECUTIVE_INITIALS: Record<string, string> = {
  'exec-ceo': 'DS',
  'exec-president': 'GW',
  'exec-coo': 'JC',
  'exec-cfo': 'AW',
  'exec-cdao': 'CH',
  'exec-cgo': 'CM',
  'exec-cso': 'AD',
} as const;

/**
 * Default executive configuration
 * Used for seeding and as fallback when DB is not available
 */
export const DEFAULT_EXECUTIVES: Partial<Executive>[] = [
  {
    id: 'exec-ceo',
    name: 'David Smith',
    title: 'CEO',
    role: 'Business Oversight',
    email: 'david@thirdhorizon.com',
    displayOrder: 1,
  },
  {
    id: 'exec-president',
    name: 'Greg Williams',
    title: 'President',
    role: 'Client Operations',
    email: 'greg@thirdhorizon.com',
    displayOrder: 2,
  },
  {
    id: 'exec-coo',
    name: 'Jordana Choucair',
    title: 'COO',
    role: 'Business Operations',
    email: 'jordana@thirdhorizon.com',
    displayOrder: 3,
  },
  {
    id: 'exec-cfo',
    name: 'Aisha Waheed',
    title: 'CFO',
    role: 'Finance',
    email: 'aisha@thirdhorizon.com',
    displayOrder: 4,
  },
  {
    id: 'exec-cdao',
    name: 'Chris Hart',
    title: 'CDAO',
    role: 'Data Systems & IT',
    email: 'chris@thirdhorizon.com',
    displayOrder: 5,
  },
  {
    id: 'exec-cgo',
    name: 'Cheryl Matochik',
    title: 'CGO',
    role: 'Growth',
    email: 'cheryl@thirdhorizon.com',
    displayOrder: 6,
  },
  {
    id: 'exec-cso',
    name: 'Ashley DeGarmo',
    title: 'CSO',
    role: 'Client Engagement',
    email: 'ashley@thirdhorizon.com',
    displayOrder: 7,
  },
];

/**
 * Get executive by ID
 */
export function getExecutiveById(id: string): Partial<Executive> | undefined {
  return DEFAULT_EXECUTIVES.find(exec => exec.id === id);
}

/**
 * Get executive color by ID
 */
export function getExecutiveColor(id: string): string {
  return EXECUTIVE_COLORS[id] || '#6b7280';
}

/**
 * Get executive initials by ID
 */
export function getExecutiveInitials(id: string): string {
  return EXECUTIVE_INITIALS[id] || '??';
}

/**
 * CEO Scorecard metric categories per F-EOC6
 */
export const CEO_SCORECARD_CATEGORIES = [
  {
    id: 'pipeline',
    name: 'Pipeline Health',
    description: 'Business development pipeline value and win rates',
    sourceProcess: 'BD',
    sourceExecutive: 'exec-cgo',
  },
  {
    id: 'delivery',
    name: 'Delivery Health',
    description: 'On-time delivery rates and client satisfaction',
    sourceProcess: 'SD',
    sourceExecutive: 'exec-cso',
  },
  {
    id: 'margin',
    name: 'Margin',
    description: 'Contract margin and profitability',
    sourceProcess: 'CP',
    sourceExecutive: 'exec-cso',
  },
  {
    id: 'cash',
    name: 'Cash',
    description: 'Cash position, DSO, and receivables health',
    sourceProcess: 'CF',
    sourceExecutive: 'exec-president',
  },
  {
    id: 'staffing',
    name: 'Staffing Capacity',
    description: 'Billable utilization and open positions',
    sourceProcess: 'ST',
    sourceExecutive: 'exec-coo',
  },
  {
    id: 'strategic',
    name: 'Strategic Initiatives',
    description: 'Progress on strategic priorities',
    sourceProcess: 'F-SP',
    sourceExecutive: 'exec-ceo',
  },
] as const;
