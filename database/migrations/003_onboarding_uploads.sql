-- Migration: 003_onboarding_uploads.sql
-- Purpose: Add tables for onboarding tracking, upload history, and reporting periods
-- Created: 2026-01-20

-- ============================================
-- ONBOARDING STATE TABLE
-- Tracks per-user onboarding progress
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL UNIQUE,
    executive_id VARCHAR(50),
    current_step INTEGER DEFAULT 1,
    steps_completed TEXT[] DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup by email
CREATE INDEX IF NOT EXISTS idx_onboarding_state_email ON onboarding_state(user_email);

-- Index for finding incomplete onboardings
CREATE INDEX IF NOT EXISTS idx_onboarding_state_incomplete
    ON onboarding_state(completed_at) WHERE completed_at IS NULL;

COMMENT ON TABLE onboarding_state IS 'Tracks onboarding progress for each user';
COMMENT ON COLUMN onboarding_state.current_step IS 'Current step (1-5): Welcome, Checklist, Upload, Baseline, Complete';
COMMENT ON COLUMN onboarding_state.steps_completed IS 'Array of completed step names';

-- ============================================
-- UPLOAD HISTORY TABLE
-- Attribution for all data uploads
-- ============================================

CREATE TABLE IF NOT EXISTS upload_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    uploader_email VARCHAR(255) NOT NULL,
    uploader_name VARCHAR(255) NOT NULL,
    executive_id VARCHAR(50),
    period_type VARCHAR(20) NOT NULL, -- 'week', 'month', 'quarter'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    validation_errors JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Index for finding uploads by user
CREATE INDEX IF NOT EXISTS idx_upload_history_uploader ON upload_history(uploader_email);

-- Index for finding uploads by executive
CREATE INDEX IF NOT EXISTS idx_upload_history_executive ON upload_history(executive_id);

-- Index for finding uploads by type and period
CREATE INDEX IF NOT EXISTS idx_upload_history_type_period
    ON upload_history(upload_type, period_start, period_end);

-- Index for recent uploads
CREATE INDEX IF NOT EXISTS idx_upload_history_recent
    ON upload_history(uploaded_at DESC);

COMMENT ON TABLE upload_history IS 'Complete audit trail of all data uploads with attribution';
COMMENT ON COLUMN upload_history.upload_type IS 'Upload type ID (e.g., excel_harvest, excel_ar)';
COMMENT ON COLUMN upload_history.validation_errors IS 'JSON array of validation errors/warnings';

-- ============================================
-- REPORTING PERIODS TABLE
-- Defines month/quarter deadlines for due dates
-- ============================================

CREATE TABLE IF NOT EXISTS reporting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type VARCHAR(20) NOT NULL, -- 'week', 'biweek', 'month', 'quarter'
    name VARCHAR(100) NOT NULL, -- 'January 2026', 'Q1 2026', 'Week 3 2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    due_date DATE NOT NULL, -- When data is due (usually a few days after end_date)
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER, -- 1-4, null for weekly periods
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding current/active periods
CREATE INDEX IF NOT EXISTS idx_reporting_periods_active
    ON reporting_periods(is_active, end_date);

-- Index for finding periods by date range
CREATE INDEX IF NOT EXISTS idx_reporting_periods_dates
    ON reporting_periods(start_date, end_date);

-- Unique constraint on period type and dates
CREATE UNIQUE INDEX IF NOT EXISTS idx_reporting_periods_unique
    ON reporting_periods(period_type, start_date, end_date);

COMMENT ON TABLE reporting_periods IS 'Defines reporting periods and their due dates';
COMMENT ON COLUMN reporting_periods.due_date IS 'Deadline for submitting data for this period';

-- ============================================
-- REQUIRED UPLOADS TABLE
-- Maps which uploads each executive must provide per period
-- ============================================

