-- Migration: 005_monthly_performance_analysis.sql
-- Purpose: Add tables for Monthly Performance Analysis (MPA) integration
-- Created: 2026-01-26

-- ============================================
-- MPA ANALYSIS BATCHES TABLE
-- Stores batch metadata, file paths, summary metrics
-- ============================================

CREATE TABLE IF NOT EXISTS mpa_analysis_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Period reference
    period_id UUID REFERENCES reporting_periods(id) ON DELETE SET NULL,
    month_name VARCHAR(50) NOT NULL, -- e.g., 'November2025'

    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,

    -- File paths in Supabase Storage
    proforma_file_path TEXT,
    compensation_file_path TEXT,
    hours_file_path TEXT,
    expenses_file_path TEXT,
    pnl_file_path TEXT,

    -- Summary metrics (populated after processing)
    total_revenue DECIMAL(15,2),
    total_labor_cost DECIMAL(15,2),
    total_expense_cost DECIMAL(15,2),
    total_margin_dollars DECIMAL(15,2),
    overall_margin_percent DECIMAL(5,2),

    -- Overhead pools
    sga_pool DECIMAL(15,2),
    data_pool DECIMAL(15,2),
    workplace_pool DECIMAL(15,2),

    -- Counts
    revenue_center_count INTEGER DEFAULT 0,
    cost_center_count INTEGER DEFAULT 0,
    non_revenue_client_count INTEGER DEFAULT 0,

    -- Validation
    validation_passed BOOLEAN DEFAULT false,
    validation_errors JSONB, -- Array of {type: 'pass'|'warn'|'fail', message: string}

    -- Attribution
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mpa_analysis_batches
CREATE INDEX IF NOT EXISTS idx_mpa_batches_status ON mpa_analysis_batches(status);
CREATE INDEX IF NOT EXISTS idx_mpa_batches_month ON mpa_analysis_batches(month_name);
CREATE INDEX IF NOT EXISTS idx_mpa_batches_created_by ON mpa_analysis_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_mpa_batches_created_at ON mpa_analysis_batches(created_at DESC);

COMMENT ON TABLE mpa_analysis_batches IS 'Stores Monthly Performance Analysis batch runs with files and summary metrics';
COMMENT ON COLUMN mpa_analysis_batches.month_name IS 'Month identifier like November2025 used for file parsing';
COMMENT ON COLUMN mpa_analysis_batches.validation_errors IS 'JSON array of validation results: {type, message}';

-- ============================================
-- MPA REVENUE CENTERS TABLE
-- Revenue-bearing projects with margins
-- ============================================

CREATE TABLE IF NOT EXISTS mpa_revenue_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES mpa_analysis_batches(id) ON DELETE CASCADE,

    -- Project identification
    contract_code VARCHAR(100) NOT NULL,
    project_name VARCHAR(500),
    proforma_section VARCHAR(200),
    analysis_category VARCHAR(100),
    allocation_tag VARCHAR(20), -- 'Data', 'Wellness', or empty

    -- Financials
    revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
    hours DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(15,2) DEFAULT 0,
    expense_cost DECIMAL(15,2) DEFAULT 0,

    -- Allocations
    sga_allocation DECIMAL(15,2) DEFAULT 0,
    data_allocation DECIMAL(15,2) DEFAULT 0,
    workplace_allocation DECIMAL(15,2) DEFAULT 0,

    -- Margins
    margin_dollars DECIMAL(15,2) DEFAULT 0,
    margin_percent DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mpa_revenue_centers
CREATE INDEX IF NOT EXISTS idx_mpa_rev_batch ON mpa_revenue_centers(batch_id);
CREATE INDEX IF NOT EXISTS idx_mpa_rev_code ON mpa_revenue_centers(contract_code);
CREATE INDEX IF NOT EXISTS idx_mpa_rev_tag ON mpa_revenue_centers(allocation_tag);
CREATE INDEX IF NOT EXISTS idx_mpa_rev_margin ON mpa_revenue_centers(margin_percent DESC);

COMMENT ON TABLE mpa_revenue_centers IS 'Revenue-bearing projects with full P&L breakdown';
COMMENT ON COLUMN mpa_revenue_centers.allocation_tag IS 'Data or Wellness tag for targeted pool allocation';

-- ============================================
-- MPA COST CENTERS TABLE
-- Internal overhead projects
-- ============================================

