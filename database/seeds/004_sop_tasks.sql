-- Third Horizon CSOG Dashboard
-- SOP Tasks Seed Data
-- Seeds: 004_sop_tasks.sql
--
-- Priority Tasks from Third Horizon SOP:
-- - F-EOC (10 tasks) - Executive Operating Cadence
-- - BD (9 tasks) - Business Development
-- - SD (7 tasks) - Service Delivery
-- - AR (6 tasks) - Accounts Receivable
-- - CF (8 tasks) - Cash Flow Management

-- ============================================
-- F-EOC: EXECUTIVE OPERATING CADENCE TASKS (10)
-- Process: p-ceo-f-eoc
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC1', 'Own the "company operating system" by ensuring every core process has an accountable steward, clear outputs, KPIs, and a recurring feedback-loop cadence that keeps the firm coherent', 1),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC2', 'Define the executive meeting rhythm (weekly CSOG, monthly performance review, quarterly strategic review) including agenda templates, pre-reads, and decision artifacts', 2),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC3', 'Establish and enforce decision rights (who decides what, when, and with what inputs) to prevent ambiguity, rework, and executive bottlenecks', 3),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC4', 'Make final calls on priority conflicts across growth, delivery, capacity, and investments when stewards are mis-aligned', 4),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC5', 'Define escalation thresholds and ensure issues move to the right level quickly (delivery risk, client conflict, cash constraints, reputational risk, legal risk)', 5),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC6', 'Own a CEO-level scorecard that integrates pipeline health, delivery health, margin, cash, staffing capacity, and strategic initiatives', 6),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC7', 'Follow through on commitments made in executive forums to close accountability loops and sustain operational momentum', 7),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC8', 'Maintain decision logs, meeting artifacts, and outcome tracking to preserve institutional knowledge and support board reporting', 8),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC9', 'Ensure department-level cadences (Finance, Delivery, Growth, Data/IT, People Ops) roll up cleanly into the executive rhythm', 9),
    (gen_random_uuid(), 'p-ceo-f-eoc', 'F-EOC10', 'Continuously improve the operating model by identifying friction points, redundancies, and capability gaps', 10);

-- ============================================
-- F-CAI: CAPITAL ALLOCATION & INVESTMENT REVIEW TASKS (10)
-- Process: p-ceo-f-cai
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI1', 'Maintain and articulate the firm''s investment thesis (what the company will invest in, why, and what outcomes define success)', 1),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI2', 'Set the rules for allocating cash and leadership attention across delivery capacity, growth, product/data infrastructure, hiring, and innovation', 2),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI3', 'Define what constitutes an "investment" requiring CEO review (new hires, software platforms, data assets, brand programs, product builds, partnerships)', 3),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI4', 'Require investment proposals to include expected returns, timing, risks, and resourcing impacts, and make final determinations on approval', 4),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI5', 'Ensure investment decisions account for reputational, legal, operational, and opportunity risks—not just financial return', 5),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI6', 'Reallocate resources when priorities change (e.g., shifting from service delivery expansion to data asset build, or vice versa)', 6),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI7', 'Protect balance sheet resilience by maintaining liquidity targets and stress-testing exposure to concentration, timing, and market risks', 7),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI8', 'Periodically review the ROI and strategic value of past investments to inform future allocation decisions', 8),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI9', 'Align capital allocation with the firm''s valuation narrative (growth rate, margin profile, scalability story) for future investment or exit readiness', 9),
    (gen_random_uuid(), 'p-ceo-f-cai', 'F-CAI10', 'Ensure the firm is positioned to access external capital (debt, equity, grants) if and when strategic opportunities require it', 10);

