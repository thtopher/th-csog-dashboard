-- Third Horizon CSOG Dashboard
-- Initial Database Schema
-- Migration: 001_initial_schema.sql

-- ============================================
-- OPERATIONAL DOMAINS
-- Maps to the master process map domains
-- ============================================
CREATE TABLE operational_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    description TEXT,
    steward_name VARCHAR(100),
    steward_email VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    color_hex VARCHAR(7) DEFAULT '#1a1a1a',
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_domains_active ON operational_domains(is_active, display_order);

-- ============================================
-- PROCESSES
-- Hierarchical process structure within domains
-- ============================================
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES operational_domains(id) ON DELETE CASCADE,
    parent_process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    process_tag VARCHAR(50) NOT NULL,
    description TEXT,
    steward_name VARCHAR(100),
    steward_email VARCHAR(255),
    sop_status VARCHAR(20) DEFAULT 'missing' CHECK (sop_status IN ('documented', 'partial', 'missing')),
    sop_link VARCHAR(500),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_processes_domain ON processes(domain_id, display_order);
CREATE INDEX idx_processes_parent ON processes(parent_process_id);
CREATE INDEX idx_processes_tag ON processes(process_tag);

-- ============================================
-- KPI DEFINITIONS
-- What we measure for each process
-- ============================================
CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- 'percent', 'count', 'dollars', 'days', 'hours'
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('higher_better', 'lower_better', 'target')),
    target_value DECIMAL(15,4),
    warning_threshold DECIMAL(15,4),
    critical_threshold DECIMAL(15,4),
    data_source VARCHAR(50) NOT NULL, -- 'excel_harvest', 'excel_training', 'netsuite', 'notion', 'manual'
    source_config JSONB, -- Source-specific configuration
    refresh_cadence VARCHAR(20) DEFAULT 'weekly' CHECK (refresh_cadence IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
    display_format VARCHAR(50) DEFAULT 'number', -- 'number', 'percent', 'currency', 'duration'
    chart_type VARCHAR(50) DEFAULT 'bar', -- 'bar', 'line', 'area', 'stacked_bar', 'gauge'
    is_primary BOOLEAN DEFAULT false, -- Show on domain tile
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kpi_definitions_process ON kpi_definitions(process_id);
CREATE INDEX idx_kpi_definitions_source ON kpi_definitions(data_source);
CREATE INDEX idx_kpi_definitions_primary ON kpi_definitions(is_primary) WHERE is_primary = true;

-- ============================================
-- KPI VALUES
-- Actual data points over time
-- ============================================
CREATE TABLE kpi_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_definition_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('day', 'week', 'biweek', 'month', 'quarter', 'year')),
    value DECIMAL(15,4) NOT NULL,
    numerator DECIMAL(15,4), -- For ratio KPIs
    denominator DECIMAL(15,4),
    previous_value DECIMAL(15,4), -- Cached for trend calculation
    trend_direction VARCHAR(10), -- 'up', 'down', 'flat'
    status VARCHAR(20), -- 'healthy', 'warning', 'critical'
    metadata JSONB, -- Flexible storage: breakdowns, individual data
    source_file VARCHAR(500),
    source_row_count INT,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ingested_by VARCHAR(100),

    UNIQUE(kpi_definition_id, period_start, period_end, period_type)
);

CREATE INDEX idx_kpi_values_definition ON kpi_values(kpi_definition_id, period_start DESC);
CREATE INDEX idx_kpi_values_period ON kpi_values(period_type, period_start DESC);
CREATE INDEX idx_kpi_values_status ON kpi_values(status) WHERE status IN ('warning', 'critical');

-- ============================================
-- ANNOTATIONS
-- Narrative layer: comments, interpretations
-- ============================================
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('domain', 'process', 'kpi_definition', 'kpi_value')),
    target_id UUID NOT NULL,
    annotation_type VARCHAR(30) NOT NULL CHECK (annotation_type IN ('comment', 'trend_note', 'action_item', 'context', 'auto_insight')),
    title VARCHAR(200),
    content TEXT NOT NULL,
    author_name VARCHAR(100),
    author_email VARCHAR(255),
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(100)
);

CREATE INDEX idx_annotations_target ON annotations(target_type, target_id);
CREATE INDEX idx_annotations_pinned ON annotations(is_pinned) WHERE is_pinned = true;

-- ============================================
-- PROCESS GAPS
-- Identified gaps tied to processes
-- ============================================
CREATE TABLE process_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    gap_type VARCHAR(50) NOT NULL CHECK (gap_type IN ('missing_sop', 'unclear_ownership', 'tooling', 'training', 'resource', 'integration', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    impact_description TEXT,
    affected_kpis UUID[], -- Array of kpi_definition IDs
    identified_date DATE DEFAULT CURRENT_DATE,
    identified_by VARCHAR(100),
    assigned_to VARCHAR(100),
    target_resolution_date DATE,
    resolved_date DATE,
    resolution_notes TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'blocked', 'resolved', 'wont_fix')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gaps_process ON process_gaps(process_id);
CREATE INDEX idx_gaps_status ON process_gaps(status) WHERE status NOT IN ('resolved', 'wont_fix');
CREATE INDEX idx_gaps_severity ON process_gaps(severity, status);

-- ============================================
-- USERS
-- Dashboard users and their roles
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'csog_member', 'steward', 'staff', 'viewer')),
    stewarded_domains UUID[], -- Domain IDs this user stewards
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- DATA INGESTION LOG
-- Audit trail for data uploads
-- ============================================
CREATE TABLE ingestion_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL, -- 'excel', 'netsuite', 'notion', 'manual'
    source_name VARCHAR(100), -- e.g., 'harvest_compliance', 'training_status'
    file_name VARCHAR(500),
    file_path VARCHAR(1000),
    file_hash VARCHAR(64), -- SHA-256 for deduplication
    row_count INT,
    records_created INT,
    records_updated INT,
    records_skipped INT,
    validation_errors JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    ingested_by VARCHAR(100)
);

CREATE INDEX idx_ingestion_log_source ON ingestion_log(source_type, source_name);
CREATE INDEX idx_ingestion_log_status ON ingestion_log(status);
CREATE INDEX idx_ingestion_log_date ON ingestion_log(started_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_domains_updated_at BEFORE UPDATE ON operational_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_processes_updated_at BEFORE UPDATE ON processes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kpi_definitions_updated_at BEFORE UPDATE ON kpi_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_annotations_updated_at BEFORE UPDATE ON annotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_gaps_updated_at BEFORE UPDATE ON process_gaps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
