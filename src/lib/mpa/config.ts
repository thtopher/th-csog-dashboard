/**
 * MPA Configuration
 *
 * Category mappings and P&L account tagging rules
 */

// Map Pro Forma section names to analysis categories
export const CATEGORY_MAPPING: Record<string, string> = {
  'BEH': 'Behavioral Health',
  'PAD': 'Performance Analytics',
  'MAR': 'Market Research',
  'WWB': 'Workplace Well-Being',
  'CMH': 'Community Health',
};

// Cost center codes and their overhead pools
export const COST_CENTERS: Array<{
  code: string;
  description: string;
  pool: string;
}> = [
  { code: 'THS-25-01-DEV', description: 'Business Development', pool: 'SGA' },
  { code: 'THS-25-01-BAD', description: 'Business Administration', pool: 'SGA' },
  { code: 'THS-25-01-MTG', description: 'Internal Meetings', pool: 'SGA' },
  { code: 'THS-25-01-SAD', description: 'Starset Dev Cost', pool: 'DATA' },
  { code: 'THS-25-01-OOO', description: 'Out of Office', pool: 'SGA' },
  { code: 'THS-25-01-PAD', description: 'Personal Administration', pool: 'SGA' },
  { code: 'THS-25-01-PRO', description: 'Professional Development', pool: 'SGA' },
  { code: 'THS-25-01-SPP', description: 'Internal Special Projects', pool: 'SGA' },
  { code: 'THS-25-01-TEA', description: 'Team Building', pool: 'SGA' },
  { code: 'THS-25-01-COM', description: 'Communications', pool: 'SGA' },
  { code: 'THS-25-01-CSR', description: 'Corporate Social Responsibility', pool: 'SGA' },
  { code: 'HC3', description: 'Health Care Council of Chicago', pool: 'SGA' },
  { code: 'GEH', description: 'Work Place Well-Being Administration', pool: 'SGA' },
  { code: 'BEH-25-01-APR', description: 'Alliance for Addiction Payment Reform', pool: 'SGA' },
];

// P&L account tagging rules
export const PNL_ACCOUNT_TAGS: Array<{
  matchType: 'exact' | 'contains' | 'regex';
  pattern: string;
  bucket: 'DATA' | 'WORKPLACE' | 'NIL' | 'SGA';
}> = [
  // DATA bucket - infrastructure and data services
  { matchType: 'contains', pattern: 'Starset', bucket: 'DATA' },
  { matchType: 'contains', pattern: 'AWS', bucket: 'DATA' },
  { matchType: 'contains', pattern: 'Azure', bucket: 'DATA' },
  { matchType: 'contains', pattern: 'Cloud', bucket: 'DATA' },
  { matchType: 'contains', pattern: 'Data Center', bucket: 'DATA' },
  { matchType: 'contains', pattern: 'Software License', bucket: 'DATA' },
  { matchType: 'contains', pattern: 'Technology', bucket: 'DATA' },
  { matchType: 'contains', pattern: 'IT Infrastructure', bucket: 'DATA' },

  // WORKPLACE bucket - employee wellness and workplace
  { matchType: 'contains', pattern: 'Well-being', bucket: 'WORKPLACE' },
  { matchType: 'contains', pattern: 'Wellbeing', bucket: 'WORKPLACE' },
  { matchType: 'contains', pattern: 'Wellness', bucket: 'WORKPLACE' },
  { matchType: 'contains', pattern: 'ICHRA', bucket: 'WORKPLACE' },
  { matchType: 'contains', pattern: 'Health Insurance', bucket: 'WORKPLACE' },
  { matchType: 'contains', pattern: 'Employee Benefits', bucket: 'WORKPLACE' },

  // NIL bucket - exclude from all pools
  { matchType: 'contains', pattern: 'Depreciation', bucket: 'NIL' },
  { matchType: 'contains', pattern: 'Amortization', bucket: 'NIL' },
  { matchType: 'contains', pattern: 'Interest Expense', bucket: 'NIL' },
  { matchType: 'contains', pattern: 'Income Tax', bucket: 'NIL' },

  // Everything else goes to SGA (default, handled in matcher)
];

// Get cost center by code
export function getCostCenter(code: string): { description: string; pool: string } | null {
  const found = COST_CENTERS.find(cc => cc.code === code);
  return found ? { description: found.description, pool: found.pool } : null;
}

// Check if code is a known cost center
export function isCostCenter(code: string): boolean {
  return COST_CENTERS.some(cc => cc.code === code);
}

// Get all cost center codes
export function getCostCenterCodes(): Set<string> {
  return new Set(COST_CENTERS.map(cc => cc.code));
}
