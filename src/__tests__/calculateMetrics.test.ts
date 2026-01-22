import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { calculateMetricsFromUpload } from '../lib/metrics/calculateMetrics';

// Helper to create an XLSX buffer from data
function createXLSXBuffer(data: Record<string, unknown>[]): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return buffer;
}

describe('calculateMetricsFromUpload', () => {
  describe('Harvest Compliance (excel_harvest)', () => {
    it('calculates 100% when all staff complete', async () => {
      const data = [
        { employee_name: 'Alice', status: 'complete' },
        { employee_name: 'Bob', status: 'complete' },
        { employee_name: 'Carol', status: 'complete' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_harvest', buffer, 'test-upload');

      expect(result.success).toBe(true);
      expect(result.metrics).toHaveLength(1);
      expect(result.metrics[0].metricId).toBe('harvestRate');
      expect(result.metrics[0].value).toBe(100);
    });

    it('calculates correct percentage with mixed status', async () => {
      const data = [
        { employee_name: 'Alice', status: 'complete' },
        { employee_name: 'Bob', status: 'complete' },
        { employee_name: 'Carol', status: 'incomplete' },
        { employee_name: 'Dave', status: 'incomplete' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_harvest', buffer, 'test-upload');

      expect(result.metrics[0].value).toBe(50);
    });

    it('handles case-insensitive status', async () => {
      const data = [
        { employee_name: 'Alice', Status: 'COMPLETE' },
        { employee_name: 'Bob', Status: 'Complete' },
        { employee_name: 'Carol', Status: 'INCOMPLETE' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_harvest', buffer, 'test-upload');

      expect(result.metrics[0].value).toBe(67); // 2/3 rounded
    });

    it('returns 0% when no one is complete', async () => {
      const data = [
        { employee_name: 'Alice', status: 'incomplete' },
        { employee_name: 'Bob', status: 'incomplete' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_harvest', buffer, 'test-upload');

      expect(result.metrics[0].value).toBe(0);
    });
  });

  describe('Staffing & Utilization (excel_staffing)', () => {
    it('calculates utilization from billable/available hours', async () => {
      const data = [
        { employee_name: 'Alice', billable_hours: 30, available_hours: 40 },
        { employee_name: 'Bob', billable_hours: 35, available_hours: 40 },
        { employee_name: 'Carol', billable_hours: 25, available_hours: 40 },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_staffing', buffer, 'test-upload');

      const utilizationMetric = result.metrics.find((m) => m.metricId === 'utilization');
      // (30+35+25) / (40+40+40) = 90/120 = 75%
      expect(utilizationMetric?.value).toBe(75);
    });

    it('counts open positions', async () => {
      const data = [
        { position_title: 'Senior Analyst', position_status: 'filled' },
        { position_title: 'Consultant', position_status: 'open' },
        { position_title: 'Manager', position_status: 'open' },
        { position_title: 'Director', position_status: 'filled' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_staffing', buffer, 'test-upload');

      const openPositionsMetric = result.metrics.find((m) => m.metricId === 'openPositions');
      expect(openPositionsMetric?.value).toBe(2);
    });
  });

  describe('AR Aging (excel_ar)', () => {
    it('sums amounts over 90 days', async () => {
      const data = [
        { invoice_id: 'INV-001', amount: 10000, age_days: 30 },
        { invoice_id: 'INV-002', amount: 25000, age_days: 95 },
        { invoice_id: 'INV-003', amount: 50000, age_days: 120 },
        { invoice_id: 'INV-004', amount: 15000, age_days: 60 },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_ar', buffer, 'test-upload');

      const arAgingMetric = result.metrics.find((m) => m.metricId === 'arAging');
      // 25000 + 50000 = 75000
      expect(arAgingMetric?.value).toBe(75000);
    });

    it('calculates DSO as average age', async () => {
      const data = [
        { invoice_id: 'INV-001', amount: 10000, age_days: 30 },
        { invoice_id: 'INV-002', amount: 25000, age_days: 60 },
        { invoice_id: 'INV-003', amount: 50000, age_days: 90 },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_ar', buffer, 'test-upload');

      const dsoMetric = result.metrics.find((m) => m.metricId === 'dso');
      // (30 + 60 + 90) / 3 = 60
      expect(dsoMetric?.value).toBe(60);
    });

    it('returns 0 AR aging when nothing over 90 days', async () => {
      const data = [
        { invoice_id: 'INV-001', amount: 10000, age_days: 30 },
        { invoice_id: 'INV-002', amount: 25000, age_days: 45 },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_ar', buffer, 'test-upload');

      const arAgingMetric = result.metrics.find((m) => m.metricId === 'arAging');
      expect(arAgingMetric?.value).toBe(0);
    });
  });

  describe('AP Aging (excel_ap)', () => {
    it('calculates percentage of current invoices', async () => {
      const data = [
        { invoice_id: 'AP-001', amount: 5000, status: 'current' },
        { invoice_id: 'AP-002', amount: 3000, status: 'current' },
        { invoice_id: 'AP-003', amount: 8000, status: 'overdue' },
        { invoice_id: 'AP-004', amount: 2000, status: 'current' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_ap', buffer, 'test-upload');

      expect(result.metrics[0].metricId).toBe('apAging');
      expect(result.metrics[0].value).toBe(75); // 3/4 = 75%
    });
  });

  describe('Pipeline (excel_pipeline)', () => {
    it('calculates pipeline value from open opportunities', async () => {
      const data = [
        { opportunity_name: 'Deal A', value: 100000, status: 'open' },
        { opportunity_name: 'Deal B', value: 150000, status: 'open' },
        { opportunity_name: 'Deal C', value: 200000, status: 'won' },
        { opportunity_name: 'Deal D', value: 75000, status: 'lost' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_pipeline', buffer, 'test-upload');

      const pipelineMetric = result.metrics.find((m) => m.metricId === 'pipelineValue');
      expect(pipelineMetric?.value).toBe(250000); // 100k + 150k
    });

    it('calculates win rate from closed deals', async () => {
      const data = [
        { opportunity_name: 'Deal A', value: 100000, status: 'won' },
        { opportunity_name: 'Deal B', value: 150000, status: 'won' },
        { opportunity_name: 'Deal C', value: 200000, status: 'lost' },
        { opportunity_name: 'Deal D', value: 75000, status: 'lost' },
        { opportunity_name: 'Deal E', value: 50000, status: 'open' }, // Not counted
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_pipeline', buffer, 'test-upload');

      const winRateMetric = result.metrics.find((m) => m.metricId === 'winRate');
      expect(winRateMetric?.value).toBe(50); // 2/4 = 50%
    });

    it('calculates average deal size from won deals', async () => {
      const data = [
        { opportunity_name: 'Deal A', value: 100000, status: 'won' },
        { opportunity_name: 'Deal B', value: 200000, status: 'won' },
        { opportunity_name: 'Deal C', value: 150000, status: 'lost' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_pipeline', buffer, 'test-upload');

      const avgDealMetric = result.metrics.find((m) => m.metricId === 'avgDealSize');
      expect(avgDealMetric?.value).toBe(150000); // (100k + 200k) / 2
    });
  });

  describe('Client Satisfaction (excel_client_satisfaction)', () => {
    it('calculates average CSAT score', async () => {
      const data = [
        { client_name: 'Client A', csat_score: 9 },
        { client_name: 'Client B', csat_score: 8 },
        { client_name: 'Client C', csat_score: 10 },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_client_satisfaction', buffer, 'test-upload');

      const csatMetric = result.metrics.find((m) => m.metricId === 'csat');
      expect(csatMetric?.value).toBe(9); // (9+8+10) / 3 = 9
    });

    it('calculates NPS from promoter/detractor categories', async () => {
      const data = [
        { client_name: 'Client A', nps_category: 'promoter' },
        { client_name: 'Client B', nps_category: 'promoter' },
        { client_name: 'Client C', nps_category: 'passive' },
        { client_name: 'Client D', nps_category: 'detractor' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_client_satisfaction', buffer, 'test-upload');

      const npsMetric = result.metrics.find((m) => m.metricId === 'nps');
      // (2 promoters - 1 detractor) / 4 total = 1/4 = 25%
      expect(npsMetric?.value).toBe(25);
    });
  });

  describe('Month Close (excel_month_close)', () => {
    it('calculates close progress percentage', async () => {
      const data = [
        { task_name: 'Bank reconciliation', status: 'complete' },
        { task_name: 'Revenue recognition', status: 'complete' },
        { task_name: 'Accruals', status: 'complete' },
        { task_name: 'Journal entries', status: 'pending' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_month_close', buffer, 'test-upload');

      expect(result.metrics[0].value).toBe(75); // 3/4 = 75%
    });
  });

  describe('Strategic Initiatives (excel_strategic)', () => {
    it('calculates initiatives on track percentage', async () => {
      const data = [
        { initiative_name: 'Digital Transformation', status: 'on_track' },
        { initiative_name: 'Market Expansion', status: 'on_track' },
        { initiative_name: 'Cost Reduction', status: 'at_risk' },
        { initiative_name: 'New Product Launch', status: 'off_track' },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_strategic', buffer, 'test-upload');

      const initiativesMetric = result.metrics.find((m) => m.metricId === 'initiativesOnTrack');
      expect(initiativesMetric?.value).toBe(50); // 2/4 = 50%
    });

    it('counts milestones achieved', async () => {
      const data = [
        { initiative_name: 'Initiative A', milestone_achieved: true },
        { initiative_name: 'Initiative B', milestone_achieved: true },
        { initiative_name: 'Initiative C', milestone_achieved: false },
      ];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('excel_strategic', buffer, 'test-upload');

      const milestonesMetric = result.metrics.find((m) => m.metricId === 'keyMilestones');
      expect(milestonesMetric?.value).toBe(2);
    });
  });

  describe('Error handling', () => {
    it('returns error for unknown upload type', async () => {
      const data = [{ foo: 'bar' }];
      const buffer = createXLSXBuffer(data);
      const result = await calculateMetricsFromUpload('unknown_type', buffer, 'test-upload');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No calculator found for upload type: unknown_type');
    });
  });
});
