// Third Horizon CSOG Dashboard
// Core Type Definitions

// ============================================
// ENUMS
// ============================================

export type SOPStatus = 'documented' | 'partial' | 'missing';

export type KPIDirection = 'higher_better' | 'lower_better' | 'target';

export type KPIUnit = 'percent' | 'count' | 'dollars' | 'days' | 'hours';

export type DisplayFormat = 'number' | 'percent' | 'currency' | 'duration';

export type ChartType = 'bar' | 'line' | 'area' | 'stacked_bar' | 'gauge';

export type RefreshCadence = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export type PeriodType = 'day' | 'week' | 'biweek' | 'month' | 'quarter' | 'year';

export type TrendDirection = 'up' | 'down' | 'flat';

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export type GapType = 'missing_sop' | 'unclear_ownership' | 'tooling' | 'training' | 'resource' | 'integration' | 'other';

export type GapSeverity = 'low' | 'medium' | 'high' | 'critical';

export type GapStatus = 'open' | 'in_progress' | 'blocked' | 'resolved' | 'wont_fix';

export type AnnotationType = 'comment' | 'trend_note' | 'action_item' | 'context' | 'auto_insight';

export type UserRole = 'admin' | 'csog_member' | 'steward' | 'staff' | 'viewer';

export type DataSource = 'excel_harvest' | 'excel_training' | 'excel_billable' | 'netsuite' | 'notion' | 'manual';

export type IngestionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

// ============================================
// CORE ENTITIES
// ============================================

export interface OperationalDomain {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  stewardName?: string;
  stewardEmail?: string;
  displayOrder: number;
  colorHex: string;
  iconName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Process {
  id: string;
  domainId: string;
  parentProcessId?: string;
  name: string;
  processTag: string;
  description?: string;
  stewardName?: string;
  stewardEmail?: string;
  sopStatus: SOPStatus;
  sopLink?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KPIDefinition {
  id: string;
  processId: string;
  name: string;
  shortName: string;
  description?: string;
  unit: KPIUnit;
  direction: KPIDirection;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  dataSource: DataSource;
  sourceConfig?: Record<string, unknown>;
  refreshCadence: RefreshCadence;
  displayFormat: DisplayFormat;
  chartType: ChartType;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KPIValue {
  id: string;
  kpiDefinitionId: string;
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  value: number;
  numerator?: number;
  denominator?: number;
  previousValue?: number;
  trendDirection?: TrendDirection;
  status?: HealthStatus;
  metadata?: Record<string, unknown>;
  sourceFile?: string;
  sourceRowCount?: number;
  ingestedAt: string;
  ingestedBy?: string;
}

export interface Annotation {
  id: string;
  targetType: 'domain' | 'process' | 'kpi_definition' | 'kpi_value';
  targetId: string;
  annotationType: AnnotationType;
  title?: string;
  content: string;
  authorName?: string;
  authorEmail?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ProcessGap {
  id: string;
  processId: string;
  gapType: GapType;
  title: string;
  description?: string;
  severity: GapSeverity;
  impactDescription?: string;
  affectedKpis?: string[];
  identifiedDate: string;
  identifiedBy?: string;
  assignedTo?: string;
  targetResolutionDate?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  status: GapStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stewardedDomains?: string[];
  preferences?: UserPreferences;
  lastLoginAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  defaultTimeWindow?: PeriodType;
  defaultDomains?: string[];
  theme?: 'light' | 'dark' | 'system';
  dashboardLayout?: string;
}

export interface IngestionLog {
  id: string;
  sourceType: string;
  sourceName?: string;
  fileName?: string;
  filePath?: string;
  fileHash?: string;
  rowCount?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsSkipped?: number;
  validationErrors?: ValidationError[];
  status: IngestionStatus;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  ingestedBy?: string;
}

export interface ValidationError {
  row?: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================
// COMPOSITE / VIEW TYPES
// ============================================

/** Domain with aggregated KPI summary for tile display */
export interface DomainSummary extends OperationalDomain {
  processes: ProcessSummary[];
  primaryKpis: KPISummary[];
  overallStatus: HealthStatus;
  activeGapsCount: number;
}

/** Process with its KPIs */
export interface ProcessSummary extends Process {
  kpis: KPISummary[];
  childProcesses?: ProcessSummary[];
  activeGapsCount: number;
}

/** KPI definition with latest value */
export interface KPISummary extends KPIDefinition {
  latestValue?: KPIValue;
  sparklineData?: number[];
}

/** Full KPI detail with historical values */
export interface KPIDetail extends KPIDefinition {
  process: Process;
  domain: OperationalDomain;
  values: KPIValue[];
  annotations: Annotation[];
  relatedGaps: ProcessGap[];
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface TimeFilter {
  periodType: PeriodType;
  startDate?: string;
  endDate?: string;
  periodsBack?: number;
}

export interface DashboardFilters {
  timeFilter: TimeFilter;
  domainIds?: string[];
  processIds?: string[];
  stewardEmail?: string;
}

export interface OverviewResponse {
  domains: DomainSummary[];
  filters: DashboardFilters;
  lastUpdated: string;
}

export interface DomainDetailResponse {
  domain: DomainSummary;
  filters: DashboardFilters;
}

export interface ProcessDetailResponse {
  process: ProcessSummary;
  kpiDetails: KPIDetail[];
  gaps: ProcessGap[];
  annotations: Annotation[];
}

export interface UploadRequest {
  sourceType: DataSource;
  file: File;
}

export interface UploadResponse {
  success: boolean;
  ingestionId: string;
  recordsProcessed: number;
  errors?: ValidationError[];
}
