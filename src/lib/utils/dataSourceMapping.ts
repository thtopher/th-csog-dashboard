/**
 * Data Source Mapping Utility
 * Maps process codes to their data sources for display purposes
 */

export type DataSource = 'harvest' | 'netsuite' | 'notion' | 'excel' | 'manual';

export interface DataSourceInfo {
  id: DataSource;
  label: string;
  color: string;
  bgColor: string;
}

export const DATA_SOURCE_CONFIG: Record<DataSource, DataSourceInfo> = {
  harvest: {
    id: 'harvest',
    label: 'Harvest',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  netsuite: {
    id: 'netsuite',
    label: 'NetSuite',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  notion: {
    id: 'notion',
    label: 'Notion',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  excel: {
    id: 'excel',
    label: 'Excel',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },
  manual: {
    id: 'manual',
    label: 'Manual',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
};

/**
 * Process code to data source mapping
 * Based on where the data originates for each operational process
 */
const PROCESS_DATA_SOURCES: Record<string, DataSource[]> = {
  // COO Domain - Time & Staffing
  'TC': ['harvest', 'excel'],           // Time Compliance - Harvest time tracking
  'ST': ['harvest', 'excel'],           // Staffing & Utilization - Harvest data

  // CFO Domain - Finance
  'AR': ['netsuite'],                   // Accounts Receivable - NetSuite
  'AP': ['netsuite'],                   // Accounts Payable - NetSuite
  'MC': ['netsuite', 'excel'],          // Month-End Close - NetSuite + Excel reports
  'FR': ['netsuite'],                   // Financial Reporting - NetSuite
  'CF': ['netsuite', 'excel'],          // Cash Flow - NetSuite data

  // President Domain
  'PM': ['excel', 'manual'],            // Portfolio Management - Manual tracking

  // CGO Domain - Business Development
  'BD': ['notion', 'excel'],            // Business Development Pipeline - Notion + Excel

  // CSO Domain - Service Delivery
  'SD': ['notion', 'excel'],            // Service Delivery - Notion project tracking
  'CP': ['notion', 'excel'],            // Client Projects - Notion

  // CDAO Domain - Data & Analytics
  'SA': ['excel'],                      // Starset Analytics - Excel exports
  'HMRF': ['excel'],                    // HMRF Database - Excel data
  'DA': ['excel'],                      // Data Analytics - Excel/custom

  // CEO Domain - Strategic
  'F-SP': ['notion', 'manual'],         // Strategic Planning - Notion
  'F-EOC': ['notion', 'manual'],        // Executive Operations - Notion
  'F-GV': ['manual'],                   // Governance - Manual
  'F-RM': ['excel', 'manual'],          // Risk Management - Excel
};

/**
 * Get data sources for a given process code
 */
export function getDataSourcesForProcess(processCode: string): DataSource[] {
  return PROCESS_DATA_SOURCES[processCode] || ['manual'];
}

/**
 * Get data source info for a process code
 */
export function getDataSourceInfoForProcess(processCode: string): DataSourceInfo[] {
  const sources = getDataSourcesForProcess(processCode);
  return sources.map(source => DATA_SOURCE_CONFIG[source]);
}

/**
 * Check if a process has a specific data source
 */
export function processHasDataSource(processCode: string, source: DataSource): boolean {
  const sources = getDataSourcesForProcess(processCode);
  return sources.includes(source);
}
