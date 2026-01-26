/**
 * Supabase Database Type Definitions
 * These types are generated from the database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Onboarding state tracking
      onboarding_state: {
        Row: {
          id: string;
          user_email: string;
          executive_id: string | null;
          current_step: number;
          steps_completed: string[];
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          executive_id?: string | null;
          current_step?: number;
          steps_completed?: string[];
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          executive_id?: string | null;
          current_step?: number;
          steps_completed?: string[];
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Upload history with full attribution
      upload_history: {
        Row: {
          id: string;
          upload_type: string;
          file_name: string;
          file_size: number;
          file_path: string | null;
          file_content_type: string | null;
          uploader_email: string;
          uploader_name: string;
          executive_id: string | null;
          period_type: string;
          period_start: string;
          period_end: string;
          records_processed: number;
          records_created: number;
          records_updated: number;
          records_skipped: number;
          validation_errors: Json | null;
          status: string;
          uploaded_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          upload_type: string;
          file_name: string;
          file_size: number;
          file_path?: string | null;
          file_content_type?: string | null;
          uploader_email: string;
          uploader_name: string;
          executive_id?: string | null;
          period_type: string;
          period_start: string;
          period_end: string;
          records_processed?: number;
          records_created?: number;
          records_updated?: number;
          records_skipped?: number;
          validation_errors?: Json | null;
          status?: string;
          uploaded_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          upload_type?: string;
          file_name?: string;
          file_size?: number;
          file_path?: string | null;
          file_content_type?: string | null;
          uploader_email?: string;
          uploader_name?: string;
          executive_id?: string | null;
          period_type?: string;
          period_start?: string;
          period_end?: string;
          records_processed?: number;
          records_created?: number;
          records_updated?: number;
          records_skipped?: number;
          validation_errors?: Json | null;
          status?: string;
          uploaded_at?: string;
          processed_at?: string | null;
        };
      };

      // Reporting periods with deadlines
      reporting_periods: {
        Row: {
          id: string;
          period_type: string;
          name: string;
          start_date: string;
          end_date: string;
          due_date: string;
          fiscal_year: number;
          fiscal_quarter: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          period_type: string;
          name: string;
          start_date: string;
          end_date: string;
          due_date: string;
          fiscal_year: number;
          fiscal_quarter?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          period_type?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          due_date?: string;
          fiscal_year?: number;
          fiscal_quarter?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };

      // Required uploads per executive per period
      required_uploads: {
        Row: {
          id: string;
          executive_id: string;
          upload_type: string;
          period_id: string;
          is_required: boolean;
          is_completed: boolean;
          completed_at: string | null;
          completed_by: string | null;
          upload_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          executive_id: string;
          upload_type: string;
          period_id: string;
          is_required?: boolean;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          upload_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          executive_id?: string;
          upload_type?: string;
          period_id?: string;
          is_required?: boolean;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          upload_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Monthly Performance Analysis - Batch runs
      mpa_analysis_batches: {
        Row: {
          id: string;
          period_id: string | null;
          month_name: string;
          status: string;
          error_message: string | null;
          proforma_file_path: string | null;
          compensation_file_path: string | null;
          hours_file_path: string | null;
          expenses_file_path: string | null;
          pnl_file_path: string | null;
          total_revenue: number | null;
          total_labor_cost: number | null;
          total_expense_cost: number | null;
          total_margin_dollars: number | null;
          overall_margin_percent: number | null;
          sga_pool: number | null;
          data_pool: number | null;
          workplace_pool: number | null;
          revenue_center_count: number;
          cost_center_count: number;
          non_revenue_client_count: number;
          validation_passed: boolean;
          validation_errors: Json | null;
          created_by: string;
          created_at: string;
          processed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period_id?: string | null;
          month_name: string;
          status?: string;
          error_message?: string | null;
          proforma_file_path?: string | null;
          compensation_file_path?: string | null;
          hours_file_path?: string | null;
          expenses_file_path?: string | null;
          pnl_file_path?: string | null;
          total_revenue?: number | null;
          total_labor_cost?: number | null;
          total_expense_cost?: number | null;
          total_margin_dollars?: number | null;
          overall_margin_percent?: number | null;
          sga_pool?: number | null;
          data_pool?: number | null;
          workplace_pool?: number | null;
          revenue_center_count?: number;
          cost_center_count?: number;
          non_revenue_client_count?: number;
          validation_passed?: boolean;
          validation_errors?: Json | null;
          created_by: string;
          created_at?: string;
          processed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          period_id?: string | null;
          month_name?: string;
          status?: string;
          error_message?: string | null;
          proforma_file_path?: string | null;
          compensation_file_path?: string | null;
          hours_file_path?: string | null;
          expenses_file_path?: string | null;
          pnl_file_path?: string | null;
          total_revenue?: number | null;
          total_labor_cost?: number | null;
          total_expense_cost?: number | null;
          total_margin_dollars?: number | null;
          overall_margin_percent?: number | null;
          sga_pool?: number | null;
          data_pool?: number | null;
          workplace_pool?: number | null;
          revenue_center_count?: number;
          cost_center_count?: number;
          non_revenue_client_count?: number;
          validation_passed?: boolean;
          validation_errors?: Json | null;
          created_by?: string;
          created_at?: string;
          processed_at?: string | null;
          updated_at?: string;
        };
      };

      // Monthly Performance Analysis - Revenue Centers
      mpa_revenue_centers: {
        Row: {
          id: string;
          batch_id: string;
          contract_code: string;
          project_name: string | null;
          proforma_section: string | null;
          analysis_category: string | null;
          allocation_tag: string | null;
          revenue: number;
          hours: number;
          labor_cost: number;
          expense_cost: number;
          sga_allocation: number;
          data_allocation: number;
          workplace_allocation: number;
          margin_dollars: number;
          margin_percent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          contract_code: string;
          project_name?: string | null;
          proforma_section?: string | null;
          analysis_category?: string | null;
          allocation_tag?: string | null;
          revenue?: number;
          hours?: number;
          labor_cost?: number;
          expense_cost?: number;
          sga_allocation?: number;
          data_allocation?: number;
          workplace_allocation?: number;
          margin_dollars?: number;
          margin_percent?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          contract_code?: string;
          project_name?: string | null;
          proforma_section?: string | null;
          analysis_category?: string | null;
          allocation_tag?: string | null;
          revenue?: number;
          hours?: number;
          labor_cost?: number;
          expense_cost?: number;
          sga_allocation?: number;
          data_allocation?: number;
          workplace_allocation?: number;
          margin_dollars?: number;
          margin_percent?: number;
          created_at?: string;
        };
      };

      // Monthly Performance Analysis - Cost Centers
      mpa_cost_centers: {
        Row: {
          id: string;
          batch_id: string;
          contract_code: string;
          description: string | null;
          pool: string;
          hours: number;
          labor_cost: number;
          expense_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          contract_code: string;
          description?: string | null;
          pool?: string;
          hours?: number;
          labor_cost?: number;
          expense_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          contract_code?: string;
          description?: string | null;
          pool?: string;
          hours?: number;
          labor_cost?: number;
          expense_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };

      // Monthly Performance Analysis - Non-Revenue Clients
      mpa_non_revenue_clients: {
        Row: {
          id: string;
          batch_id: string;
          contract_code: string;
          project_name: string | null;
          hours: number;
          labor_cost: number;
          expense_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          contract_code: string;
          project_name?: string | null;
          hours?: number;
          labor_cost?: number;
          expense_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          contract_code?: string;
          project_name?: string | null;
          hours?: number;
          labor_cost?: number;
          expense_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };

      // Monthly Performance Analysis - Hours Detail
      mpa_hours_detail: {
        Row: {
          id: string;
          batch_id: string;
          contract_code: string;
          staff_key: string;
          hours: number;
          hourly_cost: number;
          labor_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          contract_code: string;
          staff_key: string;
          hours?: number;
          hourly_cost?: number;
          labor_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          contract_code?: string;
          staff_key?: string;
          hours?: number;
          hourly_cost?: number;
          labor_cost?: number;
          created_at?: string;
        };
      };

      // Monthly Performance Analysis - Expenses Detail
      mpa_expenses_detail: {
        Row: {
          id: string;
          batch_id: string;
          contract_code: string;
          expense_date: string | null;
          amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          contract_code: string;
          expense_date?: string | null;
          amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          contract_code?: string;
          expense_date?: string | null;
          amount?: number;
          notes?: string | null;
          created_at?: string;
        };
      };

      // Monthly Performance Analysis - Pools Detail
      mpa_pools_detail: {
        Row: {
          id: string;
          batch_id: string;
          sga_from_pnl: number;
          data_from_pnl: number;
          workplace_from_pnl: number;
          nil_excluded: number;
          sga_from_cc: number;
          data_from_cc: number;
          total_revenue: number;
          data_tagged_revenue: number;
          wellness_tagged_revenue: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          sga_from_pnl?: number;
          data_from_pnl?: number;
          workplace_from_pnl?: number;
          nil_excluded?: number;
          sga_from_cc?: number;
          data_from_cc?: number;
          total_revenue?: number;
          data_tagged_revenue?: number;
          wellness_tagged_revenue?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          sga_from_pnl?: number;
          data_from_pnl?: number;
          workplace_from_pnl?: number;
          nil_excluded?: number;
          sga_from_cc?: number;
          data_from_cc?: number;
          total_revenue?: number;
          data_tagged_revenue?: number;
          wellness_tagged_revenue?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience type aliases
export type OnboardingState = Tables<'onboarding_state'>;
export type UploadHistory = Tables<'upload_history'>;
export type ReportingPeriod = Tables<'reporting_periods'>;
export type RequiredUpload = Tables<'required_uploads'>;

// Monthly Performance Analysis types
export type MPAAnalysisBatch = Tables<'mpa_analysis_batches'>;
export type MPARevenueCenter = Tables<'mpa_revenue_centers'>;
export type MPACostCenter = Tables<'mpa_cost_centers'>;
export type MPANonRevenueClient = Tables<'mpa_non_revenue_clients'>;
export type MPAHoursDetail = Tables<'mpa_hours_detail'>;
export type MPAExpensesDetail = Tables<'mpa_expenses_detail'>;
export type MPAPoolsDetail = Tables<'mpa_pools_detail'>;

// MPA Insert types
export type InsertMPAAnalysisBatch = InsertTables<'mpa_analysis_batches'>;
export type InsertMPARevenueCenter = InsertTables<'mpa_revenue_centers'>;
export type InsertMPACostCenter = InsertTables<'mpa_cost_centers'>;
export type InsertMPANonRevenueClient = InsertTables<'mpa_non_revenue_clients'>;
export type InsertMPAHoursDetail = InsertTables<'mpa_hours_detail'>;
export type InsertMPAExpensesDetail = InsertTables<'mpa_expenses_detail'>;
export type InsertMPAPoolsDetail = InsertTables<'mpa_pools_detail'>;

// MPA file type for upload wizard
export type MPAFileType = 'proforma' | 'compensation' | 'hours' | 'expenses' | 'pnl';

// MPA validation result item
export interface MPAValidationItem {
  type: 'pass' | 'warn' | 'fail';
  message: string;
}
