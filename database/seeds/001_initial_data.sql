-- Third Horizon CSOG Dashboard
-- Initial Seed Data
-- Seeds: 001_initial_data.sql

-- ============================================
-- OPERATIONAL DOMAINS
-- Based on Third Horizon's operational structure
-- ============================================
INSERT INTO operational_domains (id, name, short_name, description, steward_name, display_order, color_hex, icon_name) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Growth (BD)', 'Growth', 'Business development, pipeline management, and new client acquisition', 'Cheryl', 1, '#2563eb', 'trending-up'),
    ('d1000000-0000-0000-0000-000000000002', 'Service Delivery', 'Delivery', 'Active engagement execution and contract performance', NULL, 2, '#059669', 'briefcase'),
    ('d1000000-0000-0000-0000-000000000003', 'Contract Closure', 'Closure', 'Contract completion, closeout procedures, and client transitions', NULL, 3, '#7c3aed', 'check-circle'),
    ('d1000000-0000-0000-0000-000000000004', 'Finance', 'Finance', 'Financial operations, billing, receivables, and book closing', NULL, 4, '#dc2626', 'dollar-sign'),
    ('d1000000-0000-0000-0000-000000000005', 'Internal Operations', 'Ops', 'HR, compliance, training, and internal processes', 'Jordana', 5, '#ea580c', 'settings'),
    ('d1000000-0000-0000-0000-000000000006', 'Board & CSOG', 'Board', 'Board communications, CSOG activities, and governance', NULL, 6, '#0891b2', 'users');

