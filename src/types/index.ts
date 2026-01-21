// Third Horizon CSOG Dashboard
// Core Type Definitions

// ============================================
// ENUMS
// ============================================

export type SOPStatus = 'documented' | 'partial' | 'missing';

export type ProcessType = 'process' | 'function';

export type RACIRole = 'A' | 'R' | 'C' | 'I';

export type TaskStatus = 'active' | 'in_progress' | 'completed' | 'blocked';

export type KPIDirection = 'higher_better' | 'lower_better' | 'target';

export type KPIUnit = 'percent' | 'count' | 'dollars' | 'days' | 'hours';

export type DisplayFormat = 'number' | 'percent' | 'currency' | 'duration';

export type ChartType = 'bar' | 'line' | 'area' | 'stacked_bar' | 'gauge';

export type RefreshCadence = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export type PeriodType = 'day' | 'week' | 'biweek' | 'month' | 'quarter' | 'year' | 'ytd';

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

export interface Executive {
  id: string;
  name: string;
  title: string;
  role: string;
  email?: string;
  photoUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  executiveId?: string;
  name: string;
  code?: string;
  processTag: string;
  processType: ProcessType;
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

export interface Task {
  id: string;
  processId: string;
  code: string;
  description: string;
  displayOrder: number;
  status: TaskStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RACIAssignment {
  id: string;
  taskId: string;
  personName: string;
  personId?: string;
  role: RACIRole;
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
  executiveId?: string;
  title?: string;
  reportsTo?: string;
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

/** Executive with their processes, functions, and aggregated metrics */
export interface ExecutiveSummary extends Executive {
  processes: ProcessSummary[];
  functions: ProcessSummary[];
  overallStatus: HealthStatus;
  processCount: number;
  functionCount: number;
  taskCount: number;
}

/** Task with RACI assignments */
export interface TaskWithRACI extends Task {
  accountable?: string;
  responsible?: string;
  contributors?: string[];
  informed?: string[];
  process?: Process;
}

/** Process with tasks */
export interface ProcessWithTasks extends Process {
  tasks: TaskWithRACI[];
  executive?: Executive;
}

/** CEO Scorecard metrics per F-EOC6 requirements */
export interface CEOScorecard {
  pipelineHealth: {
    pipelineValue: number;
    pipelineValueChange?: number;
    winRate: number;
    winRateChange?: number;
    status: HealthStatus;
  };
  deliveryHealth: {
    onTimeDelivery: number;
    onTimeDeliveryChange?: number;
    clientSatisfaction: number;
    clientSatisfactionChange?: number;
    status: HealthStatus;
  };
  margin: {
    contractMargin: number;
    contractMarginChange?: number;
    status: HealthStatus;
  };
  cash: {
    cashPosition: number;
    cashPositionChange?: number;
    dso: number;
    dsoChange?: number;
    ar90Plus: number;
    ar90PlusChange?: number;
    status: HealthStatus;
  };
  staffingCapacity: {
    billableUtilization: number;
    billableUtilizationChange?: number;
    openPositions: number;
    openPositionsChange?: number;
    status: HealthStatus;
  };
  strategicInitiatives: {
    initiativesOnTrack: number;
    initiativesTotal: number;
    status: HealthStatus;
  };
  lastUpdated: string;
}

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
  overallStatus?: HealthStatus;
  taskCount?: number;
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

// ============================================
// EXECUTIVE API TYPES
// ============================================

export interface ExecutiveOverviewResponse {
  executives: ExecutiveSummary[];
  ceoScorecard: CEOScorecard;
  lastUpdated: string;
}

export interface ExecutiveDetailResponse {
  executive: ExecutiveSummary;
  processes: ProcessWithTasks[];
  functions: ProcessWithTasks[];
}

export interface TaskListResponse {
  tasks: TaskWithRACI[];
  process: Process;
  total: number;
}

export interface RACIMatrixResponse {
  tasks: TaskWithRACI[];
  process: Process;
  executive: Executive;
}

// ============================================
// AUDIT / DATA SOURCE TYPES
// ============================================

export interface DataSourceInfo {
  name: string;
  lastUpdated: string;
  uploadedBy?: string;
  uploadedByEmail?: string;
  executiveId?: string;
  recordCount?: number;
}

export interface AuditMetadata {
  calculatedAt: string;
  calculationMethod: string;
  formula?: string;
  dataSources: DataSourceInfo[];
}

/** CEO Scorecard with audit metadata */
export interface CEOScorecardWithAudit extends CEOScorecard {
  audit: {
    pipelineHealth: AuditMetadata;
    deliveryHealth: AuditMetadata;
    margin: AuditMetadata;
    cash: AuditMetadata;
    staffingCapacity: AuditMetadata;
    strategicInitiatives: AuditMetadata;
  };
}