-- ============================================
-- F-SP: STRATEGIC PLANNING TASKS (10)
-- Process: p-ceo-f-sp
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP1', 'Own the firm''s long-range narrative: What Third Horizon is becoming, why it matters, and what makes it structurally different', 1),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP2', 'Actively manage near-term execution vs. mid-term capability build vs. long-term innovation so "today''s delivery" doesn''t consume the company', 2),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP3', 'Lead the annual planning cycle including goals, capability priorities, staffing posture, investment themes, and measurable outcomes', 3),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP4', 'Identify key assumptions underlying strategy (market demand, policy shifts, capital access, talent availability) and require periodic validation', 4),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP5', 'Define how the firm is positioned in the market, what it will be known for, and what it will explicitly not do', 5),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP6', 'Ensure strategic priorities translate into process changes, capability development, and role clarity', 6),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP7', 'Sponsor strategic initiatives that require cross-functional effort and protect them from being deprioritized by delivery pressures', 7),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP8', 'Ensure the engagement portfolio reflects strategic intent—client mix, capability deployment, market presence, and margin profile', 8),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP9', 'Align staffing, skills, and capacity planning with strategic priorities and growth assumptions', 9),
    (gen_random_uuid(), 'p-ceo-f-sp', 'F-SP10', 'Identify and invest in capabilities that will differentiate Third Horizon structurally over time (data assets, methods, talent, reputation)', 10);

-- ============================================
-- BD: BUSINESS DEVELOPMENT TASKS (9)
-- Process: p-cgo-bd
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-cgo-bd', 'BD1', 'Identify and qualify new business opportunities through market research, relationship development, and lead generation', 1),
    (gen_random_uuid(), 'p-cgo-bd', 'BD2', 'Evaluate opportunity fit against strategic priorities, capacity constraints, and risk profile', 2),
    (gen_random_uuid(), 'p-cgo-bd', 'BD3', 'Draft Scope of Work outlining duties, timeline, staffing, terms, and expected outcomes', 3),
    (gen_random_uuid(), 'p-cgo-bd', 'BD4', 'Coordinate proposal development including pricing, staffing plan, methodology, and past performance', 4),
    (gen_random_uuid(), 'p-cgo-bd', 'BD5', 'Conduct client presentations and negotiations to advance opportunities through the pipeline', 5),
    (gen_random_uuid(), 'p-cgo-bd', 'BD6', 'Coordinate contract review and negotiate terms with client legal and procurement', 6),
    (gen_random_uuid(), 'p-cgo-bd', 'BD7', 'Track pipeline status, probability-weighted value, and expected close timing', 7),
    (gen_random_uuid(), 'p-cgo-bd', 'BD8', 'Coordinate handoff to delivery team upon contract execution', 8),
    (gen_random_uuid(), 'p-cgo-bd', 'BD9', 'Maintain CRM records and pipeline reporting for executive visibility', 9);

-- ============================================
-- SD: SERVICE DELIVERY TASKS (7)
-- Process: p-cso-sd
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-cso-sd', 'SD1', 'Establish engagement management structure including project plan, communication protocols, and escalation paths', 1),
    (gen_random_uuid(), 'p-cso-sd', 'SD2', 'Coordinate deliverable production ensuring quality, timeliness, and alignment with client expectations', 2),
    (gen_random_uuid(), 'p-cso-sd', 'SD3', 'Manage ongoing client communication including status updates, issue resolution, and relationship maintenance', 3),
    (gen_random_uuid(), 'p-cso-sd', 'SD4', 'Monitor engagement health including budget burn, timeline adherence, and client satisfaction', 4),
    (gen_random_uuid(), 'p-cso-sd', 'SD5', 'Coordinate quality assurance review before client-facing deliverable submission', 5),
    (gen_random_uuid(), 'p-cso-sd', 'SD6', 'Document lessons learned and capture reusable knowledge assets', 6),
    (gen_random_uuid(), 'p-cso-sd', 'SD7', 'Coordinate engagement closeout and transition to contract closure process', 7);

-- ============================================
-- AR: ACCOUNTS RECEIVABLE TASKS (6)
-- Process: p-cfo-ar
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-cfo-ar', 'AR1', 'Generate and issue invoices per contract billing schedules and milestones', 1),
    (gen_random_uuid(), 'p-cfo-ar', 'AR2', 'Track invoice status and payment receipt against expected timing', 2),
    (gen_random_uuid(), 'p-cfo-ar', 'AR3', 'Prepare and analyze accounts receivable aging reports', 3),
    (gen_random_uuid(), 'p-cfo-ar', 'AR4', 'Coordinate with delivery leads on client billing questions or disputes', 4),
    (gen_random_uuid(), 'p-cfo-ar', 'AR5', 'Follow up on outstanding accounts receivable with escalating urgency', 5),
    (gen_random_uuid(), 'p-cfo-ar', 'AR6', 'Escalate delinquent accounts to executive leadership for intervention', 6);

