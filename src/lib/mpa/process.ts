/**
 * MPA Processing Pipeline
 *
 * Main entry point for running the Monthly Performance Analysis
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  RevenueCenter,
  CostCenter,
  NonRevenueClient,
  HoursDetail,
  ExpenseDetail,
  OverheadPools,
  AnalysisSummary,
  ValidationItem,
} from './types';
import {
  loadProForma,
  loadCompensation,
  loadHarvestHours,
  loadHarvestExpenses,
  loadPnL,
} from './loaders';
import { classifyAllActivity } from './classification';
import {
  calculateLaborCosts,
  calculateExpenseCosts,
  mergeDirectCostsToRevenueCenters,
  calculateCostCenterCosts,
  calculateNonRevenueClientCosts,
} from './computations';
import {
  calculatePools,
  allocateSGA,
  allocateData,
  allocateWorkplace,
  calculateMargins,
  getTaggedRevenue,
} from './allocations';
import {
  runAllValidations,
  toValidationItems,
  getSummary,
  ValidationData,
} from './validators';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

function getSupabaseClient(): AnySupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase not configured');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface ProcessingResult {
  success: boolean;
  summary: AnalysisSummary;
  validation: ValidationItem[];
  logs: string[];
}

interface BatchRecord {
  id: string;
  month_name: string;
  proforma_file_path: string;
  compensation_file_path: string;
  hours_file_path: string;
  expenses_file_path: string;
  pnl_file_path: string;
}

/**
 * Download file from Supabase Storage
 */