CREATE TABLE IF NOT EXISTS mpa_cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES mpa_analysis_batches(id) ON DELETE CASCADE,

    -- Project identification
    contract_code VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    pool VARCHAR(20) DEFAULT 'SGA', -- 'SGA' or 'DATA'

    -- Costs
    hours DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(15,2) DEFAULT 0,
    expense_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mpa_cost_centers
CREATE INDEX IF NOT EXISTS idx_mpa_cc_batch ON mpa_cost_centers(batch_id);
CREATE INDEX IF NOT EXISTS idx_mpa_cc_code ON mpa_cost_centers(contract_code);
CREATE INDEX IF NOT EXISTS idx_mpa_cc_pool ON mpa_cost_centers(pool);

COMMENT ON TABLE mpa_cost_centers IS 'Internal cost centers (THS- codes and configured overhead)';
COMMENT ON COLUMN mpa_cost_centers.pool IS 'Which overhead pool this cost center contributes to';

-- ============================================
-- MPA NON-REVENUE CLIENTS TABLE
-- Activity without revenue
-- ============================================

CREATE TABLE IF NOT EXISTS mpa_non_revenue_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES mpa_analysis_batches(id) ON DELETE CASCADE,

    -- Project identification
    contract_code VARCHAR(100) NOT NULL,
    project_name VARCHAR(500),

    -- Costs (no revenue)
    hours DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(15,2) DEFAULT 0,
    expense_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mpa_non_revenue_clients
CREATE INDEX IF NOT EXISTS idx_mpa_nrc_batch ON mpa_non_revenue_clients(batch_id);
CREATE INDEX IF NOT EXISTS idx_mpa_nrc_code ON mpa_non_revenue_clients(contract_code);

COMMENT ON TABLE mpa_non_revenue_clients IS 'Projects with activity but no Pro Forma revenue';

-- ============================================
-- MPA HOURS DETAIL TABLE
-- Drill-down: hours by person/project
-- ============================================

CREATE TABLE IF NOT EXISTS mpa_hours_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES mpa_analysis_batches(id) ON DELETE CASCADE,

    -- Keys
    contract_code VARCHAR(100) NOT NULL,
    staff_key VARCHAR(200) NOT NULL, -- Last name from Harvest

    -- Data
    hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    hourly_cost DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mpa_hours_detail
CREATE INDEX IF NOT EXISTS idx_mpa_hours_batch ON mpa_hours_detail(batch_id);
CREATE INDEX IF NOT EXISTS idx_mpa_hours_code ON mpa_hours_detail(contract_code);
CREATE INDEX IF NOT EXISTS idx_mpa_hours_staff ON mpa_hours_detail(staff_key);
CREATE INDEX IF NOT EXISTS idx_mpa_hours_batch_code ON mpa_hours_detail(batch_id, contract_code);

COMMENT ON TABLE mpa_hours_detail IS 'Detailed hours breakdown by person for drill-down';

-- ============================================
-- MPA EXPENSES DETAIL TABLE
-- Drill-down: expenses by project
-- ============================================

CREATE TABLE IF NOT EXISTS mpa_expenses_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES mpa_analysis_batches(id) ON DELETE CASCADE,

    -- Keys
    contract_code VARCHAR(100) NOT NULL,

    -- Data
    expense_date DATE,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mpa_expenses_detail
CREATE INDEX IF NOT EXISTS idx_mpa_exp_batch ON mpa_expenses_detail(batch_id);
CREATE INDEX IF NOT EXISTS idx_mpa_exp_code ON mpa_expenses_detail(contract_code);
CREATE INDEX IF NOT EXISTS idx_mpa_exp_batch_code ON mpa_expenses_detail(batch_id, contract_code);

COMMENT ON TABLE mpa_expenses_detail IS 'Detailed expense line items for drill-down';

-- ============================================
-- MPA POOLS METADATA TABLE
-- Stores pool calculation details for audit
-- ============================================

CREATE TABLE IF NOT EXISTS mpa_pools_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES mpa_analysis_batches(id) ON DELETE CASCADE,

    -- Pool values from P&L
    sga_from_pnl DECIMAL(15,2) DEFAULT 0,
    data_from_pnl DECIMAL(15,2) DEFAULT 0,
    workplace_from_pnl DECIMAL(15,2) DEFAULT 0,
    nil_excluded DECIMAL(15,2) DEFAULT 0,

    -- Pool values from cost centers
    sga_from_cc DECIMAL(15,2) DEFAULT 0,
    data_from_cc DECIMAL(15,2) DEFAULT 0,

    -- Tagged revenue for allocation denominators
    total_revenue DECIMAL(15,2) DEFAULT 0,
    data_tagged_revenue DECIMAL(15,2) DEFAULT 0,
    wellness_tagged_revenue DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mpa_pools_detail
