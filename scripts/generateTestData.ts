/**
 * Generate test XLSX files for scorecard metrics testing
 *
 * Run with: npx tsx scripts/generateTestData.ts
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', 'test-data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface TestScenario {
  name: string;
  suffix: string;
  description: string;
}

const SCENARIOS: TestScenario[] = [
  { name: 'Green', suffix: 'green', description: 'All metrics meet targets' },
  { name: 'Amber', suffix: 'amber', description: 'Metrics at warning level' },
  { name: 'Red', suffix: 'red', description: 'Metrics at critical level' },
];

function writeXLSX(filename: string, data: Record<string, unknown>[]) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const filepath = path.join(OUTPUT_DIR, filename);
  XLSX.writeFile(workbook, filepath);
  console.log(`Created: ${filepath}`);
}

// ============================================
// HARVEST COMPLIANCE (excel_harvest)
// Target: 95%, Warning: 85%, Critical: 75%
// ============================================

function generateHarvestData() {
  const employees = [
    'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis',
    'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor', 'Jack Anderson',
    'Karen Thomas', 'Leo Jackson', 'Maria White', 'Nathan Harris', 'Olivia Martin',
    'Peter Garcia', 'Quinn Martinez', 'Rachel Robinson', 'Sam Clark', 'Tina Lewis',
  ];

  // Green: 96% (19/20 complete)
  const greenData = employees.map((name, i) => ({
    employee_name: name,
    status: i < 19 ? 'complete' : 'incomplete',
  }));
  writeXLSX('harvest_green.xlsx', greenData);

  // Amber: 88% (17.6 -> 18/20 complete, but let's use 35/40 = 87.5%)
  const amberEmployees = [...employees, ...employees]; // 40 employees
  const amberData = amberEmployees.map((name, i) => ({
    employee_name: `${name} ${Math.floor(i / 20) + 1}`,
    status: i < 35 ? 'complete' : 'incomplete',
  }));
  writeXLSX('harvest_amber.xlsx', amberData);

  // Red: 70% (14/20 complete)
  const redData = employees.map((name, i) => ({
    employee_name: name,
    status: i < 14 ? 'complete' : 'incomplete',
  }));
  writeXLSX('harvest_red.xlsx', redData);

  console.log('\nHarvest Compliance test files:');
  console.log('  - harvest_green.xlsx: 95% (19/20 complete) -> GREEN');
  console.log('  - harvest_amber.xlsx: 87.5% (35/40 complete) -> AMBER');
  console.log('  - harvest_red.xlsx: 70% (14/20 complete) -> RED');
}

// ============================================
// STAFFING & UTILIZATION (excel_staffing)
// Utilization - Target: 75%, Warning: 65%, Critical: 55%
// Open Positions - Target: 0, Warning: 3, Critical: 5
// ============================================

function generateStaffingData() {
  const employees = [
    'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis',
    'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor', 'Jack Anderson',
  ];

  // Green: 78% utilization, 0 open positions
  const greenData = employees.map((name) => ({
    employee_name: name,
    billable_hours: 31.2, // 78% of 40
    available_hours: 40,
    position_status: 'filled',
  }));
  writeXLSX('staffing_green.xlsx', greenData);

  // Amber: 68% utilization, 2 open positions
  const amberData = [
    ...employees.map((name) => ({
      employee_name: name,
      billable_hours: 27.2, // 68% of 40
      available_hours: 40,
      position_status: 'filled',
    })),
    { employee_name: 'Senior Analyst (Open)', billable_hours: 0, available_hours: 0, position_status: 'open' },
    { employee_name: 'Consultant (Open)', billable_hours: 0, available_hours: 0, position_status: 'open' },
  ];
  writeXLSX('staffing_amber.xlsx', amberData);

  // Red: 52% utilization, 6 open positions
  const redData = [
    ...employees.map((name) => ({
      employee_name: name,
      billable_hours: 20.8, // 52% of 40
      available_hours: 40,
      position_status: 'filled',
    })),
    { employee_name: 'Senior Analyst (Open)', position_status: 'open' },
    { employee_name: 'Consultant 1 (Open)', position_status: 'open' },
    { employee_name: 'Consultant 2 (Open)', position_status: 'open' },
    { employee_name: 'Manager (Open)', position_status: 'open' },
    { employee_name: 'Director (Open)', position_status: 'open' },
    { employee_name: 'Principal (Open)', position_status: 'open' },
  ];
  writeXLSX('staffing_red.xlsx', redData);

  console.log('\nStaffing & Utilization test files:');
  console.log('  - staffing_green.xlsx: 78% util, 0 open -> GREEN');
  console.log('  - staffing_amber.xlsx: 68% util, 2 open -> AMBER');
  console.log('  - staffing_red.xlsx: 52% util, 6 open -> RED');
}

// ============================================
// AR AGING (excel_ar)
// AR > 90 days - Target: $50K, Warning: $100K, Critical: $200K
// DSO - Target: 45, Warning: 60, Critical: 75
// ============================================

function generateARData() {
  // Green: $42K over 90 days, DSO 40 days
  const greenData = [
    { invoice_id: 'INV-001', amount: 25000, age_days: 30 },
    { invoice_id: 'INV-002', amount: 35000, age_days: 45 },
    { invoice_id: 'INV-003', amount: 28000, age_days: 35 },
    { invoice_id: 'INV-004', amount: 42000, age_days: 95 }, // Over 90
    { invoice_id: 'INV-005', amount: 18000, age_days: 40 },
  ];
  writeXLSX('ar_green.xlsx', greenData);

  // Amber: $85K over 90 days, DSO 55 days
  const amberData = [
    { invoice_id: 'INV-001', amount: 25000, age_days: 55 },
    { invoice_id: 'INV-002', amount: 35000, age_days: 60 },
    { invoice_id: 'INV-003', amount: 45000, age_days: 92 }, // Over 90
    { invoice_id: 'INV-004', amount: 40000, age_days: 95 }, // Over 90
    { invoice_id: 'INV-005', amount: 30000, age_days: 45 },
  ];
  writeXLSX('ar_amber.xlsx', amberData);

  // Red: $180K over 90 days, DSO 72 days
  const redData = [
    { invoice_id: 'INV-001', amount: 35000, age_days: 65 },
    { invoice_id: 'INV-002', amount: 60000, age_days: 95 },  // Over 90
    { invoice_id: 'INV-003', amount: 70000, age_days: 120 }, // Over 90
    { invoice_id: 'INV-004', amount: 50000, age_days: 100 }, // Over 90
    { invoice_id: 'INV-005', amount: 45000, age_days: 80 },
  ];
  writeXLSX('ar_red.xlsx', redData);

  console.log('\nAR Aging test files:');
  console.log('  - ar_green.xlsx: $42K over 90d, DSO 49d -> GREEN');
  console.log('  - ar_amber.xlsx: $85K over 90d, DSO 69d -> AMBER');
  console.log('  - ar_red.xlsx: $180K over 90d, DSO 92d -> RED');
}

// ============================================
// PIPELINE (excel_pipeline)
// Win Rate - Target: 40%, Warning: 30%, Critical: 20%
// ============================================

function generatePipelineData() {
  // Green: 50% win rate (5 won, 5 lost, $800K pipeline, $200K avg)
  const greenData = [
    { opportunity_name: 'Client A Expansion', value: 200000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Client B New Project', value: 180000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Client C Retainer', value: 240000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Client D Assessment', value: 150000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Client E Strategy', value: 230000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Prospect F', value: 120000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect G', value: 90000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect H', value: 140000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect I', value: 110000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect J', value: 80000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect K', value: 300000, status: 'open', stage: 'qualified' },
    { opportunity_name: 'Prospect L', value: 250000, status: 'open', stage: 'proposal' },
    { opportunity_name: 'Prospect M', value: 250000, status: 'open', stage: 'negotiation' },
  ];
  writeXLSX('pipeline_green.xlsx', greenData);

  // Amber: 33% win rate (3 won, 6 lost)
  const amberData = [
    { opportunity_name: 'Client A Expansion', value: 200000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Client B New Project', value: 180000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Client C Retainer', value: 170000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Prospect D', value: 150000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect E', value: 130000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect F', value: 120000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect G', value: 90000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect H', value: 140000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect I', value: 110000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect J', value: 200000, status: 'open', stage: 'qualified' },
    { opportunity_name: 'Prospect K', value: 180000, status: 'open', stage: 'proposal' },
  ];
  writeXLSX('pipeline_amber.xlsx', amberData);

  // Red: 17% win rate (1 won, 5 lost)
  const redData = [
    { opportunity_name: 'Client A Expansion', value: 200000, status: 'won', stage: 'closed' },
    { opportunity_name: 'Prospect B', value: 150000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect C', value: 130000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect D', value: 120000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect E', value: 90000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect F', value: 140000, status: 'lost', stage: 'closed' },
    { opportunity_name: 'Prospect G', value: 250000, status: 'open', stage: 'qualified' },
  ];
  writeXLSX('pipeline_red.xlsx', redData);

  console.log('\nPipeline test files:');
  console.log('  - pipeline_green.xlsx: 50% win rate, $800K pipeline -> GREEN');
  console.log('  - pipeline_amber.xlsx: 33% win rate, $380K pipeline -> AMBER');
  console.log('  - pipeline_red.xlsx: 17% win rate, $250K pipeline -> RED');
}

// ============================================
// CLIENT SATISFACTION (excel_client_satisfaction)
// CSAT - Target: 9, Warning: 8, Critical: 7
// NPS - Target: 50, Warning: 30, Critical: 10
// ============================================

function generateSatisfactionData() {
  // Green: CSAT 9.2, NPS 60 (6 promoters, 1 passive, 1 detractor)
  const greenData = [
    { client_name: 'Client A', csat_score: 10, nps_category: 'promoter' },
    { client_name: 'Client B', csat_score: 9, nps_category: 'promoter' },
    { client_name: 'Client C', csat_score: 9, nps_category: 'promoter' },
    { client_name: 'Client D', csat_score: 10, nps_category: 'promoter' },
    { client_name: 'Client E', csat_score: 8, nps_category: 'promoter' },
    { client_name: 'Client F', csat_score: 9, nps_category: 'promoter' },
    { client_name: 'Client G', csat_score: 9, nps_category: 'passive' },
    { client_name: 'Client H', csat_score: 10, nps_category: 'promoter' },
    { client_name: 'Client I', csat_score: 9, nps_category: 'promoter' },
    { client_name: 'Client J', csat_score: 8, nps_category: 'detractor' },
  ];
  writeXLSX('satisfaction_green.xlsx', greenData);

  // Amber: CSAT 8.3, NPS 33
  const amberData = [
    { client_name: 'Client A', csat_score: 9, nps_category: 'promoter' },
    { client_name: 'Client B', csat_score: 8, nps_category: 'promoter' },
    { client_name: 'Client C', csat_score: 8, nps_category: 'promoter' },
    { client_name: 'Client D', csat_score: 9, nps_category: 'promoter' },
    { client_name: 'Client E', csat_score: 8, nps_category: 'passive' },
    { client_name: 'Client F', csat_score: 8, nps_category: 'passive' },
    { client_name: 'Client G', csat_score: 8, nps_category: 'passive' },
    { client_name: 'Client H', csat_score: 9, nps_category: 'passive' },
    { client_name: 'Client I', csat_score: 8, nps_category: 'detractor' },
  ];
  writeXLSX('satisfaction_amber.xlsx', amberData);

  // Red: CSAT 6.5, NPS -20
  const redData = [
    { client_name: 'Client A', csat_score: 7, nps_category: 'passive' },
    { client_name: 'Client B', csat_score: 6, nps_category: 'detractor' },
    { client_name: 'Client C', csat_score: 7, nps_category: 'detractor' },
    { client_name: 'Client D', csat_score: 5, nps_category: 'detractor' },
    { client_name: 'Client E', csat_score: 8, nps_category: 'promoter' },
  ];
  writeXLSX('satisfaction_red.xlsx', redData);

  console.log('\nClient Satisfaction test files:');
  console.log('  - satisfaction_green.xlsx: CSAT 9.1, NPS 70% -> GREEN');
  console.log('  - satisfaction_amber.xlsx: CSAT 8.3, NPS 33% -> AMBER');
  console.log('  - satisfaction_red.xlsx: CSAT 6.6, NPS -20% -> RED');
}

// ============================================
// MONTH CLOSE (excel_month_close)
// Target: 100%, Warning: 75%, Critical: 50%
// ============================================

function generateMonthCloseData() {
  const tasks = [
    'Bank reconciliation',
    'Revenue recognition',
    'Expense accruals',
    'Payroll processing',
    'Fixed asset entries',
    'Intercompany entries',
    'Journal entries review',
    'Trial balance review',
  ];

  // Green: 100% complete (8/8)
  const greenData = tasks.map((task) => ({
    task_name: task,
    status: 'complete',
  }));
  writeXLSX('month_close_green.xlsx', greenData);

  // Amber: 75% complete (6/8)
  const amberData = tasks.map((task, i) => ({
    task_name: task,
    status: i < 6 ? 'complete' : 'pending',
  }));
  writeXLSX('month_close_amber.xlsx', amberData);

  // Red: 38% complete (3/8)
  const redData = tasks.map((task, i) => ({
    task_name: task,
    status: i < 3 ? 'complete' : 'pending',
  }));
  writeXLSX('month_close_red.xlsx', redData);

  console.log('\nMonth Close test files:');
  console.log('  - month_close_green.xlsx: 100% complete -> GREEN');
  console.log('  - month_close_amber.xlsx: 75% complete -> AMBER');
  console.log('  - month_close_red.xlsx: 38% complete -> RED');
}

// ============================================
// STRATEGIC INITIATIVES (excel_strategic)
// Target: 80%, Warning: 60%, Critical: 40%
// ============================================

function generateStrategicData() {
  const initiatives = [
    'Digital Transformation',
    'Market Expansion',
    'Product Innovation',
    'Operational Excellence',
    'Talent Development',
  ];

  // Green: 80% on track (4/5), 3 milestones
  const greenData = initiatives.map((name, i) => ({
    initiative_name: name,
    status: i < 4 ? 'on_track' : 'at_risk',
    milestone_achieved: i < 3,
  }));
  writeXLSX('strategic_green.xlsx', greenData);

  // Amber: 60% on track (3/5), 2 milestones
  const amberData = initiatives.map((name, i) => ({
    initiative_name: name,
    status: i < 3 ? 'on_track' : i < 4 ? 'at_risk' : 'off_track',
    milestone_achieved: i < 2,
  }));
  writeXLSX('strategic_amber.xlsx', amberData);

  // Red: 20% on track (1/5), 0 milestones
  const redData = initiatives.map((name, i) => ({
    initiative_name: name,
    status: i < 1 ? 'on_track' : i < 3 ? 'at_risk' : 'off_track',
    milestone_achieved: false,
  }));
  writeXLSX('strategic_red.xlsx', redData);

  console.log('\nStrategic Initiatives test files:');
  console.log('  - strategic_green.xlsx: 80% on track, 3 milestones -> GREEN');
  console.log('  - strategic_amber.xlsx: 60% on track, 2 milestones -> AMBER');
  console.log('  - strategic_red.xlsx: 20% on track, 0 milestones -> RED');
}

// ============================================
// TRAINING STATUS (excel_training)
// Target: 95%, Warning: 85%, Critical: 75%
// ============================================

function generateTrainingData() {
  const employees = [
    'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis',
    'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor', 'Jack Anderson',
    'Karen Thomas', 'Leo Jackson', 'Maria White', 'Nathan Harris', 'Olivia Martin',
    'Peter Garcia', 'Quinn Martinez', 'Rachel Robinson', 'Sam Clark', 'Tina Lewis',
  ];

  // Green: 95% (19/20 complete)
  const greenData = employees.map((name, i) => ({
    employee_name: name,
    training_complete: i < 19 ? 'yes' : 'no',
  }));
  writeXLSX('training_green.xlsx', greenData);

  // Amber: 85% (17/20 complete)
  const amberData = employees.map((name, i) => ({
    employee_name: name,
    training_complete: i < 17 ? 'yes' : 'no',
  }));
  writeXLSX('training_amber.xlsx', amberData);

  // Red: 65% (13/20 complete)
  const redData = employees.map((name, i) => ({
    employee_name: name,
    training_complete: i < 13 ? 'yes' : 'no',
  }));
  writeXLSX('training_red.xlsx', redData);

  console.log('\nTraining Status test files:');
  console.log('  - training_green.xlsx: 95% complete (19/20) -> GREEN');
  console.log('  - training_amber.xlsx: 85% complete (17/20) -> AMBER');
  console.log('  - training_red.xlsx: 65% complete (13/20) -> RED');
}

// ============================================
// ACCOUNTS PAYABLE (excel_ap)
// Current Rate - Target: 90%, Warning: 75%, Critical: 60%
// ============================================

function generateAPData() {
  // Green: 92% current (11/12)
  const greenData = [
    { invoice_id: 'BILL-001', amount: 5000, status: 'current', age_days: 10 },
    { invoice_id: 'BILL-002', amount: 3200, status: 'current', age_days: 15 },
    { invoice_id: 'BILL-003', amount: 8000, status: 'current', age_days: 8 },
    { invoice_id: 'BILL-004', amount: 4500, status: 'current', age_days: 20 },
    { invoice_id: 'BILL-005', amount: 6200, status: 'current', age_days: 12 },
    { invoice_id: 'BILL-006', amount: 2800, status: 'current', age_days: 5 },
    { invoice_id: 'BILL-007', amount: 9100, status: 'current', age_days: 18 },
    { invoice_id: 'BILL-008', amount: 3700, status: 'current', age_days: 22 },
    { invoice_id: 'BILL-009', amount: 5500, status: 'current', age_days: 14 },
    { invoice_id: 'BILL-010', amount: 4100, status: 'current', age_days: 9 },
    { invoice_id: 'BILL-011', amount: 7200, status: 'current', age_days: 25 },
    { invoice_id: 'BILL-012', amount: 2900, status: 'overdue', age_days: 45 },
  ];
  writeXLSX('ap_green.xlsx', greenData);

  // Amber: 75% current (9/12)
  const amberData = [
    { invoice_id: 'BILL-001', amount: 5000, status: 'current', age_days: 10 },
    { invoice_id: 'BILL-002', amount: 3200, status: 'current', age_days: 15 },
    { invoice_id: 'BILL-003', amount: 8000, status: 'current', age_days: 8 },
    { invoice_id: 'BILL-004', amount: 4500, status: 'current', age_days: 20 },
    { invoice_id: 'BILL-005', amount: 6200, status: 'current', age_days: 12 },
    { invoice_id: 'BILL-006', amount: 2800, status: 'current', age_days: 5 },
    { invoice_id: 'BILL-007', amount: 9100, status: 'current', age_days: 18 },
    { invoice_id: 'BILL-008', amount: 3700, status: 'current', age_days: 22 },
    { invoice_id: 'BILL-009', amount: 5500, status: 'current', age_days: 14 },
    { invoice_id: 'BILL-010', amount: 4100, status: 'overdue', age_days: 38 },
    { invoice_id: 'BILL-011', amount: 7200, status: 'overdue', age_days: 42 },
    { invoice_id: 'BILL-012', amount: 2900, status: 'overdue', age_days: 55 },
  ];
  writeXLSX('ap_amber.xlsx', amberData);

  // Red: 50% current (6/12)
  const redData = [
    { invoice_id: 'BILL-001', amount: 5000, status: 'current', age_days: 10 },
    { invoice_id: 'BILL-002', amount: 3200, status: 'current', age_days: 15 },
    { invoice_id: 'BILL-003', amount: 8000, status: 'current', age_days: 8 },
    { invoice_id: 'BILL-004', amount: 4500, status: 'current', age_days: 20 },
    { invoice_id: 'BILL-005', amount: 6200, status: 'current', age_days: 12 },
    { invoice_id: 'BILL-006', amount: 2800, status: 'current', age_days: 5 },
    { invoice_id: 'BILL-007', amount: 9100, status: 'overdue', age_days: 35 },
    { invoice_id: 'BILL-008', amount: 3700, status: 'overdue', age_days: 40 },
    { invoice_id: 'BILL-009', amount: 5500, status: 'overdue', age_days: 48 },
    { invoice_id: 'BILL-010', amount: 4100, status: 'overdue', age_days: 52 },
    { invoice_id: 'BILL-011', amount: 7200, status: 'overdue', age_days: 60 },
    { invoice_id: 'BILL-012', amount: 2900, status: 'overdue', age_days: 75 },
  ];
  writeXLSX('ap_red.xlsx', redData);

  console.log('\nAccounts Payable test files:');
  console.log('  - ap_green.xlsx: 92% current (11/12) -> GREEN');
  console.log('  - ap_amber.xlsx: 75% current (9/12) -> AMBER');
  console.log('  - ap_red.xlsx: 50% current (6/12) -> RED');
}

// ============================================
// CASH POSITION (excel_cash)
// Cash Position tracked, Runway calculated if burn provided
// ============================================

function generateCashData() {
  // Green: $850K total cash, 10+ months runway
  const greenData = [
    { account_name: 'Operating Account', balance: 450000 },
    { account_name: 'Payroll Account', balance: 150000 },
    { account_name: 'Reserve Account', balance: 250000 },
  ];
  writeXLSX('cash_green.xlsx', greenData);

  // Amber: $425K total cash
  const amberData = [
    { account_name: 'Operating Account', balance: 225000 },
    { account_name: 'Payroll Account', balance: 100000 },
    { account_name: 'Reserve Account', balance: 100000 },
  ];
  writeXLSX('cash_amber.xlsx', amberData);

  // Red: $180K total cash (low runway)
  const redData = [
    { account_name: 'Operating Account', balance: 95000 },
    { account_name: 'Payroll Account', balance: 50000 },
    { account_name: 'Reserve Account', balance: 35000 },
  ];
  writeXLSX('cash_red.xlsx', redData);

  console.log('\nCash Position test files:');
  console.log('  - cash_green.xlsx: $850K total cash -> GREEN');
  console.log('  - cash_amber.xlsx: $425K total cash -> AMBER');
  console.log('  - cash_red.xlsx: $180K total cash -> RED');
}

// ============================================
// DELIVERY TRACKING (excel_delivery)
// On-Time Rate - Target: 95%, Warning: 85%, Critical: 75%
// ============================================

function generateDeliveryData() {
  // Green: 95% on-time (19/20 milestones)
  const greenData = [
    { project_name: 'Acme Analytics', milestone: 'Phase 1 Kickoff', status: 'complete', on_time: 'yes' },
    { project_name: 'Acme Analytics', milestone: 'Requirements', status: 'complete', on_time: 'yes' },
    { project_name: 'Acme Analytics', milestone: 'Design Review', status: 'complete', on_time: 'yes' },
    { project_name: 'Acme Analytics', milestone: 'Phase 1 Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Discovery', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Analysis', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Recommendations', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Final Report', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Assessment', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Roadmap', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Implementation Plan', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Executive Briefing', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 1', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 2', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 3', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Closeout', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Kickoff', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Midpoint', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Draft Delivery', status: 'complete', on_time: 'no' },
    { project_name: 'Epsilon Engagement', milestone: 'Final Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Zeta Initiative', milestone: 'Planning', status: 'in_progress', on_time: '' },
  ];
  writeXLSX('delivery_green.xlsx', greenData);

  // Amber: 85% on-time (17/20 milestones)
  const amberData = [
    { project_name: 'Acme Analytics', milestone: 'Phase 1 Kickoff', status: 'complete', on_time: 'yes' },
    { project_name: 'Acme Analytics', milestone: 'Requirements', status: 'complete', on_time: 'yes' },
    { project_name: 'Acme Analytics', milestone: 'Design Review', status: 'complete', on_time: 'no' },
    { project_name: 'Acme Analytics', milestone: 'Phase 1 Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Discovery', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Analysis', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Recommendations', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Final Report', status: 'complete', on_time: 'no' },
    { project_name: 'Gamma Strategy', milestone: 'Assessment', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Roadmap', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Implementation Plan', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Executive Briefing', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 1', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 2', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 3', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Closeout', status: 'complete', on_time: 'no' },
    { project_name: 'Epsilon Engagement', milestone: 'Kickoff', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Midpoint', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Draft Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Final Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Zeta Initiative', milestone: 'Planning', status: 'in_progress', on_time: '' },
  ];
  writeXLSX('delivery_amber.xlsx', amberData);

  // Red: 70% on-time (14/20 milestones)
  const redData = [
    { project_name: 'Acme Analytics', milestone: 'Phase 1 Kickoff', status: 'complete', on_time: 'yes' },
    { project_name: 'Acme Analytics', milestone: 'Requirements', status: 'complete', on_time: 'no' },
    { project_name: 'Acme Analytics', milestone: 'Design Review', status: 'complete', on_time: 'no' },
    { project_name: 'Acme Analytics', milestone: 'Phase 1 Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Discovery', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Analysis', status: 'complete', on_time: 'no' },
    { project_name: 'Beta Consulting', milestone: 'Recommendations', status: 'complete', on_time: 'yes' },
    { project_name: 'Beta Consulting', milestone: 'Final Report', status: 'complete', on_time: 'no' },
    { project_name: 'Gamma Strategy', milestone: 'Assessment', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Roadmap', status: 'complete', on_time: 'yes' },
    { project_name: 'Gamma Strategy', milestone: 'Implementation Plan', status: 'complete', on_time: 'no' },
    { project_name: 'Gamma Strategy', milestone: 'Executive Briefing', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 1', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 2', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Phase 3', status: 'complete', on_time: 'yes' },
    { project_name: 'Delta Project', milestone: 'Closeout', status: 'complete', on_time: 'no' },
    { project_name: 'Epsilon Engagement', milestone: 'Kickoff', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Midpoint', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Draft Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Epsilon Engagement', milestone: 'Final Delivery', status: 'complete', on_time: 'yes' },
    { project_name: 'Zeta Initiative', milestone: 'Planning', status: 'in_progress', on_time: '' },
    { project_name: 'Eta Project', milestone: 'Discovery', status: 'in_progress', on_time: '' },
  ];
  writeXLSX('delivery_red.xlsx', redData);

  console.log('\nDelivery Tracking test files:');
  console.log('  - delivery_green.xlsx: 95% on-time (19/20) -> GREEN');
  console.log('  - delivery_amber.xlsx: 85% on-time (17/20) -> AMBER');
  console.log('  - delivery_red.xlsx: 70% on-time (14/20) -> RED');
}

// ============================================
// STARSET ANALYTICS (excel_starset)
// Active Users & Data Quality Score
// ============================================

function generateStarsetData() {
  const today = new Date();
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // Green: 25 active users (within 30 days), 92% quality
  const greenData = Array.from({ length: 30 }, (_, i) => ({
    user_id: `user_${String(i + 1).padStart(3, '0')}`,
    last_active: formatDate(i < 25 ? Math.floor(Math.random() * 25) : 45 + Math.floor(Math.random() * 30)),
    data_quality_score: i < 25 ? 88 + Math.floor(Math.random() * 10) : 70 + Math.floor(Math.random() * 15),
  }));
  writeXLSX('starset_green.xlsx', greenData);

  // Amber: 18 active users, 78% quality
  const amberData = Array.from({ length: 30 }, (_, i) => ({
    user_id: `user_${String(i + 1).padStart(3, '0')}`,
    last_active: formatDate(i < 18 ? Math.floor(Math.random() * 28) : 40 + Math.floor(Math.random() * 40)),
    data_quality_score: i < 18 ? 75 + Math.floor(Math.random() * 12) : 60 + Math.floor(Math.random() * 15),
  }));
  writeXLSX('starset_amber.xlsx', amberData);

  // Red: 8 active users, 62% quality
  const redData = Array.from({ length: 30 }, (_, i) => ({
    user_id: `user_${String(i + 1).padStart(3, '0')}`,
    last_active: formatDate(i < 8 ? Math.floor(Math.random() * 25) : 35 + Math.floor(Math.random() * 60)),
    data_quality_score: i < 8 ? 65 + Math.floor(Math.random() * 15) : 50 + Math.floor(Math.random() * 20),
  }));
  writeXLSX('starset_red.xlsx', redData);

  console.log('\nStarset Analytics test files:');
  console.log('  - starset_green.xlsx: 25 active users, ~92% quality -> GREEN');
  console.log('  - starset_amber.xlsx: 18 active users, ~78% quality -> AMBER');
  console.log('  - starset_red.xlsx: 8 active users, ~62% quality -> RED');
}

// ============================================
// HMRF DATABASE (excel_hmrf)
// Coverage percentage & record counts
// ============================================

function generateHMRFData() {
  const hospitals = [
    'City General Hospital',
    'Regional Medical Center',
    'Community Health System',
    'University Hospital',
    'Memorial Hospital',
    'St. Mary\'s Medical',
    'Valley Healthcare',
    'Riverside Hospital',
    'Metro Health',
    'County Medical Center',
  ];

  // Green: 90% coverage (9/10), 150K records
  const greenData = hospitals.map((name, i) => ({
    hospital_name: name,
    mrf_status: i < 9 ? 'covered' : 'pending',
    record_count: 12000 + Math.floor(Math.random() * 8000),
  }));
  writeXLSX('hmrf_green.xlsx', greenData);

  // Amber: 70% coverage (7/10)
  const amberData = hospitals.map((name, i) => ({
    hospital_name: name,
    mrf_status: i < 7 ? 'covered' : i < 9 ? 'pending' : 'missing',
    record_count: 10000 + Math.floor(Math.random() * 10000),
  }));
  writeXLSX('hmrf_amber.xlsx', amberData);

  // Red: 40% coverage (4/10)
  const redData = hospitals.map((name, i) => ({
    hospital_name: name,
    mrf_status: i < 4 ? 'covered' : i < 7 ? 'pending' : 'missing',
    record_count: 8000 + Math.floor(Math.random() * 12000),
  }));
  writeXLSX('hmrf_red.xlsx', redData);

  console.log('\nHMRF Database test files:');
  console.log('  - hmrf_green.xlsx: 90% coverage (9/10) -> GREEN');
  console.log('  - hmrf_amber.xlsx: 70% coverage (7/10) -> AMBER');
  console.log('  - hmrf_red.xlsx: 40% coverage (4/10) -> RED');
}

// Run all generators
console.log('Generating test XLSX files...\n');
console.log('=' .repeat(50));

generateHarvestData();
generateTrainingData();
generateStaffingData();
generateARData();
generateAPData();
generateMonthCloseData();
generateCashData();
generatePipelineData();
generateDeliveryData();
generateSatisfactionData();
generateStarsetData();
generateHMRFData();
generateStrategicData();

console.log('\n' + '='.repeat(50));
console.log(`\nAll test files created in: ${OUTPUT_DIR}`);
console.log('\nUpload instructions:');
console.log('1. Go to the Upload page');
console.log('2. Select the appropriate upload type');
console.log('3. Upload the corresponding test file');
console.log('4. Check the executive\'s scorecard to verify calculations');