-- ============================================
-- PROCESSES - Growth (BD)
-- ============================================
INSERT INTO processes (id, domain_id, name, process_tag, description, display_order) VALUES
    ('p1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Lead Generation', 'bd_lead_gen', 'Identifying and qualifying new business opportunities', 1),
    ('p1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Proposal Development', 'bd_proposals', 'Creating and submitting proposals and RFP responses', 2),
    ('p1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Contracting', 'bd_contracting', 'Negotiating and executing new contracts', 3),
    ('p1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'Client Onboarding', 'bd_onboarding', 'Transitioning new clients to active engagement', 4);

-- ============================================
-- PROCESSES - Service Delivery
-- ============================================
INSERT INTO processes (id, domain_id, name, process_tag, description, display_order) VALUES
    ('p2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Engagement Management', 'delivery_mgmt', 'Day-to-day management of active engagements', 1),
    ('p2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'Deliverable Production', 'delivery_deliverables', 'Creating and delivering client work products', 2),
    ('p2000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'Client Communication', 'delivery_comms', 'Ongoing client communication and relationship management', 3),
    ('p2000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'Quality Assurance', 'delivery_qa', 'Quality review and assurance processes', 4);

-- ============================================
-- PROCESSES - Contract Closure
-- ============================================
INSERT INTO processes (id, domain_id, name, process_tag, description, display_order) VALUES
    ('p3000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'Closeout Procedures', 'closure_procedures', 'Formal contract closeout steps', 1),
    ('p3000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'Final Billing', 'closure_billing', 'Final invoicing and payment collection', 2),
    ('p3000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'Knowledge Transfer', 'closure_knowledge', 'Documenting lessons learned and client handoff', 3);

-- ============================================
-- PROCESSES - Finance
-- ============================================
INSERT INTO processes (id, domain_id, name, process_tag, description, display_order) VALUES
    ('p4000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'Invoicing', 'finance_invoicing', 'Client billing and invoice generation', 1),
    ('p4000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'Receivables', 'finance_receivables', 'Accounts receivable and collections', 2),
    ('p4000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000004', 'Book Closing', 'finance_book_close', 'Monthly and quarterly book closing', 3),
    ('p4000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004', 'Financial Reporting', 'finance_reporting', 'Financial statements and management reports', 4);

-- ============================================
-- PROCESSES - Internal Operations
-- ============================================
INSERT INTO processes (id, domain_id, name, process_tag, description, display_order) VALUES
    ('p5000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'Time Tracking', 'ops_time_tracking', 'Harvest time entry compliance and management', 1),
    ('p5000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000005', 'Training Compliance', 'ops_training', 'Required training completion tracking', 2),
    ('p5000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005', 'HR Administration', 'ops_hr', 'HR processes and employee administration', 3),
    ('p5000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000005', 'IT & Security', 'ops_it', 'IT systems and cybersecurity', 4);

-- ============================================
-- PROCESSES - Board & CSOG
-- ============================================
INSERT INTO processes (id, domain_id, name, process_tag, description, display_order) VALUES
    ('p6000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006', 'Board Communications', 'board_comms', 'Board meeting preparation and communications', 1),
    ('p6000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000006', 'CSOG Meetings', 'board_csog', 'CSOG meeting management and follow-up', 2),
    ('p6000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000006', 'Strategic Planning', 'board_strategy', 'Strategic planning and initiative tracking', 3);

-- ============================================
-- KPI DEFINITIONS - Internal Operations (Time Tracking)
-- Example KPIs for Harvest compliance
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary) VALUES
    ('k1000000-0000-0000-0000-000000000001', 'p5000000-0000-0000-0000-000000000001', 'Harvest Compliance Rate', 'Compliance', 'Percentage of staff with fully compliant time entries', 'percent', 'higher_better', 95.0, 85.0, 75.0, 'excel_harvest', 'weekly', 'percent', 'bar', true),
    ('k1000000-0000-0000-0000-000000000002', 'p5000000-0000-0000-0000-000000000001', 'Average Hours Logged', 'Avg Hours', 'Average hours logged per person per week', 'hours', 'target', 40.0, 35.0, 30.0, 'excel_harvest', 'weekly', 'number', 'line', false),
    ('k1000000-0000-0000-0000-000000000003', 'p5000000-0000-0000-0000-000000000001', 'Missing Time Entries', 'Missing', 'Number of staff with missing time entries', 'count', 'lower_better', 0, 2, 5, 'excel_harvest', 'weekly', 'number', 'bar', false);

-- ============================================
-- KPI DEFINITIONS - Internal Operations (Training)
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary) VALUES
    ('k2000000-0000-0000-0000-000000000001', 'p5000000-0000-0000-0000-000000000002', 'Sexual Harassment Training Completion', 'SH Training', 'Percentage of staff who have completed required SH training', 'percent', 'higher_better', 100.0, 90.0, 80.0, 'excel_training', 'monthly', 'percent', 'bar', true),
    ('k2000000-0000-0000-0000-000000000002', 'p5000000-0000-0000-0000-000000000002', 'Cybersecurity Training Completion', 'Cyber Training', 'Percentage of staff who have completed cybersecurity training', 'percent', 'higher_better', 100.0, 90.0, 80.0, 'excel_training', 'monthly', 'percent', 'bar', false);

-- ============================================
-- KPI DEFINITIONS - Finance
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary) VALUES
    ('k3000000-0000-0000-0000-000000000001', 'p4000000-0000-0000-0000-000000000002', 'Days Sales Outstanding', 'DSO', 'Average days to collect receivables', 'days', 'lower_better', 45.0, 60.0, 90.0, 'netsuite', 'monthly', 'number', 'line', true),
    ('k3000000-0000-0000-0000-000000000002', 'p4000000-0000-0000-0000-000000000002', 'Aging Receivables (90+ Days)', 'AR 90+', 'Total receivables over 90 days', 'dollars', 'lower_better', 0, 50000, 100000, 'netsuite', 'monthly', 'currency', 'bar', false);

-- ============================================
-- KPI DEFINITIONS - Growth (BD)
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary) VALUES
    ('k4000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'Active Pipeline Value', 'Pipeline', 'Total value of active opportunities', 'dollars', 'higher_better', 2000000, 1500000, 1000000, 'notion', 'weekly', 'currency', 'area', true),
    ('k4000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 'Proposals Submitted', 'Proposals', 'Number of proposals submitted this period', 'count', 'higher_better', 5, 3, 1, 'notion', 'monthly', 'number', 'bar', false),
    ('k4000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 'Win Rate', 'Win Rate', 'Percentage of proposals won', 'percent', 'higher_better', 40.0, 30.0, 20.0, 'notion', 'quarterly', 'percent', 'line', true);

-- ============================================
-- SAMPLE KPI VALUES (for demo purposes)
-- ============================================
INSERT INTO kpi_values (kpi_definition_id, period_start, period_end, period_type, value, status, trend_direction) VALUES
    -- Harvest Compliance - last 4 weeks
    ('k1000000-0000-0000-0000-000000000001', '2024-12-02', '2024-12-08', 'week', 82.0, 'warning', 'up'),
    ('k1000000-0000-0000-0000-000000000001', '2024-12-09', '2024-12-15', 'week', 88.0, 'warning', 'up'),
    ('k1000000-0000-0000-0000-000000000001', '2024-12-16', '2024-12-22', 'week', 91.0, 'warning', 'up'),
    ('k1000000-0000-0000-0000-000000000001', '2024-12-23', '2024-12-29', 'week', 94.0, 'healthy', 'up'),

    -- Training Completion
    ('k2000000-0000-0000-0000-000000000001', '2024-12-01', '2024-12-31', 'month', 95.0, 'healthy', 'flat'),
    ('k2000000-0000-0000-0000-000000000002', '2024-12-01', '2024-12-31', 'month', 88.0, 'warning', 'up');
