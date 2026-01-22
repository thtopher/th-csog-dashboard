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
