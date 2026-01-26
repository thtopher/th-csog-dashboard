/**
 * Upload Schemas
 * Defines expected columns for each upload type
 */

export interface ColumnSchema {
  name: string;
  aliases: string[];
  required: boolean;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email';
  format?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface UploadSchema {
  id: string;
  name: string;
  columns: ColumnSchema[];
  periodType: 'week' | 'month' | 'quarter';
}

/**
 * Column schemas for all upload types
 */
export const UPLOAD_SCHEMAS: Record<string, UploadSchema> = {
  excel_harvest: {
    id: 'excel_harvest',
    name: 'Harvest Compliance',
    periodType: 'week',
    columns: [
      {
        name: 'employee_name',
        aliases: ['name', 'employee', 'staff', 'team_member', 'person'],
        required: true,
        type: 'string',
      },
      {
        name: 'week_ending',
        aliases: ['week', 'period_end', 'week_end', 'date', 'period'],
        required: true,
        type: 'date',
      },
      {
        name: 'hours_logged',
        aliases: ['hours', 'total_hours', 'logged_hours', 'time', 'harvest_hours'],
        required: true,
        type: 'number',
        min: 0,
        max: 80,
      },
      {
        name: 'compliant',
        aliases: ['is_compliant', 'compliance', 'status', 'submitted'],
        required: true,
        type: 'boolean',
      },
    ],
  },

  excel_ar: {
    id: 'excel_ar',
    name: 'Accounts Receivable Aging',
    periodType: 'month',
    columns: [
      {
        name: 'invoice_number',
        aliases: ['invoice', 'invoice_no', 'inv_num', 'number'],
        required: true,
        type: 'string',
      },
      {
        name: 'client_name',
        aliases: ['client', 'customer', 'customer_name', 'company'],
        required: true,
        type: 'string',
      },
      {
        name: 'amount',
        aliases: ['invoice_amount', 'total', 'balance', 'outstanding'],
        required: true,
        type: 'number',
        min: 0,
      },
      {
        name: 'due_date',
        aliases: ['payment_due', 'date_due', 'due'],
        required: true,
        type: 'date',
      },
      {
        name: 'days_outstanding',
        aliases: ['aging', 'days', 'age', 'days_overdue'],
        required: true,
        type: 'number',
        min: 0,
      },
    ],
  },

  excel_pipeline: {
    id: 'excel_pipeline',
    name: 'BD Pipeline',
    periodType: 'month',
    columns: [
      {
        name: 'opportunity_name',
        aliases: ['opportunity', 'deal', 'project', 'name', 'opp_name'],
        required: true,
        type: 'string',
      },
      {
        name: 'stage',
        aliases: ['pipeline_stage', 'status', 'phase'],
        required: true,
        type: 'string',
      },
      {
        name: 'value',
        aliases: ['amount', 'deal_value', 'contract_value', 'total_value'],
        required: true,
        type: 'number',
        min: 0,
      },
      {
        name: 'probability',
        aliases: ['win_probability', 'prob', 'likelihood', 'close_probability'],
        required: true,
        type: 'number',
        min: 0,
        max: 100,
      },
      {
        name: 'close_date',
        aliases: ['expected_close', 'target_date', 'close', 'expected_date'],
        required: true,
        type: 'date',
      },
    ],
  },

  excel_training: {
    id: 'excel_training',
    name: 'Training Status',
    periodType: 'month',
    columns: [
      {
        name: 'employee_name',
        aliases: ['name', 'employee', 'staff', 'person'],
        required: true,
        type: 'string',
      },
      {
        name: 'training_name',
        aliases: ['training', 'course', 'module', 'program'],
        required: true,
        type: 'string',
      },
      {
        name: 'status',
        aliases: ['completion_status', 'state', 'completed'],
        required: true,
        type: 'string',
      },
      {
        name: 'due_date',
        aliases: ['deadline', 'required_by', 'due'],
        required: false,
        type: 'date',
      },
      {
        name: 'completed_date',
        aliases: ['completion_date', 'finished', 'done_date'],
        required: false,
        type: 'date',
      },
    ],
  },

  excel_staffing: {
    id: 'excel_staffing',
    name: 'Staffing & Utilization',
    periodType: 'month',
    columns: [
      {
        name: 'employee_name',
        aliases: ['name', 'employee', 'staff'],
        required: true,
        type: 'string',
      },
      {
        name: 'billable_hours',
        aliases: ['billable', 'client_hours', 'charged_hours'],
        required: true,
        type: 'number',
        min: 0,
      },
      {
        name: 'total_hours',
        aliases: ['hours', 'available_hours', 'capacity'],
        required: true,
        type: 'number',
        min: 0,
      },
      {
        name: 'utilization_rate',
        aliases: ['utilization', 'util_rate', 'rate'],
        required: false,
        type: 'number',
        min: 0,
        max: 100,
      },
    ],
  },

  excel_ap: {
    id: 'excel_ap',
    name: 'Accounts Payable',
    periodType: 'month',
    columns: [
      {
        name: 'vendor_name',
        aliases: ['vendor', 'supplier', 'payee'],
        required: true,
        type: 'string',
      },
      {
        name: 'invoice_number',
        aliases: ['invoice', 'inv_num', 'bill_number'],
        required: true,
        type: 'string',
      },
      {
        name: 'amount',
        aliases: ['invoice_amount', 'total', 'balance'],
        required: true,
        type: 'number',
        min: 0,
      },
      {
        name: 'due_date',
        aliases: ['payment_due', 'due'],
        required: true,
        type: 'date',
      },
    ],
  },

  excel_month_close: {
    id: 'excel_month_close',
    name: 'Month-End Close',
    periodType: 'month',
    columns: [
      {
        name: 'account',
        aliases: ['account_name', 'gl_account', 'line_item'],
        required: true,
        type: 'string',
      },
      {
        name: 'debit',
        aliases: ['debit_amount', 'dr'],
        required: false,
        type: 'number',
      },
      {
        name: 'credit',
        aliases: ['credit_amount', 'cr'],
        required: false,
        type: 'number',
      },
      {
        name: 'balance',
        aliases: ['ending_balance', 'total'],
        required: true,
        type: 'number',
      },
    ],
  },

  excel_cash: {
    id: 'excel_cash',
    name: 'Cash Position',
    periodType: 'week',
    columns: [
      {
        name: 'date',
        aliases: ['report_date', 'as_of'],
        required: true,
        type: 'date',
      },
      {
        name: 'bank_balance',
        aliases: ['balance', 'cash', 'available'],
        required: true,
        type: 'number',
      },
      {
        name: 'pending_receipts',
        aliases: ['expected_in', 'incoming'],
        required: false,
        type: 'number',
      },
      {
        name: 'pending_payments',
        aliases: ['expected_out', 'outgoing'],
        required: false,
        type: 'number',
      },
    ],
  },

  excel_delivery: {
    id: 'excel_delivery',
    name: 'Delivery Tracking',
    periodType: 'month',
    columns: [
      {
        name: 'project_name',
        aliases: ['project', 'engagement', 'client_project'],
        required: true,
        type: 'string',
      },
      {
        name: 'milestone',
        aliases: ['deliverable', 'phase', 'stage'],
        required: true,
        type: 'string',
      },
      {
        name: 'target_date',
        aliases: ['due_date', 'planned', 'expected'],
        required: true,
        type: 'date',
      },
      {
        name: 'actual_date',
        aliases: ['completed', 'delivered', 'completion_date'],
        required: false,
        type: 'date',
      },
      {
        name: 'status',
        aliases: ['milestone_status', 'state'],
        required: true,
        type: 'string',
      },
    ],
  },

  excel_client_satisfaction: {
    id: 'excel_client_satisfaction',
    name: 'Client Satisfaction',
    periodType: 'quarter',
    columns: [
      {
        name: 'client_name',
        aliases: ['client', 'customer', 'company'],
        required: true,
        type: 'string',
      },
      {
        name: 'project_name',
        aliases: ['project', 'engagement'],
        required: false,
        type: 'string',
      },
      {
        name: 'satisfaction_score',
        aliases: ['score', 'rating', 'nps', 'csat'],
        required: true,
        type: 'number',
        min: 0,
        max: 10,
      },
      {
        name: 'survey_date',
        aliases: ['date', 'response_date'],
        required: true,
        type: 'date',
      },
      {
        name: 'comments',
        aliases: ['feedback', 'notes'],
        required: false,
        type: 'string',
      },
    ],
  },

  excel_starset: {
    id: 'excel_starset',
    name: 'Starset Analytics',
    periodType: 'month',
    columns: [
      {
        name: 'metric_name',
        aliases: ['metric', 'kpi', 'measure'],
        required: true,
        type: 'string',
      },
      {
        name: 'value',
        aliases: ['metric_value', 'count', 'amount'],
        required: true,
        type: 'number',
      },
      {
        name: 'period',
        aliases: ['date', 'month', 'report_period'],
        required: true,
        type: 'date',
      },
    ],
  },

  excel_hmrf: {
    id: 'excel_hmrf',
    name: 'HMRF Database',
    periodType: 'month',
    columns: [
      {
        name: 'hospital_name',
        aliases: ['hospital', 'facility', 'provider'],
        required: true,
        type: 'string',
      },
      {
        name: 'mrf_status',
        aliases: ['status', 'compliance_status'],
        required: true,
        type: 'string',
      },
      {
        name: 'last_updated',
        aliases: ['update_date', 'date'],
        required: true,
        type: 'date',
      },
      {
        name: 'record_count',
        aliases: ['records', 'count'],
        required: false,
        type: 'number',
      },
    ],
  },

  excel_strategic: {
    id: 'excel_strategic',
    name: 'Strategic Initiatives',
    periodType: 'quarter',
    columns: [
      {
        name: 'initiative_name',
        aliases: ['initiative', 'project', 'program'],
        required: true,
        type: 'string',
      },
      {
        name: 'owner',
        aliases: ['lead', 'responsible', 'sponsor'],
        required: true,
        type: 'string',
      },
      {
        name: 'status',
        aliases: ['progress', 'state'],
        required: true,
        type: 'string',
      },
      {
        name: 'percent_complete',
        aliases: ['completion', 'progress_percent', 'pct_complete'],
        required: false,
        type: 'number',
        min: 0,
        max: 100,
      },
      {
        name: 'target_date',
        aliases: ['due_date', 'deadline'],
        required: false,
        type: 'date',
      },
    ],
  },

  notion_pipeline: {
    id: 'notion_pipeline',
    name: 'Pipeline Export (Notion)',
    periodType: 'month',
    columns: [
      {
        name: 'prospect_name',
        aliases: ['name', 'company', 'client', 'opportunity'],
        required: true,
        type: 'string',
      },
      {
        name: 'qual_level',
        aliases: ['qualified_level', 'probability', 'stage', 'status'],
        required: true,
        type: 'string',
      },
      {
        name: 'projected_amount',
        aliases: ['amount', 'value', 'deal_value', 'contract_value'],
        required: true,
        type: 'number',
      },
      {
        name: 'business_unit',
        aliases: ['unit', 'division', 'segment'],
        required: false,
        type: 'string',
      },
      {
        name: 'accrual_months',
        aliases: ['anticipated_accrual', 'accrual', 'months'],
        required: false,
        type: 'string',
      },
      {
        name: 'contract_duration',
        aliases: ['duration', 'term', 'length'],
        required: false,
        type: 'number',
      },
    ],
  },

  excel_proforma: {
    id: 'excel_proforma',
    name: 'Pro Forma Workbook',
    periodType: 'month',
    columns: [
      // This schema is minimal since the actual values are entered via confirmation modal
      {
        name: 'period',
        aliases: ['date', 'month', 'report_period'],
        required: false,
        type: 'date',
      },
    ],
  },
};

/**
 * Get schema by upload type ID
 */
export function getSchema(uploadTypeId: string): UploadSchema | undefined {
  return UPLOAD_SCHEMAS[uploadTypeId];
}
