'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { UPLOAD_TYPES } from '@/config/uploadTypes';
import {
  FileSpreadsheet,
  Download,
  ChevronDown,
  ChevronRight,
  Table,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Template documentation for each upload type
const TEMPLATE_DOCS: Record<string, {
  description: string;
  columns: { name: string; type: string; required: boolean; description: string }[];
  exampleRows: Record<string, string | number>[];
  notes?: string[];
  calculatedMetrics: { name: string; formula: string }[];
}> = {
  excel_harvest: {
    description: 'Weekly time tracking compliance export from Harvest. Shows which employees have submitted complete timesheets.',
    columns: [
      { name: 'employee_name', type: 'text', required: true, description: 'Full name of the employee' },
      { name: 'status', type: 'text', required: true, description: '"complete" or "incomplete"' },
    ],
    exampleRows: [
      { employee_name: 'John Smith', status: 'complete' },
      { employee_name: 'Jane Doe', status: 'complete' },
      { employee_name: 'Bob Wilson', status: 'incomplete' },
    ],
    notes: [
      'Export weekly from Harvest',
      'Status is case-insensitive',
    ],
    calculatedMetrics: [
      { name: 'Harvest Rate', formula: '(Complete / Total) × 100%' },
    ],
  },
  excel_training: {
    description: 'Staff training completion tracking. Tracks required training certifications and compliance.',
    columns: [
      { name: 'employee_name', type: 'text', required: true, description: 'Full name of the employee' },
      { name: 'training_complete', type: 'text', required: true, description: '"yes", "no", "true", "false", or "complete"' },
    ],
    exampleRows: [
      { employee_name: 'John Smith', training_complete: 'yes' },
      { employee_name: 'Jane Doe', training_complete: 'yes' },
      { employee_name: 'Bob Wilson', training_complete: 'no' },
    ],
    calculatedMetrics: [
      { name: 'Training Rate', formula: '(Complete / Total) × 100%' },
    ],
  },
  excel_staffing: {
    description: 'Billable hours utilization and open position tracking.',
    columns: [
      { name: 'employee_name', type: 'text', required: true, description: 'Employee name or position title' },
      { name: 'billable_hours', type: 'number', required: false, description: 'Hours billed in the period' },
      { name: 'available_hours', type: 'number', required: false, description: 'Total available hours in the period' },
      { name: 'position_status', type: 'text', required: false, description: '"filled", "open", or "vacant"' },
    ],
    exampleRows: [
      { employee_name: 'John Smith', billable_hours: 32, available_hours: 40, position_status: 'filled' },
      { employee_name: 'Senior Analyst', billable_hours: 0, available_hours: 40, position_status: 'open' },
      { employee_name: 'Jane Doe', billable_hours: 36, available_hours: 40, position_status: 'filled' },
    ],
    notes: [
      'Include both filled positions and open requisitions',
      'Open positions should have 0 billable hours',
    ],
    calculatedMetrics: [
      { name: 'Utilization', formula: '(Total Billable / Total Available) × 100%' },
      { name: 'Open Positions', formula: 'Count where position_status = "open"' },
    ],
  },
  excel_ar: {
    description: 'Accounts Receivable aging report for collections tracking.',
    columns: [
      { name: 'invoice_id', type: 'text', required: true, description: 'Invoice number or ID' },
      { name: 'amount', type: 'number', required: true, description: 'Invoice amount in dollars' },
      { name: 'age_days', type: 'number', required: true, description: 'Days since invoice date' },
    ],
    exampleRows: [
      { invoice_id: 'INV-001', amount: 15000, age_days: 25 },
      { invoice_id: 'INV-002', amount: 8500, age_days: 45 },
      { invoice_id: 'INV-003', amount: 22000, age_days: 95 },
    ],
    notes: [
      'Export from NetSuite or accounting system',
      'Include all open invoices',
    ],
    calculatedMetrics: [
      { name: 'AR 90+ Days', formula: 'Sum of amount where age_days > 90' },
      { name: 'DSO', formula: 'Average of age_days across all invoices' },
    ],
  },
  excel_ap: {
    description: 'Accounts Payable aging and payment scheduling.',
    columns: [
      { name: 'invoice_id', type: 'text', required: true, description: 'Invoice/bill number' },
      { name: 'amount', type: 'number', required: true, description: 'Amount owed in dollars' },
      { name: 'status', type: 'text', required: true, description: '"current", "overdue", or "paid"' },
      { name: 'age_days', type: 'number', required: false, description: 'Days since invoice received (fallback if no status)' },
    ],
    exampleRows: [
      { invoice_id: 'BILL-001', amount: 5000, status: 'current', age_days: 15 },
      { invoice_id: 'BILL-002', amount: 3200, status: 'overdue', age_days: 45 },
      { invoice_id: 'BILL-003', amount: 8000, status: 'current', age_days: 10 },
    ],
    calculatedMetrics: [
      { name: 'AP Current Rate', formula: '(Current invoices / Total) × 100%' },
    ],
  },
  excel_month_close: {
    description: 'Month-end financial close checklist and task status.',
    columns: [
      { name: 'task_name', type: 'text', required: true, description: 'Close task or checklist item' },
      { name: 'status', type: 'text', required: true, description: '"complete", "pending", or "in_progress"' },
    ],
    exampleRows: [
      { task_name: 'Bank Reconciliation', status: 'complete' },
      { task_name: 'Revenue Recognition', status: 'complete' },
      { task_name: 'Expense Accruals', status: 'pending' },
      { task_name: 'Journal Entries', status: 'in_progress' },
    ],
    calculatedMetrics: [
      { name: 'Close Status', formula: '(Complete tasks / Total tasks) × 100%' },
    ],
  },
  excel_cash: {
    description: 'Cash position summary across all accounts.',
    columns: [
      { name: 'account_name', type: 'text', required: true, description: 'Bank account name' },
      { name: 'balance', type: 'number', required: true, description: 'Current balance in dollars' },
    ],
    exampleRows: [
      { account_name: 'Operating Account', balance: 450000 },
      { account_name: 'Payroll Account', balance: 125000 },
      { account_name: 'Reserve Account', balance: 200000 },
    ],
    notes: [
      'Alternative format: single row with cash_position and monthly_burn columns',
      'All balances should be positive numbers',
    ],
    calculatedMetrics: [
      { name: 'Cash Position', formula: 'Sum of all account balances' },
      { name: 'Runway', formula: 'Cash Position / Monthly Burn (if burn rate provided)' },
    ],
  },
  excel_pipeline: {
    description: 'Business development pipeline with opportunities and win tracking.',
    columns: [
      { name: 'opportunity_name', type: 'text', required: true, description: 'Name of the opportunity' },
      { name: 'value', type: 'number', required: true, description: 'Deal value in dollars' },
      { name: 'stage', type: 'text', required: false, description: '"qualified", "proposal", "negotiation", etc.' },
      { name: 'status', type: 'text', required: true, description: '"open", "won", or "lost"' },
    ],
    exampleRows: [
      { opportunity_name: 'Acme Corp Analytics', value: 150000, stage: 'proposal', status: 'open' },
      { opportunity_name: 'Beta Inc Consulting', value: 75000, stage: 'qualified', status: 'open' },
      { opportunity_name: 'Gamma LLC Project', value: 200000, stage: 'negotiation', status: 'won' },
      { opportunity_name: 'Delta Co Assessment', value: 50000, stage: 'proposal', status: 'lost' },
    ],
    calculatedMetrics: [
      { name: 'Pipeline Value', formula: 'Sum of value where status = "open"' },
      { name: 'Qualified Opps', formula: 'Count where stage in ("qualified", "proposal", "negotiation")' },
      { name: 'Win Rate', formula: '(Won / (Won + Lost)) × 100%' },
      { name: 'Avg Deal Size', formula: 'Average value of won deals' },
    ],
  },
  excel_delivery: {
    description: 'Engagement delivery milestone tracking.',
    columns: [
      { name: 'project_name', type: 'text', required: true, description: 'Project or engagement name' },
      { name: 'milestone', type: 'text', required: true, description: 'Milestone description' },
      { name: 'due_date', type: 'date', required: false, description: 'Expected completion date' },
      { name: 'actual_date', type: 'date', required: false, description: 'Actual completion date (if complete)' },
      { name: 'status', type: 'text', required: true, description: '"complete", "delivered", "in_progress", etc.' },
      { name: 'on_time', type: 'text', required: false, description: '"yes" or "no" (alternative to date comparison)' },
    ],
    exampleRows: [
      { project_name: 'Acme Analytics', milestone: 'Phase 1 Delivery', due_date: '2026-01-15', actual_date: '2026-01-14', status: 'complete', on_time: 'yes' },
      { project_name: 'Acme Analytics', milestone: 'Phase 2 Delivery', due_date: '2026-02-15', actual_date: '', status: 'in_progress', on_time: '' },
      { project_name: 'Beta Consulting', milestone: 'Final Report', due_date: '2026-01-20', actual_date: '2026-01-25', status: 'complete', on_time: 'no' },
    ],
    calculatedMetrics: [
      { name: 'On-Time Delivery', formula: '(On-time completions / Total completions) × 100%' },
      { name: 'Active Projects', formula: 'Count of unique projects with incomplete milestones' },
    ],
  },
  excel_client_satisfaction: {
    description: 'Client feedback and satisfaction survey results.',
    columns: [
      { name: 'client_name', type: 'text', required: true, description: 'Client organization name' },
      { name: 'csat_score', type: 'number', required: false, description: 'Satisfaction score (1-10 scale)' },
      { name: 'nps_score', type: 'number', required: false, description: 'Net Promoter Score (-100 to 100)' },
      { name: 'nps_category', type: 'text', required: false, description: '"promoter", "passive", or "detractor" (alternative to nps_score)' },
    ],
    exampleRows: [
      { client_name: 'Acme Corp', csat_score: 9, nps_category: 'promoter' },
      { client_name: 'Beta Inc', csat_score: 7, nps_category: 'passive' },
      { client_name: 'Gamma LLC', csat_score: 8, nps_category: 'promoter' },
    ],
    notes: [
      'CSAT should be on a 1-10 scale',
      'NPS can be provided as a score or category',
    ],
    calculatedMetrics: [
      { name: 'CSAT', formula: 'Average of csat_score' },
      { name: 'NPS', formula: '((Promoters - Detractors) / Total) × 100' },
    ],
  },
  excel_starset: {
    description: 'Starset analytics platform usage and data quality metrics.',
    columns: [
      { name: 'user_id', type: 'text', required: true, description: 'User identifier' },
      { name: 'last_active', type: 'date', required: false, description: 'Last activity date' },
      { name: 'data_quality_score', type: 'number', required: false, description: 'Quality score (0-100)' },
    ],
    exampleRows: [
      { user_id: 'user_001', last_active: '2026-01-20', data_quality_score: 95 },
      { user_id: 'user_002', last_active: '2026-01-18', data_quality_score: 88 },
      { user_id: 'user_003', last_active: '2025-12-15', data_quality_score: 72 },
    ],
    calculatedMetrics: [
      { name: 'Active Users', formula: 'Count where last_active within 30 days' },
      { name: 'Data Quality', formula: 'Average of data_quality_score' },
    ],
  },
  excel_hmrf: {
    description: 'Hospital Machine-Readable File database coverage tracking.',
    columns: [
      { name: 'hospital_name', type: 'text', required: true, description: 'Hospital name' },
      { name: 'mrf_status', type: 'text', required: true, description: '"covered", "pending", or "missing"' },
      { name: 'record_count', type: 'number', required: false, description: 'Number of records (defaults to 1)' },
    ],
    exampleRows: [
      { hospital_name: 'City General Hospital', mrf_status: 'covered', record_count: 15000 },
      { hospital_name: 'Regional Medical Center', mrf_status: 'covered', record_count: 22000 },
      { hospital_name: 'Community Health System', mrf_status: 'pending', record_count: 8000 },
    ],
    calculatedMetrics: [
      { name: 'HMRF Records', formula: 'Sum of record_count' },
      { name: 'HMRF Coverage', formula: '(Covered hospitals / Total hospitals) × 100%' },
    ],
  },
  excel_strategic: {
    description: 'Strategic initiative progress and milestone tracking.',
    columns: [
      { name: 'initiative_name', type: 'text', required: true, description: 'Name of strategic initiative' },
      { name: 'status', type: 'text', required: true, description: '"on_track", "at_risk", or "off_track"' },
      { name: 'milestone_achieved', type: 'text', required: false, description: '"yes" or "no" for key milestone' },
    ],
    exampleRows: [
      { initiative_name: 'Market Expansion', status: 'on_track', milestone_achieved: 'yes' },
      { initiative_name: 'Product Launch', status: 'on_track', milestone_achieved: 'no' },
      { initiative_name: 'Operational Efficiency', status: 'at_risk', milestone_achieved: 'yes' },
    ],
    calculatedMetrics: [
      { name: 'Initiatives On Track', formula: '(On track / Total) × 100%' },
      { name: 'Key Milestones', formula: 'Count where milestone_achieved = "yes"' },
    ],
  },
};

export default function ExcelTemplatesPage() {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Upload Data', href: '/upload' },
            { label: 'Template Documentation' },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/upload"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={14} />
            Back to Upload
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Excel Template Documentation</h1>
          <p className="mt-1 text-gray-500">
            Required columns, data formats, and calculated metrics for each upload type
          </p>
        </div>

        {/* Quick Download Section */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {UPLOAD_TYPES.map((type) => (
              <a
                key={type.id}
                href={`/templates/${type.template}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <FileSpreadsheet size={20} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{type.name}</p>
                  <p className="text-xs text-gray-500">{type.template}</p>
                </div>
                <Download size={14} className="text-gray-400" />
              </a>
            ))}
          </div>
        </div>

        {/* Template Documentation */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Template Specifications</h2>

          {UPLOAD_TYPES.map((type) => {
            const docs = TEMPLATE_DOCS[type.id];
            const isExpanded = expandedType === type.id;

            if (!docs) return null;

            return (
              <div key={type.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Header - clickable */}
                <button
                  onClick={() => setExpandedType(isExpanded ? null : type.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <type.icon size={20} className="text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t px-5 py-4 space-y-6">
                    {/* Description */}
                    <div>
                      <p className="text-sm text-gray-600">{docs.description}</p>
                    </div>

                    {/* Required Columns */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Table size={14} />
                        Required Columns
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left px-3 py-2 font-medium text-gray-700">Column Name</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-700">Type</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-700">Required</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-700">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {docs.columns.map((col) => (
                              <tr key={col.name}>
                                <td className="px-3 py-2 font-mono text-xs text-gray-900 bg-gray-50">{col.name}</td>
                                <td className="px-3 py-2 text-gray-600">{col.type}</td>
                                <td className="px-3 py-2">
                                  <span
                                    className={cn(
                                      'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                                      col.required
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                    )}
                                  >
                                    {col.required ? 'Required' : 'Optional'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-600">{col.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Example Data */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Example Data</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="bg-gray-100">
                              {docs.columns.map((col) => (
                                <th key={col.name} className="text-left px-3 py-2 font-mono text-xs text-gray-900 font-semibold border-b">
                                  {col.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {docs.exampleRows.map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {docs.columns.map((col) => (
                                  <td key={col.name} className="px-3 py-2 border-b text-gray-900">
                                    {row[col.name] !== undefined ? String(row[col.name]) : ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Notes */}
                    {docs.notes && docs.notes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {docs.notes.map((note, i) => (
                            <li key={i} className="text-sm text-gray-600">{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Calculated Metrics */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Calculated Metrics</h4>
                      <div className="space-y-2">
                        {docs.calculatedMetrics.map((metric) => (
                          <div key={metric.name} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">{metric.name}</p>
                              <p className="text-xs text-blue-700 font-mono mt-0.5">{metric.formula}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Download button */}
                    <div className="pt-2">
                      <a
                        href={`/templates/${type.template}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Download size={16} />
                        Download {type.name} Template
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* General Guidelines */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">General Guidelines</h2>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Column names are case-insensitive (e.g., "Status" and "status" both work)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Use the first sheet in your Excel file - only the first sheet is processed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>The first row must contain column headers matching the names above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Dates should be in standard formats (YYYY-MM-DD, MM/DD/YYYY, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>Numbers should not include currency symbols or commas (use 15000, not $15,000)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">6.</span>
              <span>Empty rows are skipped during processing</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
