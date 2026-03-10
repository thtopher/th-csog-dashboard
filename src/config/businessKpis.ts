// Business KPI definitions and initial data
// These 5 KPIs are the first to go live, with manual data entry

export type KPICategory = 'growth' | 'ops' | 'client_success' | 'finance';

export interface BusinessKPI {
  id: string;
  name: string;
  category: KPICategory;
  unit: 'number' | 'currency' | 'percent';
  description: string;
  target?: number;
  currentValue?: number;
  direction: 'higher_better' | 'lower_better';
}

export interface KPISnapshot {
  kpiId: string;
  date: string;      // ISO date string
  value: number;
  note?: string;
}

export const KPI_CATEGORIES: { id: KPICategory; label: string; color: string }[] = [
  { id: 'growth', label: 'Growth', color: '#2d8a4e' },
  { id: 'ops', label: 'Ops', color: '#e07c24' },
  { id: 'client_success', label: 'Client Success', color: '#0891b2' },
  { id: 'finance', label: 'Finance', color: '#6366f1' },
];

export const BUSINESS_KPIS: BusinessKPI[] = [
  // Growth
  {
    id: 'pipeline-total',
    name: 'Pipeline Total',
    category: 'growth',
    unit: 'currency',
    description: 'Total value of all active pipeline opportunities',
    direction: 'higher_better',
  },
  {
    id: 'pipeline-weighted',
    name: 'Pipeline Weighted',
    category: 'growth',
    unit: 'currency',
    description: 'Probability-weighted pipeline value',
    direction: 'higher_better',
  },

  // Ops
  {
    id: 'harvest-compliance',
    name: 'Harvest Compliance',
    category: 'ops',
    unit: 'percent',
    description: 'Percentage of team members with compliant Harvest time entries',
    target: 95,
    direction: 'higher_better',
  },
  {
    id: 'training-compliance',
    name: 'Training Compliance',
    category: 'ops',
    unit: 'percent',
    description: 'Percentage of team members current on required training',
    target: 100,
    direction: 'higher_better',
  },

  // Finance
  {
    id: 'six-month-cash-projection',
    name: '6-Month Cash Projection',
    category: 'finance',
    unit: 'currency',
    description: 'Projected cash position 6 months forward',
    direction: 'higher_better',
  },
];

// Local storage key for KPI snapshots (until Supabase table is ready)
export const KPI_STORAGE_KEY = 'th-csog-kpi-snapshots';
