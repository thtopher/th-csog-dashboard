-- Third Horizon CSOG Dashboard
-- CEO Scorecard KPIs
-- Seeds: 006_ceo_scorecard_kpis.sql
--
-- New KPIs required for F-EOC6 CEO Scorecard per SOP

-- ============================================
-- CONTRACT MARGIN (CP Process - CSO)
-- Required: Shows contract profitability
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary)
VALUES (
    'k-ceo-margin-1',
    'p-cso-cp',
    'Contract Margin',
    'Margin',
    'Average margin across active contracts',
    'percent',
    'higher_better',
    35.0,
    25.0,
    15.0,
    'netsuite',
    'monthly',
    'percent',
    'line',
    true
);

-- ============================================
-- CASH POSITION (CF Process - President)
-- Required: Shows current cash available
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary)
VALUES (
    'k-ceo-cash-1',
    'p-pres-cf',
    'Cash Position',
    'Cash',
    'Current cash available in operating accounts',
    'dollars',
    'higher_better',
    500000,
    300000,
    150000,
    'netsuite',
    'weekly',
    'currency',
    'area',
    true
);

-- ============================================
-- OPEN POSITIONS (ST Process - COO)
-- Required: Shows unfilled staffing needs
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary)
VALUES (
    'k-ceo-staff-1',
    'p-coo-st',
    'Open Positions',
    'Open Roles',
    'Number of open positions being actively recruited',
    'count',
    'target',
    2,
    4,
    6,
    'manual',
    'weekly',
    'number',
    'bar',
    true
);

-- ============================================
-- STRATEGIC INITIATIVES ON TRACK (F-SP Function - CEO)
-- Required: Shows strategic initiative progress
-- ============================================
INSERT INTO kpi_definitions (id, process_id, name, short_name, description, unit, direction, target_value, warning_threshold, critical_threshold, data_source, refresh_cadence, display_format, chart_type, is_primary)
VALUES (
    'k-ceo-strategic-1',
    'p-ceo-f-sp',
    'Initiatives On Track',
    'On Track',
    'Percentage of strategic initiatives meeting milestones',
    'percent',
    'higher_better',
    90.0,
    75.0,
    60.0,
    'manual',
    'monthly',
    'percent',
    'gauge',
    true
);

-- ============================================
-- SAMPLE VALUES FOR NEW KPIs
-- ============================================
INSERT INTO kpi_values (kpi_definition_id, period_start, period_end, period_type, value, status, trend_direction) VALUES
    -- Contract Margin
    ('k-ceo-margin-1', '2025-01-01', '2025-01-31', 'month', 32.0, 'healthy', 'up'),

    -- Cash Position
    ('k-ceo-cash-1', '2025-01-13', '2025-01-19', 'week', 850000, 'healthy', 'up'),

    -- Open Positions
    ('k-ceo-staff-1', '2025-01-13', '2025-01-19', 'week', 3, 'warning', 'flat'),

    -- Strategic Initiatives
    ('k-ceo-strategic-1', '2025-01-01', '2025-01-31', 'month', 83.0, 'healthy', 'flat');
