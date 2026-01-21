-- Third Horizon CSOG Dashboard
-- SOP Processes and Functions Seed Data
-- Seeds: 003_sop_processes.sql
--
-- Based on Third Horizon SOP 2026 Planning Workbook
-- Total: 27 Processes + 14 Functions = 41 items

-- ============================================
-- STEP 1: Add a new domain for CEO Functions
-- (CEO has no operational processes, only governance functions)
-- ============================================
INSERT INTO operational_domains (id, name, short_name, description, steward_name, display_order, color_hex, icon_name) VALUES
    ('d1000000-0000-0000-0000-000000000007', 'CEO Functions', 'CEO', 'Strategic leadership and governance functions', 'David Smith', 0, '#1a1a1a', 'crown')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    steward_name = EXCLUDED.steward_name;

-- ============================================
-- STEP 2: Clear existing sample processes that don't match SOP
-- (We'll recreate them with proper codes and executive assignments)
-- ============================================
-- Note: In production, you'd migrate existing data instead of deleting
-- DELETE FROM processes WHERE code IS NULL;

-- ============================================
-- CEO FUNCTIONS (F-prefix) - 7 items
-- Executive: David Smith
-- Domain: CEO Functions
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-ceo-f-eoc', 'd1000000-0000-0000-0000-000000000007', 'exec-ceo', 'Executive Operating Cadence', 'F-EOC', 'ceo_eoc', 'function', 'Own the company operating system, executive meeting rhythm, decision rights, and accountability', 1, 'documented'),
    ('p-ceo-f-cai', 'd1000000-0000-0000-0000-000000000007', 'exec-ceo', 'Capital Allocation & Investment Review', 'F-CAI', 'ceo_cai', 'function', 'Investment thesis, capital allocation rules, ROI evaluation, and portfolio performance', 2, 'documented'),
    ('p-ceo-f-qad', 'd1000000-0000-0000-0000-000000000007', 'exec-ceo', 'Quality Assurance & Delivery Standards', 'F-QAD', 'ceo_qad', 'function', 'Non-negotiable quality standards, methodology integrity, and QA culture', 3, 'documented'),
    ('p-ceo-f-pem', 'd1000000-0000-0000-0000-000000000007', 'exec-ceo', 'Partnership & Ecosystem Management', 'F-PEM', 'ceo_pem', 'function', 'Strategic partnerships, referral networks, and ecosystem governance', 4, 'documented'),
    ('p-ceo-f-sp', 'd1000000-0000-0000-0000-000000000007', 'exec-ceo', 'Strategic Planning', 'F-SP', 'ceo_sp', 'function', 'Long-range narrative, horizon management, and strategic initiative sponsorship', 5, 'documented'),
    ('p-ceo-f-crc', 'd1000000-0000-0000-0000-000000000007', 'exec-ceo', 'Client Executive Relationship Continuity', 'F-CRC', 'ceo_crc', 'function', 'Executive sponsor stewardship, relationship continuity, and client advocacy', 6, 'documented'),
    ('p-ceo-f-cpe', 'd1000000-0000-0000-0000-000000000007', 'exec-ceo', 'Community & Political Engagement', 'F-CPE', 'ceo_cpe', 'function', 'Community credibility, political sensitivity, and stakeholder coalition leadership', 7, 'documented');

-- ============================================
-- PRESIDENT PROCESSES - 6 items
-- Executive: Greg Williams
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-pres-cf', 'd1000000-0000-0000-0000-000000000004', 'exec-president', 'Cash Flow Management', 'CF', 'pres_cf', 'process', 'Weekly finance review, cash position tracking, and cash constraint monitoring', 1, 'documented'),
    ('p-pres-cr', 'd1000000-0000-0000-0000-000000000005', 'exec-president', 'Compensation & Role Changes', 'CR', 'pres_cr', 'process', 'Annual review cycle, compensation recommendations, and payroll updates', 2, 'documented'),
    ('p-pres-tp', 'd1000000-0000-0000-0000-000000000004', 'exec-president', 'Tax Preparation and Filing', 'TP', 'pres_tp', 'process', '1099 preparation, tax firm coordination, and filing compliance', 3, 'documented'),
    ('p-pres-em', 'd1000000-0000-0000-0000-000000000004', 'exec-president', 'Expense Management', 'EM', 'pres_em', 'process', 'Expense collection, policy compliance review, and reimbursement processing', 4, 'documented'),
    ('p-pres-pa', 'd1000000-0000-0000-0000-000000000005', 'exec-president', 'Procurement & Vendor Approval', 'PA', 'pres_pa', 'process', 'Procurement request review, budget assessment, and vendor execution', 5, 'documented'),
    ('p-pres-vm', 'd1000000-0000-0000-0000-000000000005', 'exec-president', 'Contractor/Vendor Management', 'VM', 'pres_vm', 'process', 'Contractor onboarding, documentation, performance tracking, and offboarding', 6, 'documented');

-- ============================================
-- PRESIDENT FUNCTIONS - 4 items
-- Executive: Greg Williams
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-pres-f-ip', 'd1000000-0000-0000-0000-000000000006', 'exec-president', 'Intellectual Property Governance', 'F-IP', 'pres_ip', 'function', 'IP identification, ownership determination, usage guidelines, and risk management', 7, 'documented'),
    ('p-pres-f-oc', 'd1000000-0000-0000-0000-000000000006', 'exec-president', 'Organizational Chart Management', 'F-OC', 'pres_oc', 'function', 'Org chart changes, role alignment, and structure governance', 8, 'documented'),
    ('p-pres-f-er', 'd1000000-0000-0000-0000-000000000006', 'exec-president', 'Enterprise Risk Management', 'F-ER', 'pres_er', 'function', 'Risk identification, assessment, register maintenance, and mitigation oversight', 9, 'documented'),
    ('p-pres-f-km', 'd1000000-0000-0000-0000-000000000006', 'exec-president', 'Knowledge Management', 'F-KM', 'pres_km', 'function', 'Knowledge asset identification, capture standards, and institutional memory', 10, 'documented');

-- ============================================
-- COO PROCESSES - 9 items
-- Executive: Jordana Choucair
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-coo-oc', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Operationalizing Client Contracts', 'OC', 'coo_oc', 'process', 'Contract review, execution tracking, scope clarification, and internal handoff', 1, 'documented'),
    ('p-coo-wd', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Website Development & Maintenance', 'WD', 'coo_wd', 'process', 'Website strategy, content updates, and publishing approval', 2, 'documented'),
    ('p-coo-tm', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Template Generation and Management', 'TM', 'coo_tm', 'process', 'Template need identification, development, approval, and maintenance', 3, 'documented'),
    ('p-coo-st', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Staffing', 'ST', 'coo_st', 'process', 'Hiring needs assessment, job posting, interviewing, and offer management', 4, 'documented'),
    ('p-coo-eo', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Employee Onboarding & Orientation', 'EO', 'coo_eo', 'process', 'Pre-boarding, first day setup, orientation sessions, and 90-day check-in', 5, 'documented'),
    ('p-coo-es', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Employee Separation - Voluntary', 'ES', 'coo_es', 'process', 'Resignation acceptance, exit interview, knowledge transfer, and offboarding', 6, 'documented'),
    ('p-coo-et', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Employee Separation - Involuntary', 'ET', 'coo_et', 'process', 'Termination decision, communication, access revocation, and documentation', 7, 'documented'),
    ('p-coo-pm', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Performance Management', 'PM', 'coo_pm', 'process', 'Goal setting, ongoing feedback, annual reviews, and performance improvement', 8, 'documented'),
    ('p-coo-tc', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Training & Harvest Compliance', 'TC', 'coo_tc', 'process', 'Training requirements, compliance tracking, and time entry management', 9, 'documented');

-- ============================================
-- COO FUNCTIONS - 5 items
-- Executive: Jordana Choucair
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-coo-f-bom', 'd1000000-0000-0000-0000-000000000006', 'exec-coo', 'Board of Managers Facilitation', 'F-BOM', 'coo_bom', 'function', 'Board meeting scheduling, materials preparation, and minutes documentation', 10, 'documented'),
    ('p-coo-f-bi', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Business Insurance', 'F-BI', 'coo_bi', 'function', 'Insurance coverage review, renewal coordination, and claims management', 11, 'documented'),
    ('p-coo-f-ba', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Benefits Administration', 'F-BA', 'coo_ba', 'function', 'Benefits enrollment, vendor management, and employee support', 12, 'documented'),
    ('p-coo-f-eh', 'd1000000-0000-0000-0000-000000000005', 'exec-coo', 'Employee Handbook', 'F-EH', 'coo_eh', 'function', 'Policy documentation, handbook updates, and compliance review', 13, 'documented'),
    ('p-coo-f-tlg', 'd1000000-0000-0000-0000-000000000006', 'exec-coo', 'Thought Leadership & Publications Governance', 'F-TLG', 'coo_tlg', 'function', 'Publication standards, approval workflows, and quality control', 14, 'documented');

-- ============================================
-- CFO PROCESSES - 6 items
-- Executive: Aisha Waheed
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-cfo-ar', 'd1000000-0000-0000-0000-000000000004', 'exec-cfo', 'Accounts Receivable', 'AR', 'cfo_ar', 'process', 'Invoice generation, collection tracking, aging analysis, and escalation', 1, 'documented'),
    ('p-cfo-ap', 'd1000000-0000-0000-0000-000000000004', 'exec-cfo', 'Accounts Payable', 'AP', 'cfo_ap', 'process', 'Invoice receipt, approval routing, payment processing, and vendor management', 2, 'documented'),
    ('p-cfo-mc', 'd1000000-0000-0000-0000-000000000004', 'exec-cfo', 'Month-End Close', 'MC', 'cfo_mc', 'process', 'Transaction reconciliation, accruals, journal entries, and reporting', 3, 'documented'),
    ('p-cfo-fr', 'd1000000-0000-0000-0000-000000000004', 'exec-cfo', 'Financial Reporting', 'FR', 'cfo_fr', 'process', 'Financial statement preparation, management reports, and board packages', 4, 'documented'),
    ('p-cfo-im', 'd1000000-0000-0000-0000-000000000004', 'exec-cfo', 'Inventory Lifecycle Management', 'IM', 'cfo_im', 'process', 'Asset tracking, depreciation schedules, and disposal procedures', 5, 'documented'),
    ('p-cfo-sm', 'd1000000-0000-0000-0000-000000000004', 'exec-cfo', 'SaaS Access & Subscription Management', 'SM', 'cfo_sm', 'process', 'Subscription tracking, renewal management, and cost optimization', 6, 'documented');

-- ============================================
-- CDAO PROCESSES - 4 items
-- Executive: Chris Hart
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-cdao-sa', 'd1000000-0000-0000-0000-000000000005', 'exec-cdao', 'Starset Analytics LV1-LV3', 'SA', 'cdao_sa', 'process', 'Data product development, quality assurance, and client delivery', 1, 'documented'),
    ('p-cdao-hmrf', 'd1000000-0000-0000-0000-000000000005', 'exec-cdao', 'Hospital MRF Database Management', 'HMRF', 'cdao_hmrf', 'process', 'MRF data collection, processing, validation, and maintenance', 2, 'documented'),
    ('p-cdao-ddd', 'd1000000-0000-0000-0000-000000000005', 'exec-cdao', 'Data-Driven Deliverables', 'DDD', 'cdao_ddd', 'process', 'Analytics deliverable production, quality review, and documentation', 3, 'documented'),
    ('p-cdao-iam', 'd1000000-0000-0000-0000-000000000005', 'exec-cdao', 'Identity & Access Management', 'IAM', 'cdao_iam', 'process', 'User provisioning, access reviews, and security compliance', 4, 'documented');

-- ============================================
-- CDAO FUNCTIONS - 1 item
-- Executive: Chris Hart
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-cdao-f-it', 'd1000000-0000-0000-0000-000000000005', 'exec-cdao', 'Information Technology', 'F-IT', 'cdao_it', 'function', 'IT infrastructure, cybersecurity, and technology governance', 5, 'documented');

-- ============================================
-- CGO PROCESSES - 3 items
-- Executive: Cheryl Matochik
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-cgo-bd', 'd1000000-0000-0000-0000-000000000001', 'exec-cgo', 'Business Development', 'BD', 'cgo_bd', 'process', 'Lead generation, opportunity qualification, proposal development, and contracting', 1, 'documented'),
    ('p-cgo-tl', 'd1000000-0000-0000-0000-000000000001', 'exec-cgo', 'Thought Leadership', 'TL', 'cgo_tl', 'process', 'Content development, publication management, and market positioning', 2, 'documented'),
    ('p-cgo-mkt', 'd1000000-0000-0000-0000-000000000001', 'exec-cgo', 'Marketing Collateral', 'MKT', 'cgo_mkt', 'process', 'Marketing materials development, brand consistency, and distribution', 3, 'documented');

-- ============================================
-- CSO PROCESSES - 6 items
-- Executive: Ashley DeGarmo
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-cso-sd', 'd1000000-0000-0000-0000-000000000002', 'exec-cso', 'Service Delivery', 'SD', 'cso_sd', 'process', 'Engagement management, deliverable production, and client communication', 1, 'documented'),
    ('p-cso-cp', 'd1000000-0000-0000-0000-000000000002', 'exec-cso', 'Contract Performance', 'CP', 'cso_cp', 'process', 'Performance monitoring, milestone tracking, and margin management', 2, 'documented'),
    ('p-cso-cc', 'd1000000-0000-0000-0000-000000000003', 'exec-cso', 'Contract Closure', 'CC', 'cso_cc', 'process', 'Closeout procedures, final deliverables, and client transition', 3, 'documented'),
    ('p-cso-cis', 'd1000000-0000-0000-0000-000000000002', 'exec-cso', 'Change in Scope', 'CiS', 'cso_cis', 'process', 'Scope change identification, documentation, approval, and implementation', 4, 'documented'),
    ('p-cso-ca', 'd1000000-0000-0000-0000-000000000002', 'exec-cso', 'Corrective Action', 'CA', 'cso_ca', 'process', 'Issue identification, root cause analysis, remediation, and follow-up', 5, 'documented'),
    ('p-cso-cfp', 'd1000000-0000-0000-0000-000000000002', 'exec-cso', 'Client-Facing Publications', 'CFP', 'cso_cfp', 'process', 'Client deliverable review, approval workflows, and publication', 6, 'documented');

-- ============================================
-- CSO FUNCTIONS - 1 item
-- Executive: Ashley DeGarmo
-- ============================================
INSERT INTO processes (id, domain_id, executive_id, name, code, process_tag, process_type, description, display_order, sop_status) VALUES
    ('p-cso-f-cdh', 'd1000000-0000-0000-0000-000000000002', 'exec-cso', 'Client Confidentiality & Data Handling', 'F-CDH', 'cso_cdh', 'function', 'Confidentiality protocols, data classification, and handling standards', 7, 'documented');

-- ============================================
-- UPDATE EXISTING KPIs TO MAP TO NEW PROCESSES
-- ============================================
-- Map existing KPIs to new process IDs where applicable
UPDATE kpi_definitions SET process_id = 'p-coo-tc' WHERE process_id = 'p5000000-0000-0000-0000-000000000001'; -- Time Tracking -> TC
UPDATE kpi_definitions SET process_id = 'p-coo-tc' WHERE process_id = 'p5000000-0000-0000-0000-000000000002'; -- Training -> TC
UPDATE kpi_definitions SET process_id = 'p-cfo-ar' WHERE process_id = 'p4000000-0000-0000-0000-000000000002'; -- Receivables -> AR
UPDATE kpi_definitions SET process_id = 'p-cgo-bd' WHERE process_id = 'p1000000-0000-0000-0000-000000000001'; -- Lead Generation -> BD
UPDATE kpi_definitions SET process_id = 'p-cgo-bd' WHERE process_id = 'p1000000-0000-0000-0000-000000000002'; -- Proposals -> BD
UPDATE kpi_definitions SET process_id = 'p-cgo-bd' WHERE process_id = 'p1000000-0000-0000-0000-000000000003'; -- Contracting -> BD
