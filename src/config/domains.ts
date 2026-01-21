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
 * Status colors
 */
export const STATUS_COLORS = {
  healthy: '#16a34a',
  warning: '#d97706',
  critical: '#dc2626',
  neutral: '#6b7280',
} as const;

/**
 * Time window options for global filter
 */
export const TIME_WINDOWS = [
  { value: 'week', label: 'This Week', periodsBack: 1 },
  { value: 'month', label: 'This Month', periodsBack: 4 },
  { value: 'quarter', label: 'This Quarter', periodsBack: 13 },
  { value: 'ytd', label: 'Year to Date', periodsBack: 52 },
] as const;