CREATE INDEX IF NOT EXISTS idx_mpa_pools_batch ON mpa_pools_detail(batch_id);

COMMENT ON TABLE mpa_pools_detail IS 'Detailed pool calculation breakdown for audit trail';

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all MPA tables
ALTER TABLE mpa_analysis_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpa_revenue_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpa_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpa_non_revenue_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpa_hours_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpa_expenses_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpa_pools_detail ENABLE ROW LEVEL SECURITY;

-- Batches: users can see their own, admins and allowed executives can see all
CREATE POLICY mpa_batches_select ON mpa_analysis_batches
    FOR SELECT USING (
        auth.jwt() ->> 'email' = created_by
        OR auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'executive_id' IN ('exec-cfo', 'exec-ceo', 'exec-president', 'exec-coo')
    );

CREATE POLICY mpa_batches_insert ON mpa_analysis_batches
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' = created_by
        OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY mpa_batches_update ON mpa_analysis_batches
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = created_by
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Revenue centers: same as batches (linked via batch_id)
CREATE POLICY mpa_rev_select ON mpa_revenue_centers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mpa_analysis_batches b
            WHERE b.id = mpa_revenue_centers.batch_id
            AND (
                auth.jwt() ->> 'email' = b.created_by
                OR auth.jwt() ->> 'role' = 'admin'
                OR auth.jwt() ->> 'executive_id' IN ('exec-cfo', 'exec-ceo', 'exec-president', 'exec-coo')
            )
        )
    );

-- Cost centers: same pattern
CREATE POLICY mpa_cc_select ON mpa_cost_centers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mpa_analysis_batches b
            WHERE b.id = mpa_cost_centers.batch_id
            AND (
                auth.jwt() ->> 'email' = b.created_by
                OR auth.jwt() ->> 'role' = 'admin'
                OR auth.jwt() ->> 'executive_id' IN ('exec-cfo', 'exec-ceo', 'exec-president', 'exec-coo')
            )
        )
    );

-- Non-revenue clients: same pattern
CREATE POLICY mpa_nrc_select ON mpa_non_revenue_clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mpa_analysis_batches b
            WHERE b.id = mpa_non_revenue_clients.batch_id
            AND (
                auth.jwt() ->> 'email' = b.created_by
                OR auth.jwt() ->> 'role' = 'admin'
                OR auth.jwt() ->> 'executive_id' IN ('exec-cfo', 'exec-ceo', 'exec-president', 'exec-coo')
            )
        )
    );

-- Hours detail: same pattern
CREATE POLICY mpa_hours_select ON mpa_hours_detail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mpa_analysis_batches b
            WHERE b.id = mpa_hours_detail.batch_id
            AND (
                auth.jwt() ->> 'email' = b.created_by
                OR auth.jwt() ->> 'role' = 'admin'
                OR auth.jwt() ->> 'executive_id' IN ('exec-cfo', 'exec-ceo', 'exec-president', 'exec-coo')
            )
        )
    );

-- Expenses detail: same pattern
CREATE POLICY mpa_exp_select ON mpa_expenses_detail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mpa_analysis_batches b
            WHERE b.id = mpa_expenses_detail.batch_id
            AND (
                auth.jwt() ->> 'email' = b.created_by
                OR auth.jwt() ->> 'role' = 'admin'
                OR auth.jwt() ->> 'executive_id' IN ('exec-cfo', 'exec-ceo', 'exec-president', 'exec-coo')
            )
        )
    );

-- Pools detail: same pattern
CREATE POLICY mpa_pools_select ON mpa_pools_detail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mpa_analysis_batches b
            WHERE b.id = mpa_pools_detail.batch_id
            AND (
                auth.jwt() ->> 'email' = b.created_by
                OR auth.jwt() ->> 'role' = 'admin'
                OR auth.jwt() ->> 'executive_id' IN ('exec-cfo', 'exec-ceo', 'exec-president', 'exec-coo')
            )
        )
    );

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at on mpa_analysis_batches
CREATE TRIGGER update_mpa_batches_updated_at
    BEFORE UPDATE ON mpa_analysis_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
