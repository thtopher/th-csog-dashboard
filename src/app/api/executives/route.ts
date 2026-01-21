import { NextResponse } from 'next/server';
import type { ExecutiveOverviewResponse, ExecutiveSummary, CEOScorecardWithAudit, HealthStatus, ProcessSummary, AuditMetadata } from '@/types';
import { DEFAULT_EXECUTIVES } from '@/config/executives';

/**
 * GET /api/executives
 *
 * Returns all executives with their processes, functions, and the CEO Scorecard.
 * This is the primary endpoint for the executive-centric dashboard view.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodType = searchParams.get('periodType') || 'week';

  // Simulate process and function data for each executive
  const executiveProcesses: Record<string, { processes: ProcessSummary[]; functions: ProcessSummary[] }> = {
    'exec-ceo': {
      processes: [],
      functions: [
        createProcessSummary('F-EOC', 'Executive Operating Cadence', 'function', 'healthy', 10),
        createProcessSummary('F-CAI', 'Capital Allocation & Investment', 'function', 'healthy', 10),
        createProcessSummary('F-QAD', 'Quality Assurance & Delivery', 'function', 'healthy', 10),
        createProcessSummary('F-PEM', 'Partnership & Ecosystem', 'function', 'healthy', 10),
        createProcessSummary('F-SP', 'Strategic Planning', 'function', 'warning', 10),
        createProcessSummary('F-CRC', 'Client Executive Relationships', 'function', 'healthy', 10),
        createProcessSummary('F-CPE', 'Community & Political Engagement', 'function', 'healthy', 10),
      ],
    },
    'exec-president': {
      processes: [
        createProcessSummary('CF', 'Cash Flow Management', 'process', 'healthy', 8),
        createProcessSummary('CR', 'Compensation & Role Changes', 'process', 'healthy', 10),
        createProcessSummary('TP', 'Tax Preparation & Filing', 'process', 'healthy', 12),
        createProcessSummary('EM', 'Expense Management', 'process', 'healthy', 8),
        createProcessSummary('PA', 'Procurement & Vendor Approval', 'process', 'healthy', 8),
        createProcessSummary('VM', 'Contractor/Vendor Management', 'process', 'healthy', 10),
      ],
      functions: [
        createProcessSummary('F-IP', 'Intellectual Property Governance', 'function', 'healthy', 7),
        createProcessSummary('F-OC', 'Organizational Chart Management', 'function', 'healthy', 5),
        createProcessSummary('F-ER', 'Enterprise Risk Management', 'function', 'warning', 7),
        createProcessSummary('F-KM', 'Knowledge Management', 'function', 'healthy', 7),
      ],
    },
    'exec-coo': {
      processes: [
        createProcessSummary('OC', 'Operationalizing Client Contracts', 'process', 'healthy', 5),
        createProcessSummary('WD', 'Website Development', 'process', 'healthy', 5),
        createProcessSummary('TM', 'Template Management', 'process', 'healthy', 5),
        createProcessSummary('ST', 'Staffing', 'process', 'warning', 8),
        createProcessSummary('EO', 'Employee Onboarding', 'process', 'healthy', 10),
        createProcessSummary('ES', 'Employee Separation - Voluntary', 'process', 'healthy', 8),
        createProcessSummary('ET', 'Employee Separation - Involuntary', 'process', 'healthy', 6),
        createProcessSummary('PM', 'Performance Management', 'process', 'healthy', 8),
        createProcessSummary('TC', 'Training & Compliance', 'process', 'warning', 6),
      ],
      functions: [
        createProcessSummary('F-BOM', 'Board of Managers Facilitation', 'function', 'healthy', 5),
        createProcessSummary('F-BI', 'Business Insurance', 'function', 'healthy', 4),
        createProcessSummary('F-BA', 'Benefits Administration', 'function', 'healthy', 5),
        createProcessSummary('F-EH', 'Employee Handbook', 'function', 'healthy', 4),
        createProcessSummary('F-TLG', 'Thought Leadership Governance', 'function', 'healthy', 5),
      ],
    },
    'exec-cfo': {
      processes: [
        createProcessSummary('AR', 'Accounts Receivable', 'process', 'warning', 6),
        createProcessSummary('AP', 'Accounts Payable', 'process', 'healthy', 6),
        createProcessSummary('MC', 'Month-End Close', 'process', 'healthy', 8),
        createProcessSummary('FR', 'Financial Reporting', 'process', 'healthy', 6),
        createProcessSummary('IM', 'Inventory Management', 'process', 'healthy', 5),
        createProcessSummary('SM', 'SaaS Subscription Management', 'process', 'healthy', 5),
      ],
      functions: [],
    },
    'exec-cdao': {
      processes: [
        createProcessSummary('SA', 'Starset Analytics', 'process', 'healthy', 8),
        createProcessSummary('HMRF', 'Hospital MRF Database', 'process', 'healthy', 6),
        createProcessSummary('DDD', 'Data-Driven Deliverables', 'process', 'healthy', 5),
        createProcessSummary('IAM', 'Identity & Access Management', 'process', 'healthy', 6),
      ],
      functions: [
        createProcessSummary('F-IT', 'Information Technology', 'function', 'healthy', 8),
      ],
    },
    'exec-cgo': {
      processes: [
        createProcessSummary('BD', 'Business Development', 'process', 'healthy', 9),
        createProcessSummary('TL', 'Thought Leadership', 'process', 'healthy', 6),
        createProcessSummary('MKT', 'Marketing Collateral', 'process', 'healthy', 5),
      ],
      functions: [],
    },
    'exec-cso': {
      processes: [
        createProcessSummary('SD', 'Service Delivery', 'process', 'warning', 7),
        createProcessSummary('CP', 'Contract Performance', 'process', 'healthy', 6),
        createProcessSummary('CC', 'Contract Closure', 'process', 'healthy', 5),
        createProcessSummary('CiS', 'Change in Scope', 'process', 'healthy', 5),
        createProcessSummary('CA', 'Corrective Action', 'process', 'healthy', 5),
        createProcessSummary('CFP', 'Client-Facing Publications', 'process', 'healthy', 4),
      ],
      functions: [
        createProcessSummary('F-CDH', 'Client Confidentiality & Data Handling', 'function', 'healthy', 6),
      ],
    },
  };

  // Build executive summaries
  const executives: ExecutiveSummary[] = DEFAULT_EXECUTIVES.map((exec) => {
    const execId = exec.id!;
    const procData = executiveProcesses[execId] || { processes: [], functions: [] };

    // Calculate overall status
    const allItems = [...procData.processes, ...procData.functions];
    const overallStatus: HealthStatus =
      allItems.some(p => p.overallStatus === 'critical') ? 'critical' :
      allItems.some(p => p.overallStatus === 'warning') ? 'warning' : 'healthy';

    return {
      id: execId,
      name: exec.name!,
      title: exec.title!,
      role: exec.role!,
      email: exec.email,
      displayOrder: exec.displayOrder!,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processes: procData.processes,
      functions: procData.functions,
      overallStatus,
      processCount: procData.processes.length,
      functionCount: procData.functions.length,
      taskCount: procData.processes.reduce((sum, p) => sum + (p.taskCount || 0), 0) +
                 procData.functions.reduce((sum, f) => sum + (f.taskCount || 0), 0),
    };
  });

  // Build CEO Scorecard per F-EOC6 requirements
  const ceoScorecard = generateCEOScorecard(periodType);

  const response: ExecutiveOverviewResponse = {
    executives,
    ceoScorecard,
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

/**
 * Helper to create a process/function summary
 */
