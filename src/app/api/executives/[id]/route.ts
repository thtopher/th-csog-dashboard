import { NextResponse } from 'next/server';
import type { ExecutiveDetailResponse, ProcessWithTasks, TaskWithRACI, HealthStatus, ProcessSummary } from '@/types';
import { DEFAULT_EXECUTIVES, getExecutiveById } from '@/config/executives';

// Process/function status from the overview API (should be synchronized)
const PROCESS_STATUS: Record<string, HealthStatus> = {
  'F-SP': 'warning',      // CEO - Strategic Planning
  'F-ER': 'warning',      // President - Enterprise Risk
  'ST': 'warning',        // COO - Staffing
  'TC': 'warning',        // COO - Training & Compliance
  'AR': 'warning',        // CFO - Accounts Receivable
  'SD': 'warning',        // CSO - Service Delivery
};

interface ProcessWithTasksAndStatus extends ProcessWithTasks {
  overallStatus?: HealthStatus;
  activeGapsCount?: number;
}

/**
 * GET /api/executives/[id]
 *
 * Returns detailed information for a specific executive including
 * all their processes, functions, and tasks with RACI assignments.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const executive = getExecutiveById(id);

  if (!executive) {
    return NextResponse.json(
      { error: 'Executive not found' },
      { status: 404 }
    );
  }

  // Get processes and functions for this executive
  const { processes, functions } = getExecutiveProcessesAndFunctions(id);

  const response: ExecutiveDetailResponse = {
    executive: {
      id: executive.id!,
      name: executive.name!,
      title: executive.title!,
      role: executive.role!,
      email: executive.email,
      displayOrder: executive.displayOrder!,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processes: [],
      functions: [],
      overallStatus: calculateOverallStatus([...processes, ...functions]),
      processCount: processes.length,
      functionCount: functions.length,
      taskCount: processes.reduce((sum, p) => sum + p.tasks.length, 0) +
                 functions.reduce((sum, f) => sum + f.tasks.length, 0),
    },
    processes,
    functions,
  };

  return NextResponse.json(response);
}

function calculateOverallStatus(items: ProcessWithTasksAndStatus[]): HealthStatus {
  // Check if any process/function has a warning or critical status
  const hasCritical = items.some(item => item.overallStatus === 'critical');
  if (hasCritical) return 'critical';

  const hasWarning = items.some(item => item.overallStatus === 'warning');
  if (hasWarning) return 'warning';

  return 'healthy';
}

/**
 * Get all processes and functions for an executive with their tasks
 */