async function downloadFile(supabase: AnySupabaseClient, filePath: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from('uploads')
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download ${filePath}: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Run the full MPA analysis pipeline
 */
export async function runAnalysis(batchId: string): Promise<ProcessingResult> {
  const logs: string[] = [];
  const supabase = getSupabaseClient();

  // Get batch record
  const { data: batch, error: batchError } = await supabase
    .from('mpa_analysis_batches')
    .select('*')
    .eq('id', batchId)
    .single();

  if (batchError || !batch) {
    throw new Error(`Batch ${batchId} not found`);
  }

  const batchRecord = batch as BatchRecord;
  const month = batchRecord.month_name;

  logs.push(`Loading files for ${month}...`);

  // Phase 1: Download and load files
  const [proformaBuffer, compBuffer, hoursBuffer, expensesBuffer, pnlBuffer] = await Promise.all([
    downloadFile(supabase, batchRecord.proforma_file_path),
    downloadFile(supabase, batchRecord.compensation_file_path),
    downloadFile(supabase, batchRecord.hours_file_path),
    downloadFile(supabase, batchRecord.expenses_file_path),
    downloadFile(supabase, batchRecord.pnl_file_path),
  ]);

  const proformaResult = loadProForma(proformaBuffer, month);
  logs.push(...proformaResult.logs);

  const compResult = loadCompensation(compBuffer);
  logs.push(...compResult.logs);

  const hoursResult = loadHarvestHours(hoursBuffer, month);
  logs.push(...hoursResult.logs);

  const expensesResult = loadHarvestExpenses(expensesBuffer);
  logs.push(...expensesResult.logs);

  const pnlResult = loadPnL(pnlBuffer);
  logs.push(...pnlResult.logs);

  logs.push('Files loaded successfully');

  // Phase 2: Classify projects
  logs.push('Classifying projects...');
  const classified = classifyAllActivity(
    proformaResult.data,
    hoursResult.data,
    expensesResult.data
  );

  logs.push(
    `Classified: ${classified.revenueCenters.length} revenue centers, ` +
    `${classified.costCenters.length} cost centers, ` +
    `${classified.nonRevenueClients.length} non-revenue clients`
  );

  // Phase 3: Compute direct costs
  logs.push('Computing direct costs...');

  const laborResult = calculateLaborCosts(hoursResult.data, compResult.data);
  logs.push(...laborResult.logs);

  const expenseResult = calculateExpenseCosts(expensesResult.data);

  let revenueCenters = mergeDirectCostsToRevenueCenters(
    classified.revenueCenters,
    laborResult.laborSummary,
    expenseResult.expenseSummary
  );

  let costCenters = calculateCostCenterCosts(
    classified.costCenters,
    laborResult.hoursDetail,
    expenseResult.expenseDetail
  );

  let nonRevenueClients = calculateNonRevenueClientCosts(
    classified.nonRevenueClients,
    laborResult.hoursDetail,
    expenseResult.expenseDetail
  );

  logs.push('Direct costs computed');

  // Phase 4: Allocate overhead
  logs.push('Allocating overhead pools...');

  const pools = calculatePools(pnlResult.data, costCenters, true);

  revenueCenters = allocateSGA(revenueCenters, pools.sgaPool);
  revenueCenters = allocateData(revenueCenters, pools.dataPool);
  revenueCenters = allocateWorkplace(revenueCenters, pools.workplacePool);
  revenueCenters = calculateMargins(revenueCenters);

  const taggedRevenue = getTaggedRevenue(revenueCenters);

  logs.push(
    `Pools allocated: SG&A $${pools.sgaPool.toLocaleString()}, ` +
    `Data $${pools.dataPool.toLocaleString()}, ` +
    `Workplace $${pools.workplacePool.toLocaleString()}`
  );

  // Phase 5: Validate
  logs.push('Running validation checks...');

  const validationData: ValidationData = {
    revenueCenters,
    costCenters,
    nonRevenueClients,
    proforma: proformaResult.data,
    pools,
    hours: hoursResult.data,
    expenses: expensesResult.data,
    compensation: compResult.data,
    pnl: pnlResult.data,
  };

  const validationResult = runAllValidations(validationData);
  logs.push(`Validation: ${getSummary(validationResult)}`);

  // Calculate summary metrics
  const totalRevenue = revenueCenters.reduce((sum, rc) => sum + rc.revenue, 0);
  const totalLaborCost = revenueCenters.reduce((sum, rc) => sum + rc.laborCost, 0);
  const totalExpenseCost = revenueCenters.reduce((sum, rc) => sum + rc.expenseCost, 0);
  const totalMarginDollars = revenueCenters.reduce((sum, rc) => sum + rc.marginDollars, 0);
  const overallMarginPercent = totalRevenue > 0 ? (totalMarginDollars / totalRevenue) * 100 : 0;

  const summary: AnalysisSummary = {
    totalRevenue,
    totalLaborCost,
    totalExpenseCost,
    totalMarginDollars,
    overallMarginPercent,
    sgaPool: pools.sgaPool,
    dataPool: pools.dataPool,
    workplacePool: pools.workplacePool,
    revenueCenterCount: revenueCenters.length,
    costCenterCount: costCenters.length,
    nonRevenueClientCount: nonRevenueClients.length,
  };

  // Phase 6: Save results
  logs.push('Saving results to database...');

  await saveResults(
    supabase,
    batchId,
    revenueCenters,
    costCenters,
    nonRevenueClients,
    laborResult.hoursDetail,
    expenseResult.expenseDetail,
    pools,
    taggedRevenue,
    summary,
    toValidationItems(validationResult)
  );

  logs.push('Analysis complete!');

  return {
    success: true,
    summary,
    validation: toValidationItems(validationResult),
    logs,
  };
}

/**
 * Save all results to database
 */
async function saveResults(
  supabase: AnySupabaseClient,
  batchId: string,
  revenueCenters: RevenueCenter[],
  costCenters: CostCenter[],
  nonRevenueClients: NonRevenueClient[],
  hoursDetail: HoursDetail[],
  expenseDetail: ExpenseDetail[],
  pools: OverheadPools,
  taggedRevenue: { totalRevenue: number; dataTaggedRevenue: number; wellnessTaggedRevenue: number },
  summary: AnalysisSummary,
  validation: ValidationItem[]
): Promise<void> {
  // Save revenue centers
  if (revenueCenters.length > 0) {
    const rcRows = revenueCenters.map(rc => ({
      batch_id: batchId,
      contract_code: rc.contractCode,
      project_name: rc.projectName,
      proforma_section: rc.proformaSection,
      analysis_category: rc.analysisCategory,
      allocation_tag: rc.allocationTag,
      revenue: rc.revenue,
      hours: rc.hours,
      labor_cost: rc.laborCost,
      expense_cost: rc.expenseCost,
      sga_allocation: rc.sgaAllocation,
      data_allocation: rc.dataAllocation,
      workplace_allocation: rc.workplaceAllocation,
      margin_dollars: rc.marginDollars,
      margin_percent: rc.marginPercent,
    }));

    const { error } = await supabase.from('mpa_revenue_centers').insert(rcRows);
    if (error) throw new Error(`Failed to save revenue centers: ${error.message}`);
  }

  // Save cost centers
  if (costCenters.length > 0) {
    const ccRows = costCenters.map(cc => ({
      batch_id: batchId,
      contract_code: cc.contractCode,
      description: cc.description,
      pool: cc.pool,
      hours: cc.hours,
      labor_cost: cc.laborCost,
      expense_cost: cc.expenseCost,
      total_cost: cc.totalCost,
    }));

    const { error } = await supabase.from('mpa_cost_centers').insert(ccRows);
    if (error) throw new Error(`Failed to save cost centers: ${error.message}`);
  }

  // Save non-revenue clients
  if (nonRevenueClients.length > 0) {
    const nrcRows = nonRevenueClients.map(nrc => ({
      batch_id: batchId,
      contract_code: nrc.contractCode,
      project_name: nrc.projectName,
      hours: nrc.hours,
      labor_cost: nrc.laborCost,
      expense_cost: nrc.expenseCost,
      total_cost: nrc.totalCost,
    }));

    const { error } = await supabase.from('mpa_non_revenue_clients').insert(nrcRows);
    if (error) throw new Error(`Failed to save non-revenue clients: ${error.message}`);
  }

  // Save hours detail
  if (hoursDetail.length > 0) {
    const hdRows = hoursDetail.map(hd => ({
      batch_id: batchId,
      contract_code: hd.contractCode,
      staff_key: hd.staffKey,
      hours: hd.hours,
      hourly_cost: hd.hourlyCost,
      labor_cost: hd.laborCost,
    }));

    const { error } = await supabase.from('mpa_hours_detail').insert(hdRows);
    if (error) throw new Error(`Failed to save hours detail: ${error.message}`);
  }

  // Save expense detail
  if (expenseDetail.length > 0) {
    const edRows = expenseDetail.map(ed => ({
      batch_id: batchId,
      contract_code: ed.contractCode,
      expense_category: null,
      notes: ed.notes,
      amount: ed.amount,
      is_billable: false,
    }));

    const { error } = await supabase.from('mpa_expenses_detail').insert(edRows);
    if (error) throw new Error(`Failed to save expense detail: ${error.message}`);
  }

  // Save pools detail (single row per batch with all pool values)
  const poolsRow = {
    batch_id: batchId,
    sga_from_pnl: pools.sgaFromPnl,
    data_from_pnl: pools.dataFromPnl,
    workplace_from_pnl: pools.workplaceFromPnl,
    nil_excluded: pools.nilExcluded || 0,
    sga_from_cc: pools.sgaFromCc,
    data_from_cc: pools.dataFromCc,
    total_revenue: taggedRevenue.totalRevenue,
    data_tagged_revenue: taggedRevenue.dataTaggedRevenue,
    wellness_tagged_revenue: taggedRevenue.wellnessTaggedRevenue,
  };

  const { error: poolsError } = await supabase.from('mpa_pools_detail').insert([poolsRow]);
  if (poolsError) throw new Error(`Failed to save pools detail: ${poolsError.message}`);

  // Update batch with summary
  const validationPassed = validation.filter(v => v.type === 'fail').length === 0;

  const { error: updateError } = await supabase
    .from('mpa_analysis_batches')
    .update({
      status: 'completed',
      total_revenue: summary.totalRevenue,
      total_labor_cost: summary.totalLaborCost,
      total_expense_cost: summary.totalExpenseCost,
      total_margin_dollars: summary.totalMarginDollars,
      overall_margin_percent: summary.overallMarginPercent,
      sga_pool: summary.sgaPool,
      data_pool: summary.dataPool,
      workplace_pool: summary.workplacePool,
      validation_passed: validationPassed,
      validation_errors: validation,
      processed_at: new Date().toISOString(),
    })
    .eq('id', batchId);

  if (updateError) throw new Error(`Failed to update batch: ${updateError.message}`);
}
