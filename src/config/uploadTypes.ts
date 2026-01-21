/**
 * Upload Types Configuration
 * Maps data upload types to executive permissions and source processes
 */

import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  FileText,
  FileSpreadsheet,
  DollarSign,
  Users,
  Target,
  Truck,
  Database,
  BarChart3,
  Wallet,
  CreditCard,
  Calendar,
} from 'lucide-react';

export interface UploadType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  template: string;
  allowedExecutives: string[];  // Executive IDs that can upload this type
  sourceProcesses: string[];    // Process codes this feeds into
}

export const UPLOAD_TYPES: UploadType[] = [
  // COO Upload Types
  {
    id: 'excel_harvest',
    name: 'Harvest Compliance',
    description: 'Weekly time tracking compliance data',
    icon: Clock,
    template: 'harvest_compliance_template.xlsx',
    allowedExecutives: ['exec-coo'],
    sourceProcesses: ['TC', 'ST'],
  },
  {
    id: 'excel_training',
    name: 'Training Status',
    description: 'Staff training completion tracking',
    icon: FileText,
    template: 'training_status_template.xlsx',
    allowedExecutives: ['exec-coo'],
    sourceProcesses: ['TC'],
  },
  {
    id: 'excel_staffing',
    name: 'Staffing & Utilization',
    description: 'Billable hours and staffing allocation',
    icon: Users,
    template: 'staffing_template.xlsx',
    allowedExecutives: ['exec-coo'],
    sourceProcesses: ['ST'],
  },

  // CFO Upload Types
  {
    id: 'excel_ar',
    name: 'Accounts Receivable Aging',
    description: 'AR aging report for collections tracking',
    icon: CreditCard,
    template: 'ar_aging_template.xlsx',
    allowedExecutives: ['exec-cfo'],
    sourceProcesses: ['AR'],
  },
  {
    id: 'excel_ap',
    name: 'Accounts Payable',
    description: 'AP aging and payment scheduling',
    icon: DollarSign,
    template: 'ap_template.xlsx',
    allowedExecutives: ['exec-cfo'],
    sourceProcesses: ['AP'],
  },
  {
    id: 'excel_month_close',
    name: 'Month-End Close',
    description: 'Monthly financial close data',
    icon: Calendar,
    template: 'month_close_template.xlsx',
    allowedExecutives: ['exec-cfo'],
    sourceProcesses: ['MC', 'FR'],
  },

  // President Upload Types
  {
    id: 'excel_cash',
    name: 'Cash Position',
    description: 'Daily/weekly cash position report',
    icon: Wallet,
    template: 'cash_position_template.xlsx',
    allowedExecutives: ['exec-president'],
    sourceProcesses: ['CF'],
  },

  // CGO Upload Types
  {
    id: 'excel_pipeline',
    name: 'BD Pipeline',
    description: 'Business development pipeline data',
    icon: Target,
    template: 'pipeline_template.xlsx',
    allowedExecutives: ['exec-cgo'],
    sourceProcesses: ['BD'],
  },

  // CSO Upload Types
  {
    id: 'excel_delivery',
    name: 'Delivery Tracking',
    description: 'Engagement delivery and milestone tracking',
    icon: Truck,
    template: 'delivery_template.xlsx',
    allowedExecutives: ['exec-cso'],
    sourceProcesses: ['SD', 'CP'],
  },
  {
    id: 'excel_client_satisfaction',
    name: 'Client Satisfaction',
    description: 'Client feedback and satisfaction scores',
    icon: FileSpreadsheet,
    template: 'client_satisfaction_template.xlsx',
    allowedExecutives: ['exec-cso'],
    sourceProcesses: ['SD'],
  },

  // CDAO Upload Types
  {
    id: 'excel_starset',
    name: 'Starset Analytics',
    description: 'Starset platform data and metrics',
    icon: BarChart3,
    template: 'starset_template.xlsx',
    allowedExecutives: ['exec-cdao'],
    sourceProcesses: ['SA'],
  },
  {
    id: 'excel_hmrf',
    name: 'HMRF Database',
    description: 'Hospital MRF data updates',
    icon: Database,
    template: 'hmrf_template.xlsx',
    allowedExecutives: ['exec-cdao'],
    sourceProcesses: ['HMRF'],
  },

  // CEO Upload Types
  {
    id: 'excel_strategic',
    name: 'Strategic Initiatives',
    description: 'Strategic planning and initiative tracking',
    icon: Target,
    template: 'strategic_template.xlsx',
    allowedExecutives: ['exec-ceo'],
    sourceProcesses: ['F-SP', 'F-EOC'],
  },
];

/**
 * Get upload types available for a specific executive
 * Admins can see all upload types
 */
export function getUploadTypesForExecutive(
  executiveId: string | undefined,
  isAdmin: boolean
): UploadType[] {
  if (isAdmin) {
    return UPLOAD_TYPES;
  }

  if (!executiveId) {
    return [];
  }

  return UPLOAD_TYPES.filter((type) =>
    type.allowedExecutives.includes(executiveId)
  );
}

/**
 * Get an upload type by ID
 */
export function getUploadTypeById(id: string): UploadType | undefined {
  return UPLOAD_TYPES.find((type) => type.id === id);
}

/**
 * Check if a user can upload a specific type
 */
export function canUploadType(
  typeId: string,
  executiveId: string | undefined,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  if (!executiveId) return false;

  const uploadType = getUploadTypeById(typeId);
  if (!uploadType) return false;

  return uploadType.allowedExecutives.includes(executiveId);
}
