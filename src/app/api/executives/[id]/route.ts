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
          { code: 'F-EOC1', description: 'Own the "company operating system" by ensuring every core process has an accountable steward, clear outputs, KPIs, and a recurring feedback-loop cadence that keeps the firm coherent', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-EOC2', description: 'Define the executive meeting rhythm (weekly CSOG, monthly performance review, quarterly strategic review) including agenda templates, pre-reads, and decision artifacts', accountable: 'David', responsible: 'Jordana', contributors: ['Greg'], informed: [] },
          { code: 'F-EOC3', description: 'Establish and enforce decision rights (who decides what, when, and with what inputs) to prevent ambiguity, rework, and executive bottlenecks', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-EOC4', description: 'Make final calls on priority conflicts across growth, delivery, capacity, and investments when stewards are mis-aligned', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: [] },
          { code: 'F-EOC5', description: 'Define escalation thresholds and ensure issues move to the right level quickly (delivery risk, client conflict, cash constraints, reputational risk, legal risk)', accountable: 'David', responsible: 'CSOG', contributors: ['Greg', 'Jordana'], informed: [] },
          { code: 'F-EOC6', description: 'Own a CEO-level scorecard that integrates pipeline health, delivery health, margin, cash, staffing capacity, and strategic initiatives', accountable: 'David', responsible: 'Topher', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-EOC7', description: 'Follow through on commitments made in executive forums to close accountability loops and sustain operational momentum', accountable: 'David', responsible: 'Jordana', contributors: ['CSOG'], informed: [] },
          { code: 'F-EOC8', description: 'Maintain decision logs, meeting artifacts, and outcome tracking to preserve institutional knowledge and support board reporting', accountable: 'David', responsible: 'Jordana', contributors: ['Greg'], informed: ['Board of Managers'] },
          { code: 'F-EOC9', description: 'Ensure department-level cadences (Finance, Delivery, Growth, Data/IT, People Ops) roll up cleanly into the executive rhythm', accountable: 'David', responsible: 'Greg', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-EOC10', description: 'Continuously improve the operating model by identifying friction points, redundancies, and capability gaps', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-ceo-f-cai', 'F-CAI', 'Capital Allocation & Investment Review', 'function', [
          { code: 'F-CAI1', description: 'Maintain and articulate the firm\'s investment thesis (what the company will invest in, why, and what outcomes define success)', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['Board of Managers'] },
          { code: 'F-CAI2', description: 'Set the rules for allocating cash and leadership attention across delivery capacity, growth, product/data infrastructure, hiring, and innovation', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-CAI3', description: 'Define what constitutes an "investment" requiring CEO review (new hires, software platforms, data assets, brand programs, product builds, partnerships)', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-CAI4', description: 'Require investment proposals to include expected returns, timing, risks, and resourcing impacts, and make final determinations on approval', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['Board of Managers'] },
          { code: 'F-CAI5', description: 'Ensure investment decisions account for reputational, legal, operational, and opportunity risks—not just financial return', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['Board of Managers'] },
          { code: 'F-CAI6', description: 'Reallocate resources when priorities change (e.g., shifting from service delivery expansion to data asset build, or vice versa)', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-CAI7', description: 'Protect balance sheet resilience by maintaining liquidity targets and stress-testing exposure to concentration, timing, and market risks', accountable: 'David', responsible: 'Greg', contributors: ['Finance'], informed: ['Board of Managers'] },
          { code: 'F-CAI8', description: 'Periodically review the ROI and strategic value of past investments to inform future allocation decisions', accountable: 'David', responsible: 'Greg', contributors: ['Finance', 'Chris H.'], informed: ['CSOG'] },
          { code: 'F-CAI9', description: 'Align capital allocation with the firm\'s valuation narrative (growth rate, margin profile, scalability story) for future investment or exit readiness', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['Board of Managers'] },
          { code: 'F-CAI10', description: 'Ensure the firm is positioned to access external capital (debt, equity, grants) if and when strategic opportunities require it', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['Board of Managers'] },
        ]),
        createProcessWithTasks('p-ceo-f-qad', 'F-QAD', 'Quality Assurance & Delivery Standards', 'function', [
          { code: 'F-QAD1', description: 'Define the non-negotiable quality standards for Third Horizon deliverables (rigor, clarity, defensibility, client usability, and aesthetic professionalism)', accountable: 'David', responsible: 'David', contributors: ['Ashley', 'Jordana', 'Greg'], informed: ['CSOG'] },
          { code: 'F-QAD2', description: 'Ensure the firm\'s analytical and strategic methods are consistent, transparent, and reproducible across teams and engagements', accountable: 'David', responsible: 'David', contributors: ['Chris H.', 'Andy', 'Bobby'], informed: ['CSOG'] },
          { code: 'F-QAD3', description: 'Personally review or require executive review of high-stakes deliverables (public-facing, politically sensitive, or client-critical outputs)', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['Ashley'] },
          { code: 'F-QAD4', description: 'Serve as the ultimate escalation point when delivery quality is at risk, timelines are forcing compromises, or client expectations are misaligned', accountable: 'David', responsible: 'David', contributors: ['Chris H.', 'Greg', 'Ashley'], informed: ['Jordana'] },
          { code: 'F-QAD5', description: 'Maintain a top-level view of engagement health across the portfolio and intervene early where there are signals of slippage or misalignment', accountable: 'David', responsible: 'David', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-QAD6', description: 'Sponsor corrective action when engagements drift (scope, timelines, client trust) and ensure the firm responds decisively and professionally', accountable: 'David', responsible: 'David', contributors: ['Ashley', 'Greg'], informed: ['CSOG'] },
          { code: 'F-QAD7', description: 'Require defensible sourcing and documentation for any data-driven claims made in client deliverables or public communications', accountable: 'David', responsible: 'Chris H.', contributors: ['Andy', 'Bobby'], informed: ['Ashley'] },
          { code: 'F-QAD8', description: 'Reinforce a culture where quality is non-negotiable and where team members feel empowered to flag risks without fear of blame', accountable: 'David', responsible: 'David', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-QAD9', description: 'Define client satisfaction standards (responsiveness, communication tone, executive access, deliverable polish) and hold the firm accountable to them', accountable: 'David', responsible: 'Ashley', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-QAD10', description: 'Ensure the firm\'s proprietary IP (frameworks, tools, data assets) is consistently applied in client delivery', accountable: 'David', responsible: 'Greg', contributors: ['Chris H.', 'Ashley'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-ceo-f-pem', 'F-PEM', 'Partnership & Ecosystem Management', 'function', [
          { code: 'F-PEM1', description: 'Define which partnerships matter (trade groups, health systems, payers, policy orgs, vendors, data partners) and what each relationship is for', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['CSOG'] },
          { code: 'F-PEM2', description: 'Decide where the firm invests relationship capital vs. where it remains opportunistic to prevent dilution of attention', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['CSOG'] },
          { code: 'F-PEM3', description: 'Set the rules for partnership structures (referrals, joint proposals, data sharing, co-development, revenue share, non-competes)', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['CSOG'] },
          { code: 'F-PEM4', description: 'Ensure partnerships have clear objectives, roles, mutual commitments, and review cadences to avoid vague "handshake partnerships"', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-PEM5', description: 'Maintain a high-trust referral ecosystem that drives pipeline quality and reduces acquisition friction', accountable: 'David', responsible: 'David', contributors: ['Cheryl'], informed: ['CSOG'] },
          { code: 'F-PEM6', description: 'Protect the firm\'s reputation by evaluating partner integrity, political exposure, conflicts of interest, and delivery quality risk', accountable: 'David', responsible: 'David', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-PEM7', description: 'Convene and lead multi-party partnerships where Third Horizon plays a coordinating or backbone role', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Cheryl'], informed: ['CSOG'] },
          { code: 'F-PEM8', description: 'Stay informed on ecosystem shifts (competitor partnerships, regulatory changes, market realignment) that affect Third Horizon\'s positioning', accountable: 'David', responsible: 'Cheryl', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-PEM9', description: 'Resolve partnership conflicts (scope disputes, exclusivity tensions, performance concerns) before they harm client delivery or reputation', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-PEM10', description: 'Approve co-marketing and co-branding activities to ensure consistency with Third Horizon\'s positioning and risk tolerance', accountable: 'David', responsible: 'Cheryl', contributors: ['Jordana'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-ceo-f-sp', 'F-SP', 'Strategic Planning', 'function', [
          { code: 'F-SP1', description: 'Own the firm\'s long-range narrative: What Third Horizon is becoming, why it matters, and what makes it structurally different', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-SP2', description: 'Actively manage near-term execution vs. mid-term capability build vs. long-term innovation so "today\'s delivery" doesn\'t consume the company', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-SP3', description: 'Lead the annual planning cycle including goals, capability priorities, staffing posture, investment themes, and measurable outcomes', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-SP4', description: 'Identify key assumptions underlying strategy (market demand, policy shifts, capital access, talent availability) and require periodic validation', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-SP5', description: 'Define how the firm is positioned in the market, what it will be known for, and what it will explicitly not do', accountable: 'David', responsible: 'David', contributors: ['Cheryl', 'Greg'], informed: ['CSOG'] },
          { code: 'F-SP6', description: 'Ensure strategic priorities translate into process changes, capability development, and role clarity', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-SP7', description: 'Sponsor strategic initiatives that require cross-functional effort and protect them from being deprioritized by delivery pressures', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
          { code: 'F-SP8', description: 'Ensure the engagement portfolio reflects strategic intent—client mix, capability deployment, market presence, and margin profile', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Ashley'], informed: ['CSOG'] },
          { code: 'F-SP9', description: 'Align staffing, skills, and capacity planning with strategic priorities and growth assumptions', accountable: 'David', responsible: 'David', contributors: ['Jordana', 'Greg'], informed: ['CSOG'] },
          { code: 'F-SP10', description: 'Identify and invest in capabilities that will differentiate Third Horizon structurally over time (data assets, methods, talent, reputation)', accountable: 'David', responsible: 'David', contributors: ['CSOG'], informed: ['Board of Managers'] },
        ]),
        createProcessWithTasks('p-ceo-f-crc', 'F-CRC', 'Client Executive Relationship Continuity', 'function', [
          { code: 'F-CRC1', description: 'Serve as executive sponsor for priority clients to protect trust, continuity, and strategic alignment', accountable: 'David', responsible: 'David', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-CRC2', description: 'Ensure key client relationships have continuity plans that survive staff turnover, scope shifts, or political changes', accountable: 'David', responsible: 'Ashley', contributors: ['Client Services'], informed: ['CSOG'] },
          { code: 'F-CRC3', description: 'Maintain a high-level understanding of client stakeholder dynamics (formal authority, informal influence, blockers, champions)', accountable: 'David', responsible: 'David', contributors: ['Ashley', 'Greg', 'Cheryl'], informed: ['CSOG'] },
          { code: 'F-CRC4', description: 'Set expectations directly with client executives on outcomes, boundaries, timelines, and roles to prevent misalignment downstream', accountable: 'David', responsible: 'Ashley', contributors: ['Client Services'], informed: ['CSOG'] },
          { code: 'F-CRC5', description: 'Personally intervene in escalations involving trust risk, political sensitivity, scope conflict, or reputational exposure', accountable: 'David', responsible: 'David', contributors: ['Ashley', 'Client Team'], informed: ['CSOG'] },
          { code: 'F-CRC6', description: 'Sponsor renewal and expansion conversations where CEO-level credibility increases close likelihood and pricing integrity', accountable: 'David', responsible: 'David', contributors: ['Ashley', 'Greg'], informed: ['CSOG'] },
          { code: 'F-CRC7', description: 'Reinforce the strategic value Third Horizon provides through periodic executive touchpoints beyond day-to-day delivery', accountable: 'David', responsible: 'David', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-CRC8', description: 'Coordinate external-facing narratives (case studies, references, testimonials) with clients to ensure alignment and mutual benefit', accountable: 'David', responsible: 'Cheryl', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-CRC9', description: 'Ensure priority clients feel confident in Third Horizon\'s capacity, stability, and commitment to their success', accountable: 'David', responsible: 'David', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-CRC10', description: 'Cultivate client executives as references and advocates for new business development', accountable: 'David', responsible: 'Cheryl', contributors: ['Ashley'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-ceo-f-cpe', 'F-CPE', 'Community & Political Engagement', 'function', [
          { code: 'F-CPE1', description: 'Protect and strengthen Third Horizon\'s credibility with community stakeholders by ensuring engagements reflect authentic community-centered values', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Jordana'], informed: ['CSOG'] },
          { code: 'F-CPE2', description: 'Evaluate political exposure of initiatives and ensure the firm navigates contested terrain with discipline and situational awareness', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-CPE3', description: 'Maintain relationships with relevant state and local agencies, policy leaders, and public-sector stakeholders where strategic', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-CPE4', description: 'Convene and align coalitions when multi-party initiatives require shared commitments (providers, payers, philanthropy, community orgs, government)', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Cheryl'], informed: ['CSOG'] },
          { code: 'F-CPE5', description: 'Review major public narratives tied to the firm\'s work to prevent reputational harm or unintended political consequences', accountable: 'David', responsible: 'David', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-CPE6', description: 'Ensure community engagement is not performative by aligning strategy, delivery practices, and communications with stated values', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-CPE7', description: 'Maintain strategic relationships with philanthropic partners whose missions align with Third Horizon\'s community health focus', accountable: 'David', responsible: 'David', contributors: ['Cheryl'], informed: ['CSOG'] },
          { code: 'F-CPE8', description: 'Define where Third Horizon will take public positions on policy or community issues and ensure alignment with business strategy', accountable: 'David', responsible: 'David', contributors: ['Greg', 'Cheryl'], informed: ['CSOG'] },
          { code: 'F-CPE9', description: 'Navigate controversies or conflicts that arise from the firm\'s community-facing work with transparency and integrity', accountable: 'David', responsible: 'David', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-CPE10', description: 'Maintain Third Horizon\'s presence and trust in key geographies where the firm has deep client and community relationships', accountable: 'David', responsible: 'David', contributors: ['Greg'], informed: ['CSOG'] },
        ]),
      ],
    },
    'exec-president': {
      processes: [
        createProcessWithTasks('p-pres-cf', 'CF', 'Cash Flow Management', 'process', [
          { code: 'CF1', description: 'A recurring weekly finance meeting is scheduled and convened', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'CF2', description: 'Current cash balances and projected cash position are prepared for review', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'CF3', description: 'Outstanding vendor payables and upcoming obligations are reviewed', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'CF4', description: 'Accounts with delayed or at-risk collections are identified and discussed', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'CF5', description: 'Potential cash flow constraints or timing risks are surfaced for discussion', accountable: 'Greg', responsible: 'Greg', contributors: ['Finance', 'David'], informed: ['Jordana'] },
          { code: 'CF6', description: 'The cash tracking model is updated to reflect confirmed contractual cash commitments', accountable: 'Greg', responsible: 'Jordana', contributors: ['David'], informed: ['Finance'] },
          { code: 'CF7', description: 'Follow-up actions related to collections, payments, or cash planning are documented', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'CF8', description: 'Material changes to cash position are monitored throughout the week', accountable: 'Greg', responsible: 'Greg', contributors: ['Finance'], informed: ['David', 'Jordana'] },
        ]),
        createProcessWithTasks('p-pres-cr', 'CR', 'Compensation & Role Changes', 'process', [
          { code: 'CR1', description: 'A notification is issued 30 days prior to an employee\'s annual review to initiate the compensation review cycle', accountable: 'Greg', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Finance'] },
          { code: 'CR2', description: 'The employee\'s eligibility for review is confirmed based on tenure, role, and prior review timing', accountable: 'Greg', responsible: 'Jordana', contributors: ['Supervisor'], informed: ['Finance'] },
          { code: 'CR3', description: 'Employee performance is evaluated based on the completed annual review and supervisor input', accountable: 'Greg', responsible: 'Supervisor', contributors: ['CSOG'], informed: ['Finance'] },
          { code: 'CR4', description: 'The employee\'s current compensation is reviewed against the applicable pay band and internal equity considerations', accountable: 'Greg', responsible: 'Jordana', contributors: ['CSOG'], informed: ['Supervisor'] },
          { code: 'CR5', description: 'A compensation recommendation is developed, including merit-based increases outside of standard cost-of-living or inflationary adjustments when applicable', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['Finance'] },
          { code: 'CR6', description: 'The compensation recommendation is submitted for executive approval', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['Finance', 'Jordana'] },
          { code: 'CR7', description: 'Final approval of compensation changes is granted', accountable: 'Greg', responsible: 'David', contributors: ['Finance'], informed: ['Finance'] },
          { code: 'CR8', description: 'Compensation decisions are communicated to the employee following completion of the annual review', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['Finance'] },
          { code: 'CR9', description: 'Finance is notified of approved compensation changes for payroll implementation', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['Greg'] },
          { code: 'CR10', description: 'Employee compensation records are updated in BambooHR and payroll systems', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['Finance'] },
        ]),
        createProcessWithTasks('p-pres-tp', 'TP', 'Tax Preparation and Filing', 'process', [
          { code: 'TP1', description: 'All employees and contracted parties requiring tax reporting for the prior year are identified', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'TP2', description: 'Required 1099 forms are generated and prepared for contracted parties', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'TP3', description: 'Completed 1099 forms are distributed to applicable parties in accordance with filing deadlines', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'TP4', description: 'Financial records are finalized and prepared for transfer to the external tax firm', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'TP5', description: 'Financial documentation is securely transferred to Mandell & Associates for tax preparation', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'TP6', description: 'Draft tax filings are reviewed iteratively for accuracy, completeness, and compliance', accountable: 'Greg', responsible: 'Greg', contributors: ['Finance', 'Jordana'], informed: ['David'] },
          { code: 'TP7', description: 'A summary briefing of the draft tax filings is conducted with executive leadership', accountable: 'Greg', responsible: 'Greg', contributors: ['Finance'], informed: ['David', 'Jordana'] },
          { code: 'TP8', description: 'Any requested edits or clarifications are incorporated into the final tax filings', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'TP9', description: 'Final tax filings are formally approved for submission', accountable: 'Greg', responsible: 'Finance', contributors: ['David'], informed: ['Jordana'] },
          { code: 'TP10', description: 'Approved tax filings are submitted to the appropriate authorities', accountable: 'Greg', responsible: 'Greg', contributors: ['Finance'], informed: ['Jordana', 'David'] },
          { code: 'TP11', description: 'Final tax records are archived in the company cloud repository', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'TP12', description: 'A hard copy of finalized tax filings is printed and stored at the designated office location per the Operating Agreement', accountable: 'Greg', responsible: 'David', contributors: ['Finance'], informed: ['Jordana'] },
        ]),
        createProcessWithTasks('p-pres-em', 'EM', 'Expense Management', 'process', [
          { code: 'EM1', description: 'Business expenses submitted by staff are collected on a monthly basis', accountable: 'Greg', responsible: 'All Staff', contributors: ['Finance'], informed: ['Jordana'] },
          { code: 'EM2', description: 'Submitted expenses are reviewed for completeness and policy compliance', accountable: 'Greg', responsible: 'Finance', contributors: ['Supervisors'], informed: ['David'] },
          { code: 'EM3', description: 'Expenses eligible for reimbursement are identified and validated', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'EM4', description: 'Approved reimbursements are prepared for payment processing', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['David'] },
          { code: 'EM5', description: 'Expenses that violate policy or require clarification are flagged', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['David'] },
          { code: 'EM6', description: 'Material or repeated policy issues are escalated for review', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['Finance'] },
          { code: 'EM7', description: 'Expense approval or denial decisions are communicated to employees', accountable: 'Greg', responsible: 'Supervisors', contributors: ['Jordana'], informed: ['David', 'Finance'] },
          { code: 'EM8', description: 'Final expense records are logged for financial reporting and audit purposes', accountable: 'Greg', responsible: 'Finance', contributors: [], informed: ['David'] },
        ]),
        createProcessWithTasks('p-pres-pa', 'PA', 'Procurement & Vendor Approval', 'process', [
          { code: 'PA1', description: 'A need for external resources or vendors is identified, often tied to client delivery or business development activities', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'PA2', description: 'A request is submitted outlining the purpose, scope, and estimated cost of the procurement', accountable: 'Greg', responsible: 'CSOG', contributors: ['Finance'], informed: ['David', 'Jordana'] },
          { code: 'PA3', description: 'The request is reviewed for alignment with client needs, budget, and strategic priorities', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'PA4', description: 'Available budget and financial impact are assessed prior to approval', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'PA5', description: 'Final approval for the expenditure is granted', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'PA6', description: 'Approved procurement requests are communicated to COO for execution', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'PA7', description: 'Vendor contracts, purchases, or subscriptions are executed as approved', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'PA8', description: 'Vendor details and cost commitments are recorded for tracking and oversight', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
        ]),
        createProcessWithTasks('p-pres-vm', 'VM', 'Contractor/Vendor Management', 'process', [
          { code: 'VM1', description: 'A need for contractor or 1099 support is identified based on business or client requirements', accountable: 'Greg', responsible: 'Ashley', contributors: ['Jordana'], informed: ['David'] },
          { code: 'VM2', description: 'Contractor engagement terms and justification are reviewed and approved', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'VM3', description: 'Required tax and compliance documentation is collected from the contractor', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['David'] },
          { code: 'VM4', description: 'A contractor record is created for tracking and payment purposes', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'VM5', description: 'Scope of work, duration, and compensation terms are documented', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'VM6', description: 'Contractors are provisioned with limited system access appropriate to their role', accountable: 'David', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'VM7', description: 'Contractor work and deliverables are monitored for quality and completion', accountable: 'Greg', responsible: 'Ashley', contributors: ['Jordana'], informed: ['David'] },
          { code: 'VM8', description: 'Approved contractor invoices are processed for payment', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'VM9', description: 'Contractor access is terminated and records are closed at the end of engagement', accountable: 'Greg', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
          { code: 'VM10', description: 'Contractor records are updated to reflect engagement completion or renewal', accountable: 'David', responsible: 'Jordana', contributors: ['Finance'], informed: ['David'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-pres-f-ip', 'F-IP', 'Intellectual Property Governance', 'function', [
          { code: 'F-IP1', description: 'Identify and classify intellectual property generated through client work, internal development, and thought leadership', accountable: 'Greg', responsible: 'Greg', contributors: ['Chris H.', 'David', 'Cheryl'], informed: ['CSOG', 'Board of Managers'] },
          { code: 'F-IP2', description: 'Determine ownership status of IP based on contracts, employment agreements, and engagement terms', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-IP3', description: 'Establish guidelines for internal and external use of company intellectual property', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['CSOG'] },
          { code: 'F-IP4', description: 'Assess and mitigate risks related to IP misuse, infringement, or unintended disclosure', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['CSOG'] },
          { code: 'F-IP5', description: 'Oversee approvals for publication, reuse, or external distribution of IP assets', accountable: 'Greg', responsible: 'Greg', contributors: ['CSOG'], informed: ['David'] },
          { code: 'F-IP6', description: 'Ensure IP assets are stored, versioned, and managed in approved repositories', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-IP7', description: 'Ensure IP development and reuse aligns with strategic priorities and brand positioning', accountable: 'Greg', responsible: 'Greg', contributors: ['David', 'Jordana'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-pres-f-oc', 'F-OC', 'Organizational Chart Management', 'function', [
          { code: 'F-OC1', description: 'Lead the process for proposing, reviewing, and implementing changes to the organizational chart', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['Jordana'] },
          { code: 'F-OC2', description: 'Confirm that role definitions and reporting lines align with the approved org chart', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['Jordana'] },
          { code: 'F-OC3', description: 'Ensure all staff are informed of the current organizational structure', accountable: 'Greg', responsible: 'CSOG', contributors: ['David', 'Jordana'], informed: ['Board of Managers'] },
          { code: 'F-OC4', description: 'Maintain an authoritative and up-to-date version of the org chart', accountable: 'Greg', responsible: 'Greg', contributors: ['David'], informed: ['Jordana'] },
          { code: 'F-OC5', description: 'Ensure changes to the org chart follow established governance and approval norms', accountable: 'Greg', responsible: 'Greg', contributors: ['David', 'Board of Managers'], informed: ['Jordana'] },
        ]),
        createProcessWithTasks('p-pres-f-er', 'F-ER', 'Enterprise Risk Management', 'function', [
          { code: 'F-ER1', description: 'Identify enterprise, operational, financial, legal, and reputational risks facing the firm', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana', 'David'], informed: ['CSOG'] },
          { code: 'F-ER2', description: 'Assess identified risks based on likelihood, impact, and exposure to the business', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-ER3', description: 'Maintain a centralized risk register documenting risks, mitigation strategies, and ownership', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-ER4', description: 'Ensure appropriate mitigation plans are developed and implemented for material risks', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-ER5', description: 'Periodically brief leadership on emerging risks and changes in risk posture', accountable: 'Greg', responsible: 'Greg', contributors: ['CSOG'], informed: ['David'] },
          { code: 'F-ER6', description: 'Ensure material risks are escalated to executive leadership in a timely manner', accountable: 'Greg', responsible: 'Greg', contributors: ['CSOG'], informed: ['David'] },
          { code: 'F-ER7', description: 'Establish and maintain a recurring cadence for enterprise risk review', accountable: 'Greg', responsible: 'Greg', contributors: ['CSOG'], informed: ['David'] },
        ]),
        createProcessWithTasks('p-pres-f-km', 'F-KM', 'Knowledge Management', 'function', [
          { code: 'F-KM1', description: 'Identify reusable knowledge assets generated through client work, research, and internal initiatives', accountable: 'Greg', responsible: 'Ashley', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-KM2', description: 'Establish standards for capturing insights, methodologies, and artifacts from engagements', accountable: 'Greg', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-KM3', description: 'Maintain centralized repositories for approved knowledge assets', accountable: 'Greg', responsible: 'Jordana', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-KM4', description: 'Ensure staff can efficiently locate and access approved knowledge resources', accountable: 'Greg', responsible: 'Jordana', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-KM5', description: 'Promote reuse of existing knowledge assets to improve efficiency and consistency', accountable: 'Greg', responsible: 'CSOG', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-KM6', description: 'Ensure knowledge assets meet quality, accuracy, and relevance standards before reuse', accountable: 'Greg', responsible: 'Ashley', contributors: ['CSOG'], informed: ['David'] },
          { code: 'F-KM7', description: 'Protect critical institutional knowledge during employee transitions', accountable: 'Greg', responsible: 'Greg', contributors: ['CSOG'], informed: ['David'] },
        ]),
      ],
    },
    'exec-coo': {
      processes: [
        createProcessWithTasks('p-coo-oc', 'OC', 'Operationalizing Client Contracts', 'process', [
          { code: 'OC1', description: 'Review and execute client contracts, including Business Associate Agreements, ensuring legal compliance and alignment with organizational standards. Store documents in SharePoint', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg', 'Ashley', 'Cheryl'], informed: ['David', 'Finance'] },
          { code: 'OC2', description: 'Monitor the status of contract execution processes, ensuring timely completion and proper documentation of all contractual milestones using the Master Contract Tracker', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Ashley', 'Chris H.'], informed: ['CSOG'] },
          { code: 'OC3', description: 'Establish revenue recognition and cash recognition schedules and update the year\'s Pro Forma and Cash Tracker details', accountable: 'Greg', responsible: 'Jordana', contributors: ['Ashley', 'Chris H.'], informed: ['David', 'Cheryl', 'Finance'] },
          { code: 'OC4', description: 'Configure contracts in internal systems, including project codes, billing parameters, and tracking mechanisms (Pro Forma, NetSuite, Harvest)', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'OC5', description: 'Facilitate the transition of client engagements from Business Development to Delivery teams, ensuring continuity of information and client expectations', accountable: 'Ashley', responsible: 'Cheryl', contributors: ['Jordana', 'Chris H.'], informed: ['David', 'Greg', 'Finance'] },
        ]),
        createProcessWithTasks('p-coo-wd', 'WD', 'Website Development & Maintenance', 'process', [
          { code: 'WD1', description: 'Establish overall website strategy and positioning to reflect the firm\'s brand and service offerings', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Chris H.', 'Greg'], informed: ['CSOG'] },
          { code: 'WD2', description: 'Maintain regular content updates and technical maintenance to ensure site performance and accuracy', accountable: 'Jordana', responsible: 'Chris H.', contributors: ['Cheryl'], informed: ['CSOG'] },
          { code: 'WD3', description: 'Develop and maintain client-facing content, including services descriptions and case examples', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'WD4', description: 'Develop and maintain growth-facing content, including value propositions and market positioning', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'WD5', description: 'Final review and publishing approval for all website content changes', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl', 'Greg'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-tm', 'TM', 'Template Generation and Management', 'process', [
          { code: 'TM1', description: 'Identify needs for new templates based on client delivery, business development, or operational requirements', accountable: 'Jordana', responsible: 'Ashley', contributors: ['Cheryl', 'Chris H.'], informed: ['CSOG'] },
          { code: 'TM2', description: 'Develop templates that meet identified needs while maintaining brand standards and quality expectations', accountable: 'Jordana', responsible: 'Ashley', contributors: ['Cheryl'], informed: ['CSOG'] },
          { code: 'TM3', description: 'Review and approve templates for use across the organization', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'TM4', description: 'Distribute approved templates and communicate usage guidelines to relevant teams', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'TM5', description: 'Maintain version control for all templates and archive outdated versions', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Ashley'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-st', 'ST', 'Staffing', 'process', [
          { code: 'ST1', description: 'Identify staffing needs based on capacity requirements, strategic priorities, and attrition', accountable: 'Jordana', responsible: 'BU Leads', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'ST2', description: 'Define role requirements and obtain approval for new positions', accountable: 'Jordana', responsible: 'Greg', contributors: ['David'], informed: ['Finance'] },
          { code: 'ST3', description: 'Develop recruitment plans including sourcing strategies and timelines', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'ST4', description: 'Source candidates through job boards, referrals, and direct outreach', accountable: 'Jordana', responsible: 'Jordana', contributors: ['BU Leads'], informed: ['CSOG'] },
          { code: 'ST5', description: 'Conduct interviews and select candidates based on role requirements and cultural fit', accountable: 'Jordana', responsible: 'Hiring Manager', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'ST6', description: 'Extend offers and negotiate terms within approved parameters', accountable: 'Jordana', responsible: 'Greg', contributors: ['Finance'], informed: ['David'] },
          { code: 'ST7', description: 'Complete background checks and employment verification', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['Greg'] },
          { code: 'ST8', description: 'Confirm hire and initiate onboarding process', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-eo', 'EO', 'Employee Onboarding & Orientation', 'process', [
          { code: 'EO1', description: 'A new employee profile is created in BambooHR to initiate onboarding workflows', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['CSOG'] },
          { code: 'EO2', description: 'Schedule orientation sessions and communicate start date logistics to new hire', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Supervisor'], informed: ['CSOG'] },
          { code: 'EO3', description: 'Provision system access including email, collaboration tools, and role-specific applications', accountable: 'Jordana', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'EO4', description: 'Conduct orientation covering company policies, benefits, tools, and culture', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: [] },
          { code: 'EO5', description: 'Assign an onboarding buddy to support integration and answer questions', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'EO6', description: 'Complete all required employment documentation including tax forms and policy acknowledgments', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['CSOG'] },
          { code: 'EO7', description: 'A structured 90-day onboarding and integration review is conducted and documented', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-es', 'ES', 'Employee Separation - Voluntary', 'process', [
          { code: 'ES1', description: 'Receive and document employee resignation', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'ES2', description: 'Schedule exit interview with departing employee', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Supervisor'], informed: ['CSOG'] },
          { code: 'ES3', description: 'Develop knowledge transfer plan to preserve institutional knowledge', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'ES4', description: 'Terminate system access on final day of employment', accountable: 'Jordana', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'ES5', description: 'Process final paycheck including accrued PTO payout', accountable: 'Jordana', responsible: 'Finance', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'ES6', description: 'Communicate benefits continuation options (COBRA, etc.)', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['CSOG'] },
          { code: 'ES7', description: 'Conduct exit interview and document feedback', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'ES8', description: 'Update employee records to reflect separation', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-et', 'ET', 'Employee Separation - Involuntary', 'process', [
          { code: 'ET1', description: 'Document performance or conduct issues leading to termination decision', accountable: 'Jordana', responsible: 'Supervisor', contributors: ['Jordana'], informed: ['Greg'] },
          { code: 'ET2', description: 'Review termination recommendation with executive leadership', accountable: 'Jordana', responsible: 'Greg', contributors: ['David'], informed: ['Finance'] },
          { code: 'ET3', description: 'Ensure termination complies with legal requirements and company policies', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['David'] },
          { code: 'ET4', description: 'Plan termination meeting logistics and communications', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['Finance'] },
          { code: 'ET5', description: 'Conduct termination meeting with appropriate parties present', accountable: 'Jordana', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'ET6', description: 'Immediately revoke system access upon termination', accountable: 'Jordana', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'ET7', description: 'Process final pay and any applicable severance', accountable: 'Jordana', responsible: 'Finance', contributors: ['Jordana'], informed: ['Greg'] },
          { code: 'ET8', description: 'Retain all documentation related to the separation for compliance purposes', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-coo-pm', 'PM', 'Performance Management', 'process', [
          { code: 'PM1', description: 'A centralized schedule of annual reviews and quarterly development plans is maintained', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: ['All Staff'] },
          { code: 'PM2', description: 'Distribute self-assessment forms to employees prior to review period', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Supervisors'], informed: ['CSOG'] },
          { code: 'PM3', description: 'Managers complete performance assessments for direct reports', accountable: 'Jordana', responsible: 'Supervisors', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'PM4', description: 'Conduct calibration reviews to ensure consistency across the organization', accountable: 'Jordana', responsible: 'Greg', contributors: ['David'], informed: ['CSOG'] },
          { code: 'PM5', description: 'Facilitate performance discussions between managers and employees', accountable: 'Jordana', responsible: 'Supervisors', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'PM6', description: 'Create individual development plans based on performance outcomes', accountable: 'Jordana', responsible: 'Supervisors', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'PM7', description: 'A consolidated status summary of reviews and development plans is prepared monthly', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: ['David'] },
          { code: 'PM8', description: 'Ensure quarterly check-ins occur between formal review cycles', accountable: 'Jordana', responsible: 'Supervisors', contributors: ['Jordana'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-coo-tc', 'TC', 'Training & Harvest Compliance', 'process', [
          { code: 'TC1', description: 'Assess training needs based on role requirements, compliance obligations, and skill gaps', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Supervisors'], informed: ['CSOG'] },
          { code: 'TC2', description: 'Maintain training calendar with scheduled sessions and completion deadlines', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'TC3', description: 'Deliver training and track completion in appropriate systems', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'TC4', description: 'Monitor Harvest time entry compliance to ensure accurate project tracking', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['CSOG'] },
          { code: 'TC5', description: 'A weekly compliance report is generated summarizing training and Harvest status', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'TC6', description: 'Escalate repeated non-compliance issues to supervisors and leadership', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Supervisors'], informed: ['Greg'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-coo-f-bom', 'F-BOM', 'Board of Managers Facilitation', 'function', [
          { code: 'F-BOM1', description: 'Establish and maintain the Board of Managers meeting calendar and recurring cadence', accountable: 'Jordana', responsible: 'Jordana', contributors: ['David'], informed: ['Board of Managers'] },
          { code: 'F-BOM2', description: 'Develop meeting agendas in coordination with executive leadership', accountable: 'Jordana', responsible: 'Jordana', contributors: ['David', 'Greg'], informed: ['Board of Managers'] },
          { code: 'F-BOM3', description: 'Prepare and distribute meeting materials including financials, updates, and strategic items', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance', 'CSOG'], informed: ['Board of Managers'] },
          { code: 'F-BOM4', description: 'Facilitate Board meetings and ensure productive discussion', accountable: 'Jordana', responsible: 'David', contributors: ['Jordana'], informed: ['Board of Managers'] },
          { code: 'F-BOM5', description: 'Document meeting minutes and action items', accountable: 'Jordana', responsible: 'Jordana', contributors: ['David'], informed: ['Board of Managers'] },
          { code: 'F-BOM6', description: 'Coordinate follow-up on action items and Board requests', accountable: 'Jordana', responsible: 'Jordana', contributors: ['CSOG'], informed: ['Board of Managers'] },
        ]),
        createProcessWithTasks('p-coo-f-bi', 'F-BI', 'Business Insurance', 'function', [
          { code: 'F-BI1', description: 'Assess business insurance needs including professional liability, general liability, cyber, and D&O', accountable: 'Jordana', responsible: 'Greg', contributors: ['Jordana'], informed: ['David'] },
          { code: 'F-BI2', description: 'Select and procure appropriate insurance policies', accountable: 'Jordana', responsible: 'Greg', contributors: ['Finance'], informed: ['David'] },
          { code: 'F-BI3', description: 'Verify coverage meets contractual and operational requirements', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-BI4', description: 'Manage policy renewals and coverage adjustments', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['Greg'] },
          { code: 'F-BI5', description: 'Coordinate insurance claims when incidents occur', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['David'] },
        ]),
        createProcessWithTasks('p-coo-f-ba', 'F-BA', 'Benefits Administration', 'function', [
          { code: 'F-BA1', description: 'Design and select benefits plans including health, dental, vision, retirement, and other offerings', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-BA2', description: 'Manage annual open enrollment process', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['All Staff'] },
          { code: 'F-BA3', description: 'Communicate benefits options and changes to employees', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['All Staff'] },
          { code: 'F-BA4', description: 'Process benefits enrollments and changes', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['CSOG'] },
          { code: 'F-BA5', description: 'Provide ongoing support for benefits questions and issues', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['All Staff'] },
          { code: 'F-BA6', description: 'Ensure benefits compliance with regulatory requirements (ACA, ERISA, etc.)', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Finance'], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-coo-f-eh', 'F-EH', 'Employee Handbook', 'function', [
          { code: 'F-EH1', description: 'Review and update handbook annually or as needed for policy changes', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-EH2', description: 'Develop new policies as operational needs evolve', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-EH3', description: 'Ensure handbook policies comply with applicable employment laws', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['David'] },
          { code: 'F-EH4', description: 'Distribute handbook to all employees and new hires', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['All Staff'] },
          { code: 'F-EH5', description: 'Track employee acknowledgment of handbook receipt', accountable: 'Jordana', responsible: 'Jordana', contributors: [], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-coo-f-tlg', 'F-TLG', 'Thought Leadership & Publications Governance', 'function', [
          { code: 'F-TLG1', description: 'Establish thought leadership strategy aligned with business objectives', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Greg', 'David'], informed: ['CSOG'] },
          { code: 'F-TLG2', description: 'Oversee development of thought leadership content', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'F-TLG3', description: 'Review content for quality, accuracy, and compliance with brand standards', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl'], informed: ['Greg'] },
          { code: 'F-TLG4', description: 'Manage approval workflow for external publications', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-TLG5', description: 'Coordinate publication and distribution of approved content', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-TLG6', description: 'Track impact and engagement metrics for thought leadership content', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Chris H.'], informed: ['CSOG'] },
        ]),
      ],
    },
    'exec-cfo': {
      processes: [
        createProcessWithTasks('p-cfo-ar', 'AR', 'Accounts Receivable', 'process', [
          { code: 'AR1', description: 'Enter contract terms, including billing schedules and payment terms, into financial systems to enable accurate invoicing and revenue tracking', accountable: 'Jordana', responsible: 'Jordana', contributors: ['David', 'Greg', 'Ashley', 'Cheryl'], informed: [] },
          { code: 'AR2', description: 'Generate client invoices based on contract terms, project milestones, and time and materials tracking', accountable: 'Jordana', responsible: 'Finance', contributors: ['Greg', 'Ashley'], informed: ['David', 'Chris H.', 'Cheryl'] },
          { code: 'AR3', description: 'Review and approve client invoices for accuracy and completeness before sending to clients', accountable: 'Jordana', responsible: 'Finance', contributors: ['David', 'Greg', 'Ashley'], informed: ['Chris H.', 'Cheryl'] },
          { code: 'AR4', description: 'Distribute invoices to clients through appropriate channels and ensure receipt confirmation', accountable: 'Jordana', responsible: 'Finance', contributors: ['Greg'], informed: ['David', 'Greg', 'Ashley', 'Cheryl'] },
          { code: 'AR5', description: 'Follow up on outstanding accounts receivable and manage collections processes to ensure timely payment', accountable: 'Jordana', responsible: 'Finance', contributors: ['David', 'Greg', 'Ashley', 'Cheryl'], informed: ['Chris H.'] },
          { code: 'AR6', description: 'Monitor accounts receivable aging and generate reports to inform cash flow management and collections strategies', accountable: 'Jordana', responsible: 'Finance', contributors: ['Greg'], informed: ['David', 'Ashley', 'Chris H.', 'Cheryl'] },
        ]),
        createProcessWithTasks('p-cfo-ap', 'AP', 'Accounts Payable', 'process', [
          { code: 'AP1', description: 'Monitor incoming bills from vendors and independent contractors and enter them into financial systems for payment processing', accountable: 'Jordana', responsible: 'Finance', contributors: [], informed: ['CSOG'] },
          { code: 'AP2', description: 'Make strategic decisions regarding vendor and independent contractor selection based on quality, cost, and alignment with organizational needs', accountable: 'Greg', responsible: 'Jordana', contributors: ['David', 'Ashley', 'Cheryl'], informed: ['Finance'] },
          { code: 'AP3', description: 'Determine the timing of vendor and contractor payments to optimize cash flow while maintaining positive vendor relationships', accountable: 'Greg', responsible: 'Finance', contributors: ['David', 'Jordana'], informed: ['Ashley', 'Chris H.', 'Cheryl'] },
          { code: 'AP4', description: 'Approve accounts payable transactions, particularly those requiring external authorization or exceeding predefined thresholds', accountable: 'Greg', responsible: 'Finance', contributors: ['David', 'Jordana'], informed: ['Ashley', 'Chris H.', 'Cheryl'] },
          { code: 'AP5', description: 'Manage contracts with independent contractors and vendors, including negotiation, execution, and compliance monitoring', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Ashley', 'Chris H.'], informed: ['CSOG'] },
          { code: 'AP6', description: 'Process payroll for all employees, ensuring accuracy, timeliness, and compliance with tax and labor regulations', accountable: 'Jordana', responsible: 'Finance', contributors: [], informed: ['CSOG'] },
          { code: 'AP7', description: 'Administer employee benefits programs, including enrollment, changes, and compliance with regulatory requirements', accountable: 'Jordana', responsible: 'Finance', contributors: [], informed: ['CSOG'] },
          { code: 'AP8', description: 'Manage tax filings, compliance reporting, and regulatory requirements to ensure organizational adherence to all applicable laws', accountable: 'Greg', responsible: 'Finance', contributors: ['David', 'Jordana'], informed: ['Ashley', 'Chris H.', 'Cheryl'] },
        ]),
        createProcessWithTasks('p-cfo-mc', 'MC', 'Month-End Close', 'process', [
          { code: 'MC1', description: 'Reconcile all transactions and account balances to ensure accuracy of financial records', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'MC2', description: 'Process accruals for revenue, expenses, and other items requiring period-end adjustments', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'MC3', description: 'Post journal entries for adjustments, corrections, and period-end accounting', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'MC4', description: 'Review trial balance and identify any discrepancies requiring resolution', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'MC5', description: 'Prepare financial statements including balance sheet, income statement, and cash flow', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
          { code: 'MC6', description: 'Close the accounting period and lock books to prevent further changes', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-cfo-fr', 'FR', 'Financial Reporting', 'process', [
          { code: 'FR1', description: 'Generate monthly balance sheets with trend analysis and dashboard views to support financial analysis and decision-making', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'FR2', description: 'Produce detailed profit and loss statements for internal use and summary reports for executive and board presentations', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'FR3', description: 'Distribute financial reports to board members in advance of board meetings to inform governance and oversight', accountable: 'David', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cfo-im', 'IM', 'Inventory Lifecycle Management', 'process', [
          { code: 'IM1', description: 'Track and maintain inventory of physical and digital assets from acquisition through disposal', accountable: 'Aisha', responsible: 'Finance', contributors: ['Chris H.'], informed: [] },
          { code: 'IM2', description: 'Calculate and record depreciation for fixed assets according to accounting standards', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: [] },
          { code: 'IM3', description: 'Process and record asset additions including equipment, software, and other capital items', accountable: 'Aisha', responsible: 'Finance', contributors: ['Requestor'], informed: [] },
          { code: 'IM4', description: 'Process and record asset disposals, retirements, and write-offs', accountable: 'Aisha', responsible: 'Finance', contributors: [], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-cfo-sm', 'SM', 'SaaS Access & Subscription Management', 'process', [
          { code: 'SM1', description: 'A master inventory of approved SaaS tools and subscriptions is maintained', accountable: 'Jordana', responsible: 'Finance', contributors: ['CSOG'], informed: ['David'] },
          { code: 'SM2', description: 'Subscription charges are reconciled against billing statements', accountable: 'Jordana', responsible: 'Finance', contributors: ['CSOG'], informed: ['David'] },
          { code: 'SM3', description: 'Active licenses are reviewed to confirm ongoing business need', accountable: 'Jordana', responsible: 'Finance', contributors: ['Greg'], informed: ['David'] },
          { code: 'SM4', description: 'Requests for non-standard SaaS tools are formally submitted', accountable: 'Jordana', responsible: 'Finance', contributors: ['Greg', 'CSOG'], informed: ['David'] },
          { code: 'SM5', description: 'Approval or denial of non-standard SaaS access is documented', accountable: 'Jordana', responsible: 'Finance', contributors: ['Greg', 'CSOG'], informed: ['David'] },
          { code: 'SM6', description: 'Approved requests are communicated for procurement action', accountable: 'Jordana', responsible: 'Finance', contributors: ['CSOG'], informed: ['David', 'Greg'] },
          { code: 'SM7', description: 'New SaaS subscriptions or licenses are established as approved', accountable: 'Jordana', responsible: 'Finance', contributors: ['CSOG'], informed: ['David', 'Greg'] },
          { code: 'SM8', description: 'Security parameters are established and authenticated', accountable: 'Jordana', responsible: 'Chris H.', contributors: ['Finance'], informed: ['David', 'Greg'] },
          { code: 'SM9', description: 'User access is provisioned and recorded in the SaaS inventory', accountable: 'Jordana', responsible: 'Finance', contributors: ['CSOG'], informed: ['David'] },
          { code: 'SM10', description: 'Unused or unapproved licenses are terminated to control costs', accountable: 'Jordana', responsible: 'Finance', contributors: ['Greg'], informed: ['David'] },
        ]),
      ],
      functions: [],
    },
    'exec-cdao': {
      processes: [
        createProcessWithTasks('p-cdao-sa', 'SA', 'Starset Analytics LV1-LV3', 'process', [
          { code: 'SA1', description: 'Identify data publication cycles for source materials (CMS updates, payer filings, etc.)', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA2', description: 'Acquire source data files from identified publication sources', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA3', description: 'Validate file availability and integrity before processing', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA4', description: 'Stage raw data in appropriate data infrastructure', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA5', description: 'Normalize data structures across different source formats', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA6', description: 'Apply initial data filtration rules to remove invalid records', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA7', description: 'Deduplicate rate records based on defined business rules', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA8', description: 'Merge data from multiple sources into unified dataset', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA9', description: 'Integrate utilization context data for rate weighting', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA10', description: 'Generate weighted rate metrics based on utilization data', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA11', description: 'Select representative rates using established methodology', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA12', description: 'Conduct QA and compliance review of processed data', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['Ashley'] },
          { code: 'SA13', description: 'Promote validated data to production-level datasets', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA14', description: 'Enable platform consumption of production data', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA15', description: 'Verify platform outputs match expected results', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'SA16', description: 'Document release summary and data lineage', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cdao-hmrf', 'HMRF', 'Hospital MRF Database Management', 'process', [
          { code: 'HMRF1', description: 'Identify hospital Machine-Readable File (MRF) sources for data collection', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'HMRF2', description: 'Acquire MRF data files from hospital sources', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'HMRF3', description: 'Validate MRF file integrity and schema compliance', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'HMRF4', description: 'Process MRF data through defined transformation pipeline', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'HMRF5', description: 'Standardize MRF data to common schema and format', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'HMRF6', description: 'Conduct quality assurance review of processed MRF data', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['Ashley'] },
          { code: 'HMRF7', description: 'Update production MRF database with validated data', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
          { code: 'HMRF8', description: 'Provision appropriate access to MRF database for authorized users', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'HMRF9', description: 'Document data lineage and processing notes for MRF updates', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cdao-ddd', 'DDD', 'Data-Driven Deliverables', 'process', [
          { code: 'DDD1', description: 'Gather requirements for data-driven deliverables from engagement leads', accountable: 'Chris H.', responsible: 'Ashley', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'DDD2', description: 'Identify appropriate data sources to meet deliverable requirements', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Andy', 'Bobby'], informed: ['Ashley'] },
          { code: 'DDD3', description: 'Extract relevant data from identified sources', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['Ashley'] },
          { code: 'DDD4', description: 'Conduct data analysis to derive insights', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['Ashley'] },
          { code: 'DDD5', description: 'Develop visualizations and presentations of findings', accountable: 'Chris H.', responsible: 'Andy', contributors: ['Bobby'], informed: ['Ashley'] },
          { code: 'DDD6', description: 'Review deliverable quality and accuracy', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Ashley'], informed: ['Greg'] },
          { code: 'DDD7', description: 'Prepare deliverable for client presentation', accountable: 'Chris H.', responsible: 'Ashley', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'DDD8', description: 'Hand off completed deliverable to engagement lead', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Ashley'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cdao-iam', 'IM', 'Identity & Access Management', 'process', [
          { code: 'IM1', description: 'Define access standards for systems and data based on role requirements', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'IM2', description: 'Approve access requests based on business need and role authorization', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'IM3', description: 'Provision user access to approved systems and data', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'IM4', description: 'Maintain inventory of user access across all systems', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'IM5', description: 'Conduct periodic reviews of user access for continued appropriateness', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'IM6', description: 'Modify user access based on role changes or business needs', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'IM7', description: 'Revoke user access upon separation or role changes', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'IM8', description: 'Audit access compliance to ensure adherence to security policies', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['Greg'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-cdao-f-it', 'F-IT', 'Information Technology', 'function', [
          { code: 'F-IT1', description: 'Develop and maintain IT strategy aligned with business objectives', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-IT2', description: 'Manage IT infrastructure including cloud services, networks, and hardware', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-IT3', description: 'Implement and monitor security controls to protect systems and data', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-IT4', description: 'Manage relationships with IT vendors and service providers', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Finance'], informed: ['CSOG'] },
          { code: 'F-IT5', description: 'Establish governance for AI tool usage including evaluation and approval processes', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-IT6', description: 'Monitor and mitigate IT-related risks', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'F-IT7', description: 'Provide IT support and helpdesk services to staff', accountable: 'Chris H.', responsible: 'Chris H.', contributors: [], informed: ['All Staff'] },
          { code: 'F-IT8', description: 'Develop and maintain disaster recovery and business continuity plans', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
        ]),
      ],
    },
    'exec-cgo': {
      processes: [
        createProcessWithTasks('p-cgo-bd', 'BD', 'Business Development', 'process', [
          { code: 'BD1', description: 'Generate leads aligned with the firm\'s primary fracture point focal areas through network outreach, business referrals, and marketing/thought leadership activities', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['All Staff'], informed: ['CSOG'] },
          { code: 'BD2', description: 'Primary qualification and conflict checks during weekly Pipeline Call (Friday 8:30-9:30 CT). Once qualified, populate in Pipeline Tracker in Notion', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['CSOG'], informed: [] },
          { code: 'BD3', description: 'Draft Scope of Work outlining duties, timeline, and deliverables. Ensure alignment with: 1) Ashley DeGarmo (Staff Capacity), 2) Chris Hart (Data Infrastructure), 3) Jordana Choucair (Tools), 4) Greg Williams (SME Support)', accountable: 'Cheryl', responsible: 'Team Member', contributors: ['Ashley', 'Chris H.', 'Jordana', 'Greg'], informed: ['Finance', 'David'] },
          { code: 'BD4', description: 'Using the Proposal Pricing Template, price the proposal and estimate earned margin', accountable: 'Cheryl', responsible: 'Team Member', contributors: ['Ashley', 'Jordana', 'Greg'], informed: ['Finance', 'David'] },
          { code: 'BD5', description: 'Once SOW and Pricing Template are approved, draft and submit proposal to prospective client', accountable: 'Cheryl', responsible: 'Team Member', contributors: ['Ashley', 'Jordana', 'Greg'], informed: ['David'] },
          { code: 'BD6', description: 'Once disposition determined (Won/Lost), CGO conducts evaluation of outcome drivers and documents in Pipeline Tracker', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['CSOG'], informed: ['David'] },
          { code: 'BD7', description: 'If client seeks to negotiate pricing, timeline, or scope, Sponsoring Team Member redresses internally: 1) CGO, 2) President, 3) COO. Notify impacted CSOG members', accountable: 'Greg', responsible: 'Cheryl', contributors: ['David', 'Jordana'], informed: ['Ashley', 'Chris H.'] },
          { code: 'BD8', description: 'Build contract using appropriate Third Horizon Contract Template. Assign Project Code that COO proliferates to other data systems', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Team Member', 'Ashley', 'Greg'], informed: ['Cheryl'] },
          { code: 'BD9', description: 'COO is primary signatory (President or CEO as secondary). Store executed contract in SharePoint. Confirm all data systems reflect Project Code', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Greg', 'David'], informed: ['Cheryl', 'Team Member', 'Ashley', 'Chris H.'] },
        ]),
        createProcessWithTasks('p-cgo-tl', 'TL', 'Thought Leadership', 'process', [
          { code: 'TL1', description: 'Define strategic themes for thought leadership content that align with Third Horizon\'s expertise and market positioning', accountable: 'David', responsible: 'Cheryl', contributors: ['CSOG'], informed: [] },
          { code: 'TL2', description: 'Develop executive points of view and narratives that establish Third Horizon leaders as industry thought leaders', accountable: 'David', responsible: 'Jordana', contributors: ['CSOG'], informed: ['Chris H.'] },
          { code: 'TL3', description: 'Draft thought leadership content, including articles, white papers, and presentations, for external publication', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['CSOG'], informed: [] },
          { code: 'TL4', description: 'Review thought leadership content for brand alignment, risk mitigation, and clarity before publication', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'TL5', description: 'Publish and distribute thought leadership content through appropriate channels to maximize reach and impact', accountable: 'Jordana', responsible: 'Jordana', contributors: ['Cheryl'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cgo-mc', 'MC', 'Marketing Collateral', 'process', [
          { code: 'MC1', description: 'Establish standards and strategic direction for marketing collateral to ensure consistency, quality, and brand alignment', accountable: 'Cheryl', responsible: 'Jordana', contributors: ['David', 'Ashley'], informed: ['Greg', 'Chris H.'] },
          { code: 'MC2', description: 'Identify and document specific content requirements for marketing collateral based on business development and client engagement needs', accountable: 'Cheryl', responsible: 'Cheryl', contributors: ['David', 'Greg', 'Ashley'], informed: ['Jordana', 'Chris H.'] },
          { code: 'MC3', description: 'Draft and design marketing collateral, including brochures, presentations, and one-pagers, to support external communications', accountable: 'Jordana', responsible: 'Cheryl', contributors: ['David', 'Ashley'], informed: ['Greg', 'Chris H.'] },
          { code: 'MC4', description: 'Review all marketing collateral for compliance with legal, regulatory, and brand standards before distribution', accountable: 'Jordana', responsible: 'Jordana', contributors: ['David'], informed: ['CSOG'] },
          { code: 'MC5', description: 'Provide guidance to client-facing teams on the appropriate use of marketing collateral in various engagement contexts', accountable: 'Greg', responsible: 'Ashley', contributors: ['David', 'Cheryl'], informed: ['Jordana', 'Chris H.'] },
        ]),
      ],
      functions: [],
    },
    'exec-cso': {
      processes: [
        createProcessWithTasks('p-cso-sd', 'SD', 'Service Delivery', 'process', [
          { code: 'SD1', description: 'Activate the Scope of Work and ensure all prerequisites for client kickoff are met, including resource allocation and deliverable planning', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Greg', 'Chris H.'], informed: ['CSOG'] },
          { code: 'SD2', description: 'Conduct formal Kickoff Meeting with client to establish project parameters, communication protocols, and success criteria', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Jordana', 'Chris H.'], informed: ['David', 'Greg'] },
          { code: 'SD3', description: 'Upload SOW, communication protocols, and success criteria into Master Relationship GPT. Maintain primary client relationship responsibility; update Client Status Tracker weekly', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Client Team'], informed: ['CSOG'] },
          { code: 'SD4', description: 'Ensure the accuracy, completeness, and reliability of data and analytics deliverables provided to clients', accountable: 'Chris H.', responsible: 'Chris H.', contributors: ['Ashley'], informed: ['David', 'Greg', 'Jordana'] },
          { code: 'SD5', description: 'Review key client deliverables, ensuring quality, timeliness, and alignment with contractual commitments. Run through Master Relationship GPT for SOW conformity', accountable: 'Greg', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['David'] },
          { code: 'SD6', description: 'Assess client satisfaction through Client Exit Interview or Engagement Impact Survey. Upload outcomes to Continuous Improvement GPT', accountable: 'Greg', responsible: 'Ashley', contributors: ['David'], informed: ['Jordana'] },
          { code: 'SD7', description: 'Identify opportunities for contract renewal or expansion based on client needs, satisfaction, and strategic alignment', accountable: 'Greg', responsible: 'Ashley', contributors: ['Cheryl', 'David'], informed: ['Jordana'] },
        ]),
        createProcessWithTasks('p-cso-cp', 'CP', 'Contract Performance', 'process', [
          { code: 'CP1', description: 'Monitor project budgets against actual expenditures using Contract Performance tool. If not trending to business objectives, adjudicate Corrective Action process', accountable: 'Greg', responsible: 'Ashley', contributors: ['David', 'Jordana', 'Chris H.'], informed: ['Cheryl', 'Finance'] },
          { code: 'CP2', description: 'Analyze project margins to assess profitability and inform pricing and resource allocation decisions', accountable: 'Greg', responsible: 'Jordana', contributors: ['Ashley'], informed: ['Cheryl', 'Finance'] },
          { code: 'CP3', description: 'Ensure staffing levels and skill sets are aligned with project demands and budget constraints', accountable: 'Greg', responsible: 'Ashley', contributors: ['David', 'Jordana', 'Chris H.'], informed: ['Cheryl', 'Finance'] },
          { code: 'CP4', description: 'Establish and manage staff billing rates to ensure competitive positioning and profitability', accountable: 'Greg', responsible: 'Jordana', contributors: ['Ashley'], informed: ['Cheryl', 'Finance'] },
          { code: 'CP5', description: 'Generate profitability reports to inform strategic decision-making', accountable: 'Greg', responsible: 'Finance', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'CP6', description: 'Feed pricing learnings back to Business Development to improve future proposal accuracy', accountable: 'Cheryl', responsible: 'Ashley', contributors: ['Jordana'], informed: ['Greg'] },
        ]),
        createProcessWithTasks('p-cso-cc', 'CC', 'Contract Closure', 'process', [
          { code: 'CC1', description: 'Verify all contract deliverables have been completed and meet quality standards', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'CC2', description: 'Obtain formal client sign-off on contract completion', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'CC3', description: 'Process final invoices and ensure all receivables are collected', accountable: 'Ashley', responsible: 'Finance', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'CC4', description: 'Archive all contract documentation in appropriate repositories', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Client Lead'], informed: ['CSOG'] },
          { code: 'CC5', description: 'Capture lessons learned and upload to Continuous Improvement GPT', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cso-cis', 'CiS', 'Change in Scope', 'process', [
          { code: 'CiS1', description: 'Identify when client requests or project needs require scope changes', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'CiS2', description: 'Assess impact of scope changes on timeline, budget, and resources', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Jordana', 'Chris H.'], informed: ['Greg'] },
          { code: 'CiS3', description: 'Communicate scope change implications and options to client', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['Greg'] },
          { code: 'CiS4', description: 'Draft change order documenting scope modifications and pricing adjustments', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Ashley'], informed: ['Finance'] },
          { code: 'CiS5', description: 'Obtain approvals and execute change order', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Greg'], informed: ['CSOG'] },
          { code: 'CiS6', description: 'Update all relevant documentation and systems to reflect scope changes', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Client Lead'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cso-ca', 'CA', 'Corrective Action', 'process', [
          { code: 'CA1', description: 'Identify issues requiring corrective action (delivery problems, client concerns, performance gaps)', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['Greg'] },
          { code: 'CA2', description: 'Conduct root cause analysis to understand underlying issues', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Chris H.', 'Jordana'], informed: ['Greg'] },
          { code: 'CA3', description: 'Develop corrective action plan with specific remediation steps', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Client Lead'], informed: ['Greg'] },
          { code: 'CA4', description: 'Review corrective action plan with executive leadership', accountable: 'Ashley', responsible: 'Greg', contributors: ['David'], informed: ['CSOG'] },
          { code: 'CA5', description: 'Implement corrective action plan and monitor progress', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['Greg'] },
          { code: 'CA6', description: 'Monitor outcomes and verify corrective actions achieved desired results', accountable: 'Ashley', responsible: 'Ashley', contributors: ['Client Lead'], informed: ['CSOG'] },
        ]),
        createProcessWithTasks('p-cso-cfp', 'CFP', 'Client-Facing Publications', 'process', [
          { code: 'CFP1', description: 'Identify needs for client-facing publications based on engagement requirements', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'CFP2', description: 'Develop content for client-facing publications', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Chris H.'], informed: ['CSOG'] },
          { code: 'CFP3', description: 'Validate data accuracy and sources for all data-driven claims', accountable: 'Ashley', responsible: 'Chris H.', contributors: ['Client Lead'], informed: ['CSOG'] },
          { code: 'CFP4', description: 'Review publications for quality, accuracy, and brand alignment', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Ashley'], informed: ['Greg'] },
          { code: 'CFP5', description: 'Obtain client approval for publications when required', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Ashley'], informed: ['CSOG'] },
          { code: 'CFP6', description: 'Distribute publications through appropriate channels', accountable: 'Ashley', responsible: 'Client Lead', contributors: ['Cheryl'], informed: ['CSOG'] },
        ]),
      ],
      functions: [
        createProcessWithTasks('p-cso-f-cdh', 'F-CDH', 'Client Confidentiality & Data Handling', 'function', [
          { code: 'F-CDH1', description: 'Establish and maintain client confidentiality standards in compliance with BAAs and contractual obligations', accountable: 'Ashley', responsible: 'Greg', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-CDH2', description: 'Define data handling protocols for client data throughout the engagement lifecycle', accountable: 'Ashley', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-CDH3', description: 'Implement access controls to ensure only authorized personnel can access client data', accountable: 'Ashley', responsible: 'Chris H.', contributors: ['Jordana'], informed: ['CSOG'] },
          { code: 'F-CDH4', description: 'Monitor compliance with confidentiality and data handling requirements', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['Greg'] },
          { code: 'F-CDH5', description: 'Respond to potential data breaches or confidentiality incidents', accountable: 'Ashley', responsible: 'Chris H.', contributors: ['Greg', 'Jordana'], informed: ['David'] },
          { code: 'F-CDH6', description: 'Ensure staff are trained on client confidentiality and data handling requirements', accountable: 'Ashley', responsible: 'Jordana', contributors: ['Chris H.'], informed: ['All Staff'] },
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