CREATE TABLE IF NOT EXISTS required_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executive_id VARCHAR(50) NOT NULL,
    upload_type VARCHAR(50) NOT NULL,
    period_id UUID NOT NULL REFERENCES reporting_periods(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by VARCHAR(255), -- Email of who completed it
    upload_id UUID REFERENCES upload_history(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding required uploads by executive
CREATE INDEX IF NOT EXISTS idx_required_uploads_executive
    ON required_uploads(executive_id);

-- Index for finding incomplete uploads
CREATE INDEX IF NOT EXISTS idx_required_uploads_pending
    ON required_uploads(is_completed, period_id) WHERE is_completed = false;

-- Unique constraint - one required upload per executive/type/period
CREATE UNIQUE INDEX IF NOT EXISTS idx_required_uploads_unique
    ON required_uploads(executive_id, upload_type, period_id);

COMMENT ON TABLE required_uploads IS 'Tracks which uploads each executive must complete per reporting period';
COMMENT ON COLUMN required_uploads.upload_id IS 'Reference to the upload that satisfied this requirement';

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE onboarding_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE required_uploads ENABLE ROW LEVEL SECURITY;

-- Onboarding state: users can only see their own
CREATE POLICY onboarding_state_select ON onboarding_state
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY onboarding_state_insert ON onboarding_state
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY onboarding_state_update ON onboarding_state
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Upload history: users can see their own uploads, admins can see all
CREATE POLICY upload_history_select ON upload_history
    FOR SELECT USING (
        auth.jwt() ->> 'email' = uploader_email
        OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY upload_history_insert ON upload_history
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = uploader_email);

-- Reporting periods: everyone can read
CREATE POLICY reporting_periods_select ON reporting_periods
    FOR SELECT USING (true);

-- Required uploads: users can see their own, admins can see all
CREATE POLICY required_uploads_select ON required_uploads
    FOR SELECT USING (
        auth.jwt() ->> 'executive_id' = executive_id
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_onboarding_state_updated_at
    BEFORE UPDATE ON onboarding_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_required_uploads_updated_at
    BEFORE UPDATE ON required_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Reporting Periods for 2026
-- ============================================

-- Insert monthly periods for 2026
INSERT INTO reporting_periods (period_type, name, start_date, end_date, due_date, fiscal_year, fiscal_quarter)
VALUES
    ('month', 'January 2026', '2026-01-01', '2026-01-31', '2026-02-05', 2026, 1),
    ('month', 'February 2026', '2026-02-01', '2026-02-28', '2026-03-05', 2026, 1),
    ('month', 'March 2026', '2026-03-01', '2026-03-31', '2026-04-05', 2026, 1),
    ('month', 'April 2026', '2026-04-01', '2026-04-30', '2026-05-05', 2026, 2),
    ('month', 'May 2026', '2026-05-01', '2026-05-31', '2026-06-05', 2026, 2),
    ('month', 'June 2026', '2026-06-01', '2026-06-30', '2026-07-05', 2026, 2),
    ('month', 'July 2026', '2026-07-01', '2026-07-31', '2026-08-05', 2026, 3),
    ('month', 'August 2026', '2026-08-01', '2026-08-31', '2026-09-05', 2026, 3),
    ('month', 'September 2026', '2026-09-01', '2026-09-30', '2026-10-05', 2026, 3),
    ('month', 'October 2026', '2026-10-01', '2026-10-31', '2026-11-05', 2026, 4),
    ('month', 'November 2026', '2026-11-01', '2026-11-30', '2026-12-05', 2026, 4),
    ('month', 'December 2026', '2026-12-01', '2026-12-31', '2027-01-05', 2026, 4)
ON CONFLICT DO NOTHING;

-- Insert quarterly periods for 2026
INSERT INTO reporting_periods (period_type, name, start_date, end_date, due_date, fiscal_year, fiscal_quarter)
VALUES
    ('quarter', 'Q1 2026', '2026-01-01', '2026-03-31', '2026-04-15', 2026, 1),
    ('quarter', 'Q2 2026', '2026-04-01', '2026-06-30', '2026-07-15', 2026, 2),
    ('quarter', 'Q3 2026', '2026-07-01', '2026-09-30', '2026-10-15', 2026, 3),
    ('quarter', 'Q4 2026', '2026-10-01', '2026-12-31', '2027-01-15', 2026, 4)
ON CONFLICT DO NOTHING;