function getExecutiveProcessesAndFunctions(executiveId: string): {
  processes: ProcessWithTasksAndStatus[];
  functions: ProcessWithTasksAndStatus[];
} {
  // This would come from the database in production
  // Here we're using mock data based on the SOP

  const executiveData: Record<string, { processes: ProcessWithTasksAndStatus[]; functions: ProcessWithTasksAndStatus[] }> = {
    'exec-ceo': {
      processes: [],
      functions: [
        createProcessWithTasks('p-ceo-f-eoc', 'F-EOC', 'Executive Operating Cadence', 'function', [
          { code: 'F-EOC1', description: 'Own the company operating system', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-EOC2', description: 'Define executive meeting rhythm', accountable: 'David', responsible: 'Jordana', contributors: ['Greg'], informed: [] },
          { code: 'F-EOC3', description: 'Establish decision rights', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-EOC4', description: 'Make final calls on priority conflicts', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: [] },
          { code: 'F-EOC5', description: 'Define escalation thresholds', accountable: 'David', responsible: 'CSOG', contributors: ['Greg', 'Jordana'], informed: [] },
          { code: 'F-EOC6', description: 'Own CEO-level scorecard (pipeline, delivery, margin, cash, staffing, initiatives)', accountable: 'David', responsible: 'Topher', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-EOC7', description: 'Follow through on commitments', accountable: 'David', responsible: 'Jordana', contributors: ['CSOG'], informed: [] },
          { code: 'F-EOC8', description: 'Maintain decision logs and artifacts', accountable: 'David', responsible: 'Jordana', contributors: ['Greg'], informed: ['Board of Managers'] },
          { code: 'F-EOC9', description: 'Ensure department cadences roll up', accountable: 'David', responsible: 'Greg', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-EOC10', description: 'Continuously improve operating model', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-ceo-f-cai', 'F-CAI', 'Capital Allocation & Investment Review', 'function', [
          { code: 'F-CAI1', description: 'Maintain investment thesis', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['Board of Managers'] },
          { code: 'F-CAI2', description: 'Set capital allocation rules', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-CAI3', description: 'Define investment review criteria', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
        ]),
        createProcessWithTasks('p-ceo-f-qad', 'F-QAD', 'Quality Assurance & Delivery Standards', 'function', [
          { code: 'F-QAD1', description: 'Define non-negotiable quality standards', accountable: 'David', responsible: 'David', contributors: ['Ashley', 'Greg'], informed: ['CSOG'] },
          { code: 'F-QAD2', description: 'Maintain methodology integrity', accountable: 'David', responsible: 'Greg', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-QAD3', description: 'Foster QA culture', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: [] },
        ]),
        createProcessWithTasks('p-ceo-f-pem', 'F-PEM', 'Partnership & Ecosystem Management', 'function', [
          { code: 'F-PEM1', description: 'Identify strategic partners', accountable: 'David', responsible: 'David', contributors: ['Cheryl'], informed: ['CSOG'] },
          { code: 'F-PEM2', description: 'Manage partner relationships', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: [] },
          { code: 'F-PEM3', description: 'Govern referral networks', accountable: 'David', responsible: 'Cheryl', contributors: ['David'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-ceo-f-sp', 'F-SP', 'Strategic Planning', 'function', [
          { code: 'F-SP1', description: 'Own the firm\'s long-range narrative', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-SP2', description: 'Manage near-term vs long-term balance', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-SP3', description: 'Lead annual planning cycle', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
        ]),
        createProcessWithTasks('p-ceo-f-crc', 'F-CRC', 'Client Executive Relationship Continuity', 'function', [
          { code: 'F-CRC1', description: 'Serve as executive sponsor', accountable: 'David', responsible: 'David', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-CRC2', description: 'Ensure relationship continuity', accountable: 'David', responsible: 'David', contributors: ['Ashley', 'Cheryl'], informed: [] },
          { code: 'F-CRC3', description: 'Advocate for key clients', accountable: 'David', responsible: 'David', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-ceo-f-cpe', 'F-CPE', 'Community & Political Engagement', 'function', [
          { code: 'F-CPE1', description: 'Build community credibility', accountable: 'David', responsible: 'David', contributors: ['Cheryl'], informed: ['CSOG'] },
          { code: 'F-CPE2', description: 'Navigate political sensitivity', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: [] },
          { code: 'F-CPE3', description: 'Lead stakeholder coalitions', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
        ]),
      ],
    },
    'exec-president': {
      processes: [
        createProcessWithTasks('p-pres-cf', 'CF', 'Cash Flow Management', 'process', [
          { code: 'CF1', description: 'Schedule weekly finance review', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'CF2', description: 'Prepare cash position summary', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'CF3', description: 'Review outstanding payables', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'CF4', description: 'Review AR risks', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'CF5', description: 'Identify cash constraints', accountable: 'Greg', responsible: 'Greg', contributors: ['Finance', 'David'], informed: ['Jordana'] },
        ]),
        createProcessWithTasks('p-pres-cr', 'CR', 'Compensation & Role Changes', 'process', [
          { code: 'CR1', description: 'Initiate review cycle notification', accountable: 'Greg', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Finance'] },
          { code: 'CR2', description: 'Confirm review eligibility', accountable: 'Greg', responsible: 'Jordana', contributors: ['Supervisor'], informed: ['Finance'] },
          { code: 'CR3', description: 'Assess performance outcomes', accountable: 'Greg', responsible: 'Supervisor', contributors: ['CSOG'], informed: ['Finance'] },
          { code: 'CR4', description: 'Develop compensation recommendations', accountable: 'Greg', responsible: 'Supervisor', contributors: ['Jordana'], informed: [] },
          { code: 'CR5', description: 'Approve compensation changes', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['Finance'] },
          { code: 'CR6', description: 'Communicate decisions', accountable: 'Greg', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Employee'] },
          { code: 'CR7', description: 'Update payroll', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: [] },
        ]),
        createProcessWithTasks('p-pres-tp', 'TP', 'Tax Preparation and Filing', 'process', [
          { code: 'TP1', description: 'Prepare 1099s', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['Contractors'] },
          { code: 'TP2', description: 'Coordinate with tax firm', accountable: 'Greg', responsible: 'Greg', contributors: ['Finance'], informed: ['David'] },
          { code: 'TP3', description: 'Review tax documents', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: [] },
          { code: 'TP4', description: 'Ensure filing compliance', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-pres-em', 'EM', 'Expense Management', 'process', [
          { code: 'EM1', description: 'Collect expense reports', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'EM2', description: 'Review for policy compliance', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['Submitter'] },
          { code: 'EM3', description: 'Approve expenses', accountable: 'Greg', responsible: 'Supervisor', contributors: [], informed: ['Finance'] },
          { code: 'EM4', description: 'Process reimbursements', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['Employee'] },
        ]),
        createProcessWithTasks('p-pres-pa', 'PA', 'Procurement & Vendor Approval', 'process', [
          { code: 'PA1', description: 'Receive procurement request', accountable: 'Greg', responsible: 'Requestor', contributors: [], informed: ['Greg'] },
          { code: 'PA2', description: 'Assess budget impact', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'PA3', description: 'Review vendor options', accountable: 'Greg', responsible: 'Requestor', contributors: ['Greg'], informed: [] },
          { code: 'PA4', description: 'Approve procurement', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['Finance'] },
          { code: 'PA5', description: 'Execute purchase', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['Requestor'] },
        ]),
        createProcessWithTasks('p-pres-vm', 'VM', 'Contractor/Vendor Management', 'process', [
          { code: 'VM1', description: 'Identify contractor need', accountable: 'Greg', responsible: 'Hiring Manager', contributors: [], informed: ['Jordana'] },
          { code: 'VM2', description: 'Vet and select contractor', accountable: 'Greg', responsible: 'Hiring Manager', contributors: ['Greg'], informed: [] },
          { code: 'VM3', description: 'Onboard contractor', accountable: 'Greg', responsible: 'Jordana', contributors: ['Chris H.'], informed: [] },
          { code: 'VM4', description: 'Execute contract', accountable: 'Greg', responsible: 'Jordana', contributors: ['Greg'], informed: ['Finance'] },
          { code: 'VM5', description: 'Monitor performance', accountable: 'Greg', responsible: 'Hiring Manager', contributors: [], informed: ['Greg'] },
          { code: 'VM6', description: 'Process payments', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'VM7', description: 'Offboard contractor', accountable: 'Greg', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['Finance'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-pres-f-ip', 'F-IP', 'Intellectual Property Governance', 'function', [
          { code: 'F-IP1', description: 'Identify IP assets', accountable: 'Greg', responsible: 'Greg', contributors: ['Chris H.', 'Ashley'], informed: ['CSOG'] },
          { code: 'F-IP2', description: 'Determine ownership', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: [] },
          { code: 'F-IP3', description: 'Establish usage guidelines', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-IP4', description: 'Manage IP risk', accountable: 'Greg', responsible: 'Greg', contributors: [], informed: ['David'] },
        ]),
        createProcessWithTasks('p-pres-f-oc', 'F-OC', 'Organizational Chart Management', 'function', [
          { code: 'F-OC1', description: 'Maintain org chart', accountable: 'Greg', responsible: 'Jordana', contributors: [], informed: ['CSOG'] },
          { code: 'F-OC2', description: 'Process structure changes', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-OC3', description: 'Align roles to strategy', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-pres-f-er', 'F-ER', 'Enterprise Risk Management', 'function', [
          { code: 'F-ER1', description: 'Identify enterprise risks', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana', 'David'], informed: ['CSOG'] },
          { code: 'F-ER2', description: 'Assess and prioritize risks', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-ER3', description: 'Maintain risk register', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-ER4', description: 'Oversee mitigation plans', accountable: 'Greg', responsible: 'Risk Owner', contributors: ['Greg'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-pres-f-km', 'F-KM', 'Knowledge Management', 'function', [
          { code: 'F-KM1', description: 'Identify knowledge assets', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana', 'Chris H.'], informed: ['CSOG'] },
          { code: 'F-KM2', description: 'Establish capture standards', accountable: 'Greg', responsible: 'Jordana', contributors: ['Greg'], informed: [] },
          { code: 'F-KM3', description: 'Maintain institutional memory', accountable: 'Greg', responsible: 'Jordana', contributors: ['CSOG'], informed: [] },
        ]),
      ],
    },
    'exec-coo': {
      processes: [
        createProcessWithTasks('p-coo-oc', 'OC', 'Operationalizing Client Contracts', 'process', [
          { code: 'OC1', description: 'Review executed contract', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'OC2', description: 'Track execution dates', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Finance'] },
          { code: 'OC3', description: 'Clarify scope with delivery', accountable: 'Jordana', responsible: 'Ashley', contributors: ['Cheryl'], informed: [] },
          { code: 'OC4', description: 'Coordinate internal handoff', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Ashley', 'Cheryl'], informed: ['CSOG'] },
          { code: 'OC5', description: 'Document contract details', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Finance'] },
        ]),
        createProcessWithTasks('p-coo-wd', 'WD', 'Website Development & Maintenance', 'process', [
          { code: 'WD1', description: 'Define website strategy', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl'], informed: ['David'] },
          { code: 'WD2', description: 'Coordinate content updates', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: [] },
          { code: 'WD3', description: 'Review and approve changes', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl'], informed: [] },
        ]),
        createProcessWithTasks('p-coo-tm', 'TM', 'Template Generation and Management', 'process', [
          { code: 'TM1', description: 'Identify template needs', accountable: 'Jordana', responsible: 'CSOG', contributors: [], informed: [] },
          { code: 'TM2', description: 'Develop templates', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Requestor'], informed: [] },
          { code: 'TM3', description: 'Review and approve templates', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: [] },
          { code: 'TM4', description: 'Maintain template library', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-st', 'ST', 'Staffing', 'process', [
          { code: 'ST1', description: 'Assess hiring needs', accountable: 'Jordana', responsible: 'Greg', contributors: ['CSOG'], informed: ['David'] },
          { code: 'ST2', description: 'Draft job posting', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Hiring Manager'], informed: [] },
          { code: 'ST3', description: 'Post and manage applications', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
          { code: 'ST4', description: 'Screen candidates', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Hiring Manager'], informed: [] },
          { code: 'ST5', description: 'Coordinate interviews', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Hiring Panel'], informed: ['Greg'] },
          { code: 'ST6', description: 'Make hiring recommendation', accountable: 'Jordana', responsible: 'Hiring Manager', contributors: ['Greg'], informed: ['David'] },
          { code: 'ST7', description: 'Extend offer', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['Finance'] },
          { code: 'ST8', description: 'Coordinate start date', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-eo', 'EO', 'Employee Onboarding & Orientation', 'process', [
          { code: 'EO1', description: 'Send pre-boarding materials', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['New Hire'] },
          { code: 'EO2', description: 'Prepare first-day setup', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Chris H.'], informed: [] },
          { code: 'EO3', description: 'Conduct Day 1 orientation', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['CSOG'] },
          { code: 'EO4', description: 'Assign buddy/mentor', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: [] },
          { code: 'EO5', description: 'Schedule orientation sessions', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: [] },
          { code: 'EO6', description: 'Complete HR paperwork', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Finance'] },
          { code: 'EO7', description: 'Conduct 30-day check-in', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: [] },
          { code: 'EO8', description: 'Conduct 60-day check-in', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: [] },
          { code: 'EO9', description: 'Conduct 90-day check-in', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Greg'], informed: [] },
          { code: 'EO10', description: 'Document onboarding completion', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-es', 'ES', 'Employee Separation - Voluntary', 'process', [
          { code: 'ES1', description: 'Receive resignation', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Greg'] },
          { code: 'ES2', description: 'Accept and confirm last day', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'ES3', description: 'Conduct exit interview', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Greg'] },
          { code: 'ES4', description: 'Coordinate knowledge transfer', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: [] },
          { code: 'ES5', description: 'Process final pay', accountable: 'Jordana', responsible: 'Finance', contributors: ['Jordana'], informed: [] },
          { code: 'ES6', description: 'Revoke access', accountable: 'Jordana', responsible: 'Chris H.', contributors: ['Jordana'], informed: [] },
          { code: 'ES7', description: 'Collect company property', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
          { code: 'ES8', description: 'Document separation', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Finance'] },
        ]),
        createProcessWithTasks('p-coo-et', 'ET', 'Employee Separation - Involuntary', 'process', [
          { code: 'ET1', description: 'Document performance issues', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Greg'] },
          { code: 'ET2', description: 'Make termination decision', accountable: 'Jordana', responsible: 'Greg', contributors: ['Jordana', 'David'], informed: [] },
          { code: 'ET3', description: 'Prepare termination documents', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
          { code: 'ET4', description: 'Conduct termination meeting', accountable: 'Jordana', responsible: 'Greg', contributors: ['Jordana'], informed: [] },
          { code: 'ET5', description: 'Revoke access immediately', accountable: 'Jordana', responsible: 'Chris H.', contributors: ['Jordana'], informed: [] },
          { code: 'ET6', description: 'Process final pay', accountable: 'Jordana', responsible: 'Finance', contributors: ['Jordana'], informed: [] },
        ]),
        createProcessWithTasks('p-coo-pm', 'PM', 'Performance Management', 'process', [
          { code: 'PM1', description: 'Set annual goals', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Employee'], informed: ['Greg'] },
          { code: 'PM2', description: 'Conduct quarterly check-ins', accountable: 'Jordana', responsible: 'Supervisor', contributors: [], informed: [] },
          { code: 'PM3', description: 'Provide ongoing feedback', accountable: 'Jordana', responsible: 'Supervisor', contributors: [], informed: [] },
          { code: 'PM4', description: 'Conduct mid-year review', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Greg'] },
          { code: 'PM5', description: 'Conduct annual review', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Greg'] },
          { code: 'PM6', description: 'Document performance', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: [] },
          { code: 'PM7', description: 'Address performance issues', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana', 'Greg'], informed: [] },
          { code: 'PM8', description: 'Create improvement plans', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Supervisor', 'Greg'], informed: [] },
        ]),
        createProcessWithTasks('p-coo-tc', 'TC', 'Training & Harvest Compliance', 'process', [
          { code: 'TC1', description: 'Define training requirements', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'TC2', description: 'Track completion status', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Supervisors'] },
          { code: 'TC3', description: 'Follow up on non-compliance', accountable: 'Jordana', responsible: 'Supervisors', contributors: ['Jordana'], informed: [] },
          { code: 'TC4', description: 'Monitor Harvest compliance', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Supervisors'] },
          { code: 'TC5', description: 'Send compliance reminders', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Staff'] },
          { code: 'TC6', description: 'Report compliance status', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['CSOG'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-coo-f-bom', 'F-BOM', 'Board of Managers Facilitation', 'function', [
          { code: 'F-BOM1', description: 'Schedule board meetings', accountable: 'Jordana', responsible: 'Jordana', contributors: ['David', 'Greg'], informed: ['Board'] },
          { code: 'F-BOM2', description: 'Prepare board materials', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: ['Board'] },
          { code: 'F-BOM3', description: 'Distribute materials in advance', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Board'] },
          { code: 'F-BOM4', description: 'Document meeting minutes', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Board'] },
          { code: 'F-BOM5', description: 'Track action items', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: ['Board'] },
        ]),
        createProcessWithTasks('p-coo-f-bi', 'F-BI', 'Business Insurance', 'function', [
          { code: 'F-BI1', description: 'Review coverage annually', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['David'] },
          { code: 'F-BI2', description: 'Coordinate renewals', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Finance'] },
          { code: 'F-BI3', description: 'Process claims', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Greg'] },
          { code: 'F-BI4', description: 'Maintain insurance documentation', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
        ]),
        createProcessWithTasks('p-coo-f-ba', 'F-BA', 'Benefits Administration', 'function', [
          { code: 'F-BA1', description: 'Manage open enrollment', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Staff'] },
          { code: 'F-BA2', description: 'Process enrollment changes', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Finance'] },
          { code: 'F-BA3', description: 'Coordinate with vendors', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
          { code: 'F-BA4', description: 'Address employee questions', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
          { code: 'F-BA5', description: 'Review benefits annually', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['David'] },
        ]),
        createProcessWithTasks('p-coo-f-eh', 'F-EH', 'Employee Handbook', 'function', [
          { code: 'F-EH1', description: 'Maintain handbook content', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
          { code: 'F-EH2', description: 'Review policies annually', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-EH3', description: 'Distribute updates', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Staff'] },
          { code: 'F-EH4', description: 'Ensure legal compliance', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: [] },
        ]),
        createProcessWithTasks('p-coo-f-tlg', 'F-TLG', 'Thought Leadership & Publications Governance', 'function', [
          { code: 'F-TLG1', description: 'Define publication standards', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl'], informed: ['CSOG'] },
          { code: 'F-TLG2', description: 'Review content for compliance', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl'], informed: [] },
          { code: 'F-TLG3', description: 'Approve external publications', accountable: 'Jordana', responsible: 'Jordana', contributors: ['David'], informed: [] },
          { code: 'F-TLG4', description: 'Maintain publication archive', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: [] },
          { code: 'F-TLG5', description: 'Coordinate with marketing', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl'], informed: [] },
        ]),
      ],
    },
    'exec-cfo': {
      processes: [
        createProcessWithTasks('p-cfo-ar', 'AR', 'Accounts Receivable', 'process', [
          { code: 'AR1', description: 'Generate and issue invoices', accountable: 'Aisha', responsible: 'Finance', contributors: ['Ashley'], informed: [] },
          { code: 'AR2', description: 'Track invoice status', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'AR3', description: 'Prepare aging reports', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'AR4', description: 'Coordinate on billing questions', accountable: 'Aisha', responsible: 'Finance', contributors: ['Ashley'], informed: [] },
          { code: 'AR5', description: 'Follow up on outstanding AR', accountable: 'Aisha', responsible: 'Finance', contributors: ['Greg'], informed: [] },
          { code: 'AR6', description: 'Escalate delinquent accounts', accountable: 'Aisha', responsible: 'Greg', contributors: [], informed: ['David'] },
        ]),
        createProcessWithTasks('p-cfo-ap', 'AP', 'Accounts Payable', 'process', [
          { code: 'AP1', description: 'Receive and log invoices', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'AP2', description: 'Route for approval', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Approver'] },
          { code: 'AP3', description: 'Process approved payments', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'AP4', description: 'Reconcile vendor statements', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'AP5', description: 'Manage vendor relationships', accountable: 'Aisha', responsible: 'Finance', contributors: ['Greg'], informed: [] },
        ]),
        createProcessWithTasks('p-cfo-mc', 'MC', 'Month-End Close', 'process', [
          { code: 'MC1', description: 'Reconcile transactions', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'MC2', description: 'Process accruals', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'MC3', description: 'Post journal entries', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'MC4', description: 'Review trial balance', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'MC5', description: 'Prepare financial statements', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'MC6', description: 'Close books', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-cfo-fr', 'FR', 'Financial Reporting', 'process', [
          { code: 'FR1', description: 'Prepare monthly P&L', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'FR2', description: 'Prepare balance sheet', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'FR3', description: 'Prepare cash flow statement', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'FR4', description: 'Create management reports', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['CSOG'] },
          { code: 'FR5', description: 'Prepare board packages', accountable: 'Aisha', responsible: 'Finance', contributors: ['Greg'], informed: ['Board'] },
        ]),
        createProcessWithTasks('p-cfo-im', 'IM', 'Inventory Lifecycle Management', 'process', [
          { code: 'IM1', description: 'Track fixed assets', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'IM2', description: 'Calculate depreciation', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'IM3', description: 'Process asset additions', accountable: 'Aisha', responsible: 'Finance', contributors: ['Requestor'], informed: [] },
          { code: 'IM4', description: 'Process asset disposals', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-cfo-sm', 'SM', 'SaaS Access & Subscription Management', 'process', [
          { code: 'SM1', description: 'Track subscriptions', accountable: 'Aisha', responsible: 'Finance', contributors: ['Chris H.'], informed: [] },
          { code: 'SM2', description: 'Monitor renewal dates', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['CSOG'] },
          { code: 'SM3', description: 'Review usage and value', accountable: 'Aisha', responsible: 'Finance', contributors: ['Chris H.'], informed: ['Greg'] },
          { code: 'SM4', description: 'Process renewals/cancellations', accountable: 'Aisha', responsible: 'Finance', contributors: ['Greg'], informed: [] },
        ]),
      ],
      functions: [],
    },
    'exec-cdao': {
      processes: [
        createProcessWithTasks('p-cdao-sa', 'SA', 'Starset Analytics LV1-LV3', 'process', [
          { code: 'SA1', description: 'Define data product requirements', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'SA2', description: 'Develop data products', accountable: 'Chris H.', responsible: 'Data Team', contributors: [], informed: [] },
          { code: 'SA3', description: 'QA data outputs', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Data Team'], informed: [] },
          { code: 'SA4', description: 'Package for delivery', accountable: 'Chris H.', responsible: 'Data Team', contributors: ['Ashley'], informed: [] },
          { code: 'SA5', description: 'Document methodology', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cdao-hmrf', 'HMRF', 'Hospital MRF Database Management', 'process', [
          { code: 'HMRF1', description: 'Collect MRF data', accountable: 'Chris H.', responsible: 'Data Team', contributors: [], informed: [] },
          { code: 'HMRF2', description: 'Process and validate data', accountable: 'Chris H.', responsible: 'Data Team', contributors: [], informed: [] },
          { code: 'HMRF3', description: 'Maintain database', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Data Team'], informed: [] },
          { code: 'HMRF4', description: 'Generate reports', accountable: 'Chris H.', responsible: 'Data Team', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cdao-ddd', 'DDD', 'Data-Driven Deliverables', 'process', [
          { code: 'DDD1', description: 'Receive deliverable request', accountable: 'Chris H.', responsible: 'Engagement Lead', contributors: ['Chris H.'], informed: [] },
          { code: 'DDD2', description: 'Develop analytics', accountable: 'Chris H.', responsible: 'Data Team', contributors: [], informed: [] },
          { code: 'DDD3', description: 'QA review', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: [] },
          { code: 'DDD4', description: 'Document and deliver', accountable: 'Chris H.', responsible: 'Data Team', contributors: ['Ashley'], informed: [] },
        ]),
        createProcessWithTasks('p-cdao-iam', 'IAM', 'Identity & Access Management', 'process', [
          { code: 'IAM1', description: 'Provision user accounts', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: [] },
          { code: 'IAM2', description: 'Manage access permissions', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['Requestor'] },
          { code: 'IAM3', description: 'Conduct access reviews', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['Greg'] },
          { code: 'IAM4', description: 'Deprovision accounts', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: [] },
          { code: 'IAM5', description: 'Monitor security compliance', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['Greg'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-cdao-f-it', 'F-IT', 'Information Technology', 'function', [
          { code: 'F-IT1', description: 'Maintain IT infrastructure', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['CSOG'] },
          { code: 'F-IT2', description: 'Manage cybersecurity', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['Greg'] },
          { code: 'F-IT3', description: 'Support end users', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: [] },
          { code: 'F-IT4', description: 'Evaluate technology needs', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['CSOG'], informed: ['Greg'] },
          { code: 'F-IT5', description: 'Implement technology solutions', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['CSOG'] },
          { code: 'F-IT6', description: 'Maintain disaster recovery', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['Greg'] },
        ]),
      ],
    },
    'exec-cgo': {
      processes: [
        createProcessWithTasks('p-cgo-bd', 'BD', 'Business Development', 'process', [
          { code: 'BD1', description: 'Identify and qualify opportunities', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['Greg'], informed: [] },
          { code: 'BD2', description: 'Evaluate opportunity fit', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['Greg', 'David'], informed: [] },
          { code: 'BD3', description: 'Draft Scope of Work', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['Ashley'], informed: [] },
          { code: 'BD4', description: 'Coordinate proposal development', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['Greg'], informed: [] },
          { code: 'BD5', description: 'Conduct client presentations', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['David'], informed: [] },
          { code: 'BD6', description: 'Coordinate contract review', accountable: 'Cheryl', responsible: 'Jordana', contributors: ['Greg'], informed: [] },
          { code: 'BD7', description: 'Track pipeline status', accountable: 'Cheryl', responsible: 'Cheryl', contributors: [], informed: ['CSOG'] },
          { code: 'BD8', description: 'Coordinate delivery handoff', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['Ashley', 'Jordana'], informed: [] },
          { code: 'BD9', description: 'Maintain CRM records', accountable: 'Cheryl', responsible: 'Cheryl', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cgo-tl', 'TL', 'Thought Leadership', 'process', [
          { code: 'TL1', description: 'Identify thought leadership topics', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['David', 'CSOG'], informed: [] },
          { code: 'TL2', description: 'Develop content', accountable: 'Cheryl', responsible: 'Author', contributors: ['Cheryl'], informed: [] },
          { code: 'TL3', description: 'Review and edit', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['Jordana'], informed: [] },
          { code: 'TL4', description: 'Publish content', accountable: 'Cheryl', responsible: 'Cheryl', contributors: [], informed: ['CSOG'] },
          { code: 'TL5', description: 'Promote content', accountable: 'Cheryl', responsible: 'Cheryl', contributors: [], informed: [] },
        ]),
        createProcessWithTasks('p-cgo-mkt', 'MKT', 'Marketing Collateral', 'process', [
          { code: 'MKT1', description: 'Identify collateral needs', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['CSOG'], informed: [] },
          { code: 'MKT2', description: 'Develop materials', accountable: 'Cheryl', responsible: 'Cheryl', contributors: [], informed: [] },
          { code: 'MKT3', description: 'Ensure brand consistency', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['Jordana'], informed: [] },
          { code: 'MKT4', description: 'Distribute materials', accountable: 'Cheryl', responsible: 'Cheryl', contributors: [], informed: ['CSOG'] },
          { code: 'MKT5', description: 'Maintain collateral library', accountable: 'Cheryl', responsible: 'Cheryl', contributors: [], informed: [] },
        ]),
      ],
      functions: [],
    },
    'exec-cso': {
      processes: [
        createProcessWithTasks('p-cso-sd', 'SD', 'Service Delivery', 'process', [
          { code: 'SD1', description: 'Establish engagement management structure', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: ['Greg'], informed: [] },
          { code: 'SD2', description: 'Coordinate deliverable production', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: ['Chris H.'], informed: [] },
          { code: 'SD3', description: 'Manage client communication', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: ['CSOG'] },
          { code: 'SD4', description: 'Monitor engagement health', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Finance'], informed: [] },
          { code: 'SD5', description: 'Coordinate QA review', accountable: 'Ashley', responsible: 'QA Reviewer', contributors: ['Greg'], informed: [] },
          { code: 'SD6', description: 'Document lessons learned', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: ['Jordana'], informed: [] },
          { code: 'SD7', description: 'Coordinate engagement closeout', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: ['Finance'], informed: [] },
        ]),
        createProcessWithTasks('p-cso-cp', 'CP', 'Contract Performance', 'process', [
          { code: 'CP1', description: 'Monitor contract performance', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Finance'], informed: ['Greg'] },
          { code: 'CP2', description: 'Track milestones', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: [] },
          { code: 'CP3', description: 'Manage margin', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Finance'], informed: ['Greg'] },
          { code: 'CP4', description: 'Report performance', accountable: 'Ashley', responsible: 'Ashley', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cso-cc', 'CC', 'Contract Closure', 'process', [
          { code: 'CC1', description: 'Confirm deliverable completion', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: ['Client'] },
          { code: 'CC2', description: 'Obtain client sign-off', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: [] },
          { code: 'CC3', description: 'Process final invoice', accountable: 'Ashley', responsible: 'Finance', contributors: ['Engagement Lead'], informed: [] },
          { code: 'CC4', description: 'Conduct closeout meeting', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Engagement Lead'], informed: ['CSOG'] },
          { code: 'CC5', description: 'Archive project materials', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: ['Jordana'], informed: [] },
        ]),
        createProcessWithTasks('p-cso-cis', 'CiS', 'Change in Scope', 'process', [
          { code: 'CiS1', description: 'Identify scope change', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: ['Ashley'] },
          { code: 'CiS2', description: 'Document change request', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: [] },
          { code: 'CiS3', description: 'Assess impact', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Finance'], informed: [] },
          { code: 'CiS4', description: 'Obtain approval', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Greg', 'Client'], informed: [] },
          { code: 'CiS5', description: 'Implement change', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: ['Finance'] },
        ]),
        createProcessWithTasks('p-cso-ca', 'CA', 'Corrective Action', 'process', [
          { code: 'CA1', description: 'Identify issue', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: ['Ashley'] },
          { code: 'CA2', description: 'Conduct root cause analysis', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Engagement Lead'], informed: [] },
          { code: 'CA3', description: 'Develop remediation plan', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Greg'], informed: [] },
          { code: 'CA4', description: 'Implement corrections', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: [] },
          { code: 'CA5', description: 'Follow up and verify', accountable: 'Ashley', responsible: 'Ashley', contributors: [], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cso-cfp', 'CFP', 'Client-Facing Publications', 'process', [
          { code: 'CFP1', description: 'Draft deliverable', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: [] },
          { code: 'CFP2', description: 'Internal review', accountable: 'Ashley', responsible: 'QA Reviewer', contributors: ['Greg'], informed: [] },
          { code: 'CFP3', description: 'Finalize and format', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: [] },
          { code: 'CFP4', description: 'Deliver to client', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: ['Ashley'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-cso-f-cdh', 'F-CDH', 'Client Confidentiality & Data Handling', 'function', [
          { code: 'F-CDH1', description: 'Establish confidentiality protocols', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'F-CDH2', description: 'Classify client data', accountable: 'Ashley', responsible: 'Engagement Lead', contributors: [], informed: [] },
          { code: 'F-CDH3', description: 'Enforce handling standards', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Chris H.'], informed: [] },
          { code: 'F-CDH4', description: 'Monitor compliance', accountable: 'Ashley', responsible: 'Ashley', contributors: [], informed: ['Greg'] },
          { code: 'F-CDH5', description: 'Train staff on protocols', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Ashley'], informed: ['Staff'] },
        ]),
      ],
    },
  };

  return executiveData[executiveId] || { processes: [], functions: [] };
}

interface TaskInput {
  code: string;
  description: string;
  accountable: string;
  responsible: string;
  contributors: string[];
  informed: string[];
}

function createProcessWithTasks(
  id: string,
  code: string,
  name: string,
  type: 'process' | 'function',
  tasks: TaskInput[]
): ProcessWithTasksAndStatus {
  const status = PROCESS_STATUS[code] || 'healthy';
  return {
    id,
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
    overallStatus: status,
    activeGapsCount: status === 'warning' ? 1 : status === 'critical' ? 2 : 0,
    tasks: tasks.map((t, i) => ({
      id: `task-${code}-${i + 1}`,
      processId: id,
      code: t.code,
      description: t.description,
      displayOrder: i + 1,
      status: 'active' as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accountable: t.accountable,
      responsible: t.responsible,
      contributors: t.contributors,
      informed: t.informed,
    })),
  };
}