-- ============================================
-- CF: CASH FLOW MANAGEMENT TASKS (8)
-- Process: p-pres-cf
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-pres-cf', 'CF1', 'Schedule and convene recurring weekly finance review meeting', 1),
    (gen_random_uuid(), 'p-pres-cf', 'CF2', 'Prepare cash position summary including current balances and projected position', 2),
    (gen_random_uuid(), 'p-pres-cf', 'CF3', 'Review outstanding vendor payables and upcoming obligations', 3),
    (gen_random_uuid(), 'p-pres-cf', 'CF4', 'Review accounts with delayed or at-risk collections', 4),
    (gen_random_uuid(), 'p-pres-cf', 'CF5', 'Identify potential cash flow constraints or timing risks', 5),
    (gen_random_uuid(), 'p-pres-cf', 'CF6', 'Update cash tracking model with confirmed contractual commitments', 6),
    (gen_random_uuid(), 'p-pres-cf', 'CF7', 'Document follow-up actions for collections, payments, and cash planning', 7),
    (gen_random_uuid(), 'p-pres-cf', 'CF8', 'Monitor material changes to cash position throughout the week', 8);

-- ============================================
-- CR: COMPENSATION & ROLE CHANGES TASKS (10)
-- Process: p-pres-cr
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-pres-cr', 'CR1', 'Issue notification 30 days prior to annual review to initiate compensation review cycle', 1),
    (gen_random_uuid(), 'p-pres-cr', 'CR2', 'Confirm employee eligibility for review based on tenure, role, and prior review timing', 2),
    (gen_random_uuid(), 'p-pres-cr', 'CR3', 'Evaluate employee performance based on completed annual review and supervisor input', 3),
    (gen_random_uuid(), 'p-pres-cr', 'CR4', 'Review current compensation against applicable pay band and internal equity', 4),
    (gen_random_uuid(), 'p-pres-cr', 'CR5', 'Develop compensation recommendation including merit-based increases', 5),
    (gen_random_uuid(), 'p-pres-cr', 'CR6', 'Submit compensation recommendation for executive approval', 6),
    (gen_random_uuid(), 'p-pres-cr', 'CR7', 'Grant final approval of compensation changes', 7),
    (gen_random_uuid(), 'p-pres-cr', 'CR8', 'Communicate compensation decisions to employee following annual review', 8),
    (gen_random_uuid(), 'p-pres-cr', 'CR9', 'Notify Finance of approved compensation changes for payroll implementation', 9),
    (gen_random_uuid(), 'p-pres-cr', 'CR10', 'Update employee compensation records in BambooHR and payroll systems', 10);

-- ============================================
-- OC: OPERATIONALIZING CLIENT CONTRACTS TASKS (5)
-- Process: p-coo-oc
-- ============================================
INSERT INTO tasks (id, process_id, code, description, display_order) VALUES
    (gen_random_uuid(), 'p-coo-oc', 'OC1', 'Review and execute client contracts including BAAs, ensuring legal compliance. Store in SharePoint', 1),
    (gen_random_uuid(), 'p-coo-oc', 'OC2', 'Monitor contract execution status using Master Contract Tracker', 2),
    (gen_random_uuid(), 'p-coo-oc', 'OC3', 'Establish revenue and cash recognition schedules, update Pro Forma and Cash Tracker', 3),
    (gen_random_uuid(), 'p-coo-oc', 'OC4', 'Configure contracts in internal systems (Pro Forma, NetSuite, Harvest)', 4),
    (gen_random_uuid(), 'p-coo-oc', 'OC5', 'Facilitate transition from Business Development to Delivery teams', 5);
