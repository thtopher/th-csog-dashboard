// What Must Be True (WMBT) — 2026 Strategic Milestones
// Source: WMBT v2 tracker, March 2026

export type MilestoneStatus = 'complete' | 'in_progress' | 'not_started' | 'at_risk';

export interface StrategicMilestone {
  id: string;
  title: string;
  owners: string[];      // executive first names
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  progress: number;       // 0–100
  status: MilestoneStatus;
  progressLabel?: string; // e.g. "6 / 15" for Q4 count-based goals
}

function ms(
  id: string,
  title: string,
  owners: string[],
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  progress: number,
  status?: MilestoneStatus,
  progressLabel?: string,
): StrategicMilestone {
  const s = status ?? (progress >= 100 ? 'complete' : progress > 0 ? 'in_progress' : 'not_started');
  return { id, title, owners, quarter, progress, status: s, progressLabel };
}

export const STRATEGIC_MILESTONES: StrategicMilestone[] = [
  // ── Q1 (March 31) ──
  ms('q1-01', 'Capital Raise Determination', ['David'], 'Q1', 100),
  ms('q1-02', 'Formalize Data Team Structure', ['David'], 'Q1', 100),
  ms('q1-03', 'Phase 1 Data Team Re-Org', ['David'], 'Q1', 100),
  ms('q1-04', 'Solve Komodo Partnership', ['David', 'Cheryl'], 'Q1', 50),
  ms('q1-05', 'Monthly Strategy Review', ['Greg'], 'Q1', 50),
  ms('q1-06', 'Quarterly CSOG In-Person', ['Greg'], 'Q1', 100),
  ms('q1-07', 'Fractional Controller', ['Greg', 'Jordana'], 'Q1', 100),
  ms('q1-08', 'Carta Operationalization', ['Jordana'], 'Q1', 90),
  ms('q1-09', 'Employee Satisfaction Benchmarks', ['Jordana', 'Ashley'], 'Q1', 25),
  ms('q1-10', 'Post-Processing Code Mgmt', ['Chris'], 'Q1', 25, 'at_risk'),
  ms('q1-11', 'Smooth V8 Production', ['Chris'], 'Q1', 80),
  ms('q1-12', 'Cheryl Firmly in CGO Role', ['David', 'Cheryl'], 'Q1', 100),
  ms('q1-13', 'Revenue Bucketing \u2014 Pipeline', ['Cheryl'], 'Q1', 25),
  ms('q1-14', 'Revenue Bucketing \u2014 Actual', ['Cheryl', 'Jordana'], 'Q1', 0),
  ms('q1-15', 'Expanding Notion Pipeline', ['Cheryl'], 'Q1', 0),
  ms('q1-16', 'Client Engagement Tracker KPIs', ['Ashley'], 'Q1', 10),

  // ── Q2 (June 30) ──
  ms('q2-01', 'Role Clarity & Ownership', ['David', 'All CSOG'], 'Q2', 20),
  ms('q2-02', 'Hire AI Integration Specialist', ['David', 'Jordana'], 'Q2', 25),
  ms('q2-03', 'Employee Satisfaction Survey', ['Jordana', 'Ashley'], 'Q2', 10),
  ms('q2-04', 'Hire & Integrate New Engineer', ['Chris', 'Jordana'], 'Q2', 50),
  ms('q2-05', 'All LVs Under Code Mgmt', ['Chris'], 'Q2', 0),
  ms('q2-06', 'Client Engagement Reporting', ['Ashley'], 'Q2', 0),

  // ── Q3 (September 30) ──
  ms('q3-01', 'Fundraising Complete', ['David'], 'Q3', 0),
  ms('q3-02', 'Finance / Acct Reconstitution', ['Jordana', 'Greg'], 'Q3', 30),
  ms('q3-03', 'HR Benefits Review', ['Jordana'], 'Q3', 10),
  ms('q3-04', 'Marketing Collateral Developed', ['Jordana', 'Cheryl'], 'Q3', 10),
  ms('q3-05', 'LV3 Platform Client Delivery', ['Chris'], 'Q3', 20),
  ms('q3-06', 'Cycle Time Streamlined', ['Chris'], 'Q3', 0),
  ms('q3-07', 'Smooth V9 Production', ['Chris'], 'Q3', 0),
  ms('q3-08', 'Agentic Integration Platforms', ['Chris'], 'Q3', 0),
  ms('q3-09', 'Smooth V10 Production', ['Chris'], 'Q3', 0),
  ms('q3-10', 'Contract Pricing Precision', ['Cheryl', 'Ashley'], 'Q3', 0),
  ms('q3-11', 'Client Reporting Mgmt System', ['Ashley'], 'Q3', 0),

  // ── Q4 (December 31) ──
  ms('q4-01', '15 Total DaaS Subscriptions', ['Cheryl', 'All CSOG'],'Q4', 40, 'in_progress', '6 / 15'),
  ms('q4-02', '$1M Ancillary MHPI Revenue', ['Greg', 'Cheryl'], 'Q4', 0, 'not_started', '$0 / $1M'),
  ms('q4-03', '10 Total $30K MMA Arrangements', ['Cheryl', 'All CSOG'],'Q4', 10, 'in_progress', '1 / 10'),
  ms('q4-04', '15 Core Proposals', ['Cheryl', 'All CSOG'],'Q4', 20, 'in_progress', '3 / 15'),
  ms('q4-05', 'Current Pipeline Execution', ['Cheryl', 'All CSOG'],'Q4', 0, 'in_progress', '9 Deals Closed'),
];

export const QUARTER_LABELS: Record<string, string> = {
  Q1: 'Q1 (March 31)',
  Q2: 'Q2 (June 30)',
  Q3: 'Q3 (September 30)',
  Q4: 'Q4 (December 31)',
};

// Owner → color mapping (matches executive colors)
export const OWNER_COLORS: Record<string, string> = {
  David: '#1e3a5f',   // CEO — dark blue
  Greg: '#2d8a4e',    // President — green
  Jordana: '#e07c24', // COO — orange
  Aisha: '#7c3aed',   // CFO — purple (placeholder)
  Chris: '#6366f1',   // CDAO — indigo
  Cheryl: '#dc2626',  // CGO — red
  Ashley: '#0891b2',  // CSO/CCO — teal
  'All CSOG': '#6b7280', // shared — gray
};