function createProcessSummary(
  code: string,
  name: string,
  type: 'process' | 'function',
  status: HealthStatus,
  taskCount: number
): ProcessSummary {
  return {
    id: `p-${code.toLowerCase()}`,
    domainId: 'd1',
    name,
    code,
    processTag: code.toLowerCase().replace('-', '_'),
    processType: type,
    sopStatus: 'documented',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    kpis: [],
    activeGapsCount: status === 'warning' ? 1 : status === 'critical' ? 2 : 0,
    overallStatus: status,
    taskCount,
  } as ProcessSummary & { overallStatus: HealthStatus; taskCount: number };
}

/**
 * Generate CEO Scorecard data per F-EOC6 requirements
 * Shows: Pipeline, Delivery, Margin, Cash, Staffing, Strategic Initiatives
 * Now includes audit metadata for each category
 */
function generateCEOScorecard(periodType: string): CEOScorecardWithAudit {
  // Period-based variance
  const variance = periodType === 'week' ? 1.0 : periodType === 'month' ? 0.95 : 0.90;
  const now = new Date().toISOString();

  // Generate audit metadata for each category
  const audit = {
    pipelineHealth: createAuditMetadata(
      'Pipeline metrics aggregated from BD process tracking data',
      'Pipeline Value = Sum of all active opportunities; Win Rate = (Wins / Total Closed) * 100',
      [
        { name: 'BD Pipeline Tracker', lastUpdated: '2026-01-19T10:30:00Z', uploadedBy: 'Cheryl Matochik', executiveId: 'exec-cgo', recordCount: 47 },
      ]
    ),
    deliveryHealth: createAuditMetadata(
      'Delivery metrics calculated from service delivery tracking and client feedback',
      'On-Time = (Delivered On Time / Total Deliverables) * 100; Satisfaction = Avg rating from client surveys',
      [
        { name: 'Delivery Tracking Sheet', lastUpdated: '2026-01-18T14:00:00Z', uploadedBy: 'Ashley DeGarmo', executiveId: 'exec-cso', recordCount: 32 },
        { name: 'Client Satisfaction Survey', lastUpdated: '2026-01-15T09:00:00Z', uploadedBy: 'Ashley DeGarmo', executiveId: 'exec-cso', recordCount: 18 },
      ]
    ),
    margin: createAuditMetadata(
      'Contract margin calculated from contract performance data',
      'Margin = ((Revenue - Cost) / Revenue) * 100',
      [
        { name: 'Contract Performance Data', lastUpdated: '2026-01-17T16:00:00Z', uploadedBy: 'Ashley DeGarmo', executiveId: 'exec-cso', recordCount: 15 },
      ]
    ),
    cash: createAuditMetadata(
      'Cash metrics aggregated from financial systems and AR aging reports',
      'DSO = (AR / Revenue) * Days in Period; AR 90+ = Sum of invoices > 90 days',
      [
        { name: 'Cash Position Report', lastUpdated: '2026-01-20T08:00:00Z', uploadedBy: 'Greg Williams', executiveId: 'exec-president', recordCount: 1 },
        { name: 'AR Aging Report', lastUpdated: '2026-01-19T11:00:00Z', uploadedBy: 'Aisha Waheed', executiveId: 'exec-cfo', recordCount: 156 },
      ]
    ),
    staffingCapacity: createAuditMetadata(
      'Staffing metrics from Harvest time tracking and HR systems',
      'Utilization = (Billable Hours / Available Hours) * 100',
      [
        { name: 'Harvest Compliance Report', lastUpdated: '2026-01-19T09:00:00Z', uploadedBy: 'Jordana Choucair', executiveId: 'exec-coo', recordCount: 24 },
        { name: 'Open Positions Tracker', lastUpdated: '2026-01-18T12:00:00Z', uploadedBy: 'Jordana Choucair', executiveId: 'exec-coo', recordCount: 3 },
      ]
    ),
    strategicInitiatives: createAuditMetadata(
      'Strategic initiative progress tracked in quarterly planning documents',
      'On Track = Count of initiatives with status "Green" or "On Track"',
      [
        { name: 'Strategic Planning Tracker', lastUpdated: '2026-01-15T15:00:00Z', uploadedBy: 'David Smith', executiveId: 'exec-ceo', recordCount: 6 },
      ]
    ),
  };

  return {
    pipelineHealth: {
      pipelineValue: Math.round(2450000 * variance),
      pipelineValueChange: periodType === 'week' ? 8.5 : periodType === 'month' ? 5.2 : 2.1,
      winRate: Math.round(38 * variance * 10) / 10,
      winRateChange: periodType === 'week' ? 2.1 : -1.5,
      status: 'healthy',
    },
    deliveryHealth: {
      onTimeDelivery: Math.round(91 * variance * 10) / 10,
      onTimeDeliveryChange: periodType === 'week' ? 3.0 : -2.1,
      clientSatisfaction: 4.7,
      clientSatisfactionChange: 0.2,
      status: periodType === 'week' ? 'warning' : 'warning',
    },
    margin: {
      contractMargin: Math.round(32 * variance * 10) / 10,
      contractMarginChange: periodType === 'week' ? 1.2 : -0.5,
      status: 'healthy',
    },
    cash: {
      cashPosition: Math.round(850000 * variance),
      cashPositionChange: periodType === 'week' ? 12.3 : 5.8,
      dso: periodType === 'week' ? 42 : periodType === 'month' ? 44 : 48,
      dsoChange: periodType === 'week' ? -3 : 2,
      ar90Plus: periodType === 'week' ? 28500 : periodType === 'month' ? 35000 : 48000,
      ar90PlusChange: periodType === 'week' ? -15.2 : 8.5,
      status: periodType === 'week' ? 'healthy' : 'warning',
    },
    staffingCapacity: {
      billableUtilization: Math.round(72 * variance * 10) / 10,
      billableUtilizationChange: periodType === 'week' ? 2.1 : -1.8,
      openPositions: 3,
      openPositionsChange: periodType === 'week' ? 0 : 1,
      status: 'warning',
    },
    strategicInitiatives: {
      initiativesOnTrack: periodType === 'week' ? 5 : periodType === 'month' ? 4 : 4,
      initiativesTotal: 6,
      status: periodType === 'week' ? 'healthy' : 'warning',
    },
    lastUpdated: now,
    audit,
  };
}

/**
 * Helper to create audit metadata
 */
function createAuditMetadata(
  calculationMethod: string,
  formula: string,
  dataSources: { name: string; lastUpdated: string; uploadedBy: string; executiveId: string; recordCount: number }[]
): AuditMetadata {
  return {
    calculatedAt: new Date().toISOString(),
    calculationMethod,
    formula,
    dataSources,
  };
}
