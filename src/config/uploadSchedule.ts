/**
 * Upload Schedule Configuration
 * Defines when each upload is due for each executive
 */

import type { UploadScheduleItem } from '@/types';

/**
 * Master schedule defining when each upload is due
 * daysAfterPeriodEnd: Grace period after the period ends before the upload is due
 */
export const UPLOAD_SCHEDULE: UploadScheduleItem[] = [
  // CEO - Quarterly
  {
    uploadTypeId: 'excel_strategic',
    uploadTypeName: 'Strategic Initiatives',
    executiveId: 'exec-ceo',
    cadence: 'quarterly',
    daysAfterPeriodEnd: 15,
  },

  // President - Weekly
  {
    uploadTypeId: 'excel_cash',
    uploadTypeName: 'Cash Position',
    executiveId: 'exec-president',
    cadence: 'weekly',
    daysAfterPeriodEnd: 3,
  },

  // COO - Weekly + Monthly
  {
    uploadTypeId: 'excel_harvest',
    uploadTypeName: 'Harvest Compliance',
    executiveId: 'exec-coo',
    cadence: 'weekly',
    daysAfterPeriodEnd: 3,
  },
  {
    uploadTypeId: 'excel_training',
    uploadTypeName: 'Training Status',
    executiveId: 'exec-coo',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },
  {
    uploadTypeId: 'excel_staffing',
    uploadTypeName: 'Staffing & Utilization',
    executiveId: 'exec-coo',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },

  // CFO - Monthly
  {
    uploadTypeId: 'excel_ar',
    uploadTypeName: 'AR Aging',
    executiveId: 'exec-cfo',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },
  {
    uploadTypeId: 'excel_ap',
    uploadTypeName: 'Accounts Payable',
    executiveId: 'exec-cfo',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },
  {
    uploadTypeId: 'excel_month_close',
    uploadTypeName: 'Month-End Close',
    executiveId: 'exec-cfo',
    cadence: 'monthly',
    daysAfterPeriodEnd: 10,
  },

  // CGO - Monthly
  {
    uploadTypeId: 'excel_pipeline',
    uploadTypeName: 'BD Pipeline',
    executiveId: 'exec-cgo',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },

  // CSO - Monthly + Quarterly
  {
    uploadTypeId: 'excel_delivery',
    uploadTypeName: 'Delivery Tracking',
    executiveId: 'exec-cso',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },
  {
    uploadTypeId: 'excel_client_satisfaction',
    uploadTypeName: 'Client Satisfaction',
    executiveId: 'exec-cso',
    cadence: 'quarterly',
    daysAfterPeriodEnd: 15,
  },

  // CDAO - Monthly
  {
    uploadTypeId: 'excel_starset',
    uploadTypeName: 'Starset Analytics',
    executiveId: 'exec-cdao',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },
  {
    uploadTypeId: 'excel_hmrf',
    uploadTypeName: 'HMRF Database',
    executiveId: 'exec-cdao',
    cadence: 'monthly',
    daysAfterPeriodEnd: 5,
  },
];

/**
 * Get upload schedule items for a specific executive
 */
export function getScheduleForExecutive(executiveId: string): UploadScheduleItem[] {
  return UPLOAD_SCHEDULE.filter((item) => item.executiveId === executiveId);
}

/**
 * Get upload schedule items by cadence
 */
export function getScheduleByCadence(
  cadence: 'weekly' | 'monthly' | 'quarterly'
): UploadScheduleItem[] {
  return UPLOAD_SCHEDULE.filter((item) => item.cadence === cadence);
}

/**
 * Get all unique executive IDs from schedule
 */
export function getScheduledExecutiveIds(): string[] {
  return [...new Set(UPLOAD_SCHEDULE.map((item) => item.executiveId))];
}

/**
 * Cadence display configuration
 */
export const CADENCE_CONFIG = {
  weekly: {
    label: 'Weekly',
    shortLabel: 'W',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
    dotClass: 'bg-blue-500',
  },
  monthly: {
    label: 'Monthly',
    shortLabel: 'M',
    color: 'amber',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    dotClass: 'bg-amber-500',
  },
  quarterly: {
    label: 'Quarterly',
    shortLabel: 'Q',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-300',
    dotClass: 'bg-purple-500',
  },
} as const;
