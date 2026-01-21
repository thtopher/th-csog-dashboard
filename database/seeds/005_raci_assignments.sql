-- Third Horizon CSOG Dashboard
-- RACI Assignments Seed Data
-- Seeds: 005_raci_assignments.sql
--
-- RACI assignments for critical tasks from the SOP
-- R = Responsible (does the work)
-- A = Accountable (owns the outcome, only ONE per task)
-- C = Contributor (provides input)
-- I = Informed (receives updates)

-- ============================================
-- F-EOC: EXECUTIVE OPERATING CADENCE RACI
-- ============================================
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'R' FROM tasks t WHERE t.code = 'F-EOC1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'F-EOC1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'F-EOC1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'I' FROM tasks t WHERE t.code = 'F-EOC1';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'R' FROM tasks t WHERE t.code = 'F-EOC2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'F-EOC2';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'R' FROM tasks t WHERE t.code = 'F-EOC3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'F-EOC3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'F-EOC3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'I' FROM tasks t WHERE t.code = 'F-EOC3';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'R' FROM tasks t WHERE t.code = 'F-EOC4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'F-EOC4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'F-EOC4';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'R' FROM tasks t WHERE t.code = 'F-EOC5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'F-EOC5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'F-EOC5';

-- F-EOC6: CEO Scorecard - This is the key task for the dashboard
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Topher', 'R' FROM tasks t WHERE t.code = 'F-EOC6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'C' FROM tasks t WHERE t.code = 'F-EOC6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Board of Managers', 'I' FROM tasks t WHERE t.code = 'F-EOC6';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'R' FROM tasks t WHERE t.code = 'F-EOC7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'C' FROM tasks t WHERE t.code = 'F-EOC7';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'R' FROM tasks t WHERE t.code = 'F-EOC8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'F-EOC8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Board of Managers', 'I' FROM tasks t WHERE t.code = 'F-EOC8';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC9';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'R' FROM tasks t WHERE t.code = 'F-EOC9';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'F-EOC9';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'I' FROM tasks t WHERE t.code = 'F-EOC9';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'A' FROM tasks t WHERE t.code = 'F-EOC10';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'R' FROM tasks t WHERE t.code = 'F-EOC10';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'F-EOC10';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'F-EOC10';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'I' FROM tasks t WHERE t.code = 'F-EOC10';

-- ============================================
-- BD: BUSINESS DEVELOPMENT RACI
-- ============================================
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'BD1';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'BD2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'BD2';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'C' FROM tasks t WHERE t.code = 'BD3';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'BD4';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'BD5';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'R' FROM tasks t WHERE t.code = 'BD6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'BD6';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'I' FROM tasks t WHERE t.code = 'BD7';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'C' FROM tasks t WHERE t.code = 'BD8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'BD8';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'A' FROM tasks t WHERE t.code = 'BD9';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Cheryl', 'R' FROM tasks t WHERE t.code = 'BD9';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'I' FROM tasks t WHERE t.code = 'BD9';

-- ============================================
-- SD: SERVICE DELIVERY RACI
-- ============================================
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'A' FROM tasks t WHERE t.code = 'SD1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Engagement Lead', 'R' FROM tasks t WHERE t.code = 'SD1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'SD1';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'A' FROM tasks t WHERE t.code = 'SD2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Engagement Lead', 'R' FROM tasks t WHERE t.code = 'SD2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Chris H.', 'C' FROM tasks t WHERE t.code = 'SD2';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'A' FROM tasks t WHERE t.code = 'SD3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Engagement Lead', 'R' FROM tasks t WHERE t.code = 'SD3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'CSOG', 'I' FROM tasks t WHERE t.code = 'SD3';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'A' FROM tasks t WHERE t.code = 'SD4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'R' FROM tasks t WHERE t.code = 'SD4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'C' FROM tasks t WHERE t.code = 'SD4';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'A' FROM tasks t WHERE t.code = 'SD5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'QA Reviewer', 'R' FROM tasks t WHERE t.code = 'SD5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'SD5';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'A' FROM tasks t WHERE t.code = 'SD6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Engagement Lead', 'R' FROM tasks t WHERE t.code = 'SD6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'SD6';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'A' FROM tasks t WHERE t.code = 'SD7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Engagement Lead', 'R' FROM tasks t WHERE t.code = 'SD7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'C' FROM tasks t WHERE t.code = 'SD7';

-- ============================================
-- AR: ACCOUNTS RECEIVABLE RACI
-- ============================================
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Aisha', 'A' FROM tasks t WHERE t.code = 'AR1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'AR1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'C' FROM tasks t WHERE t.code = 'AR1';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Aisha', 'A' FROM tasks t WHERE t.code = 'AR2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'AR2';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Aisha', 'A' FROM tasks t WHERE t.code = 'AR3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'AR3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'I' FROM tasks t WHERE t.code = 'AR3';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Aisha', 'A' FROM tasks t WHERE t.code = 'AR4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'AR4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Ashley', 'C' FROM tasks t WHERE t.code = 'AR4';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Aisha', 'A' FROM tasks t WHERE t.code = 'AR5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'AR5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'C' FROM tasks t WHERE t.code = 'AR5';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Aisha', 'A' FROM tasks t WHERE t.code = 'AR6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'R' FROM tasks t WHERE t.code = 'AR6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'I' FROM tasks t WHERE t.code = 'AR6';

-- ============================================
-- CF: CASH FLOW MANAGEMENT RACI
-- ============================================
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'CF1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'C' FROM tasks t WHERE t.code = 'CF1';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'I' FROM tasks t WHERE t.code = 'CF1';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'CF2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'CF2';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'I' FROM tasks t WHERE t.code = 'CF2';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'CF3';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'CF3';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'CF4';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'CF4';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'R' FROM tasks t WHERE t.code = 'CF5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'C' FROM tasks t WHERE t.code = 'CF5';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'CF5';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'R' FROM tasks t WHERE t.code = 'CF6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'R' FROM tasks t WHERE t.code = 'CF6';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'CF6';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'R' FROM tasks t WHERE t.code = 'CF7';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'C' FROM tasks t WHERE t.code = 'CF7';

INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'A' FROM tasks t WHERE t.code = 'CF8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Greg', 'R' FROM tasks t WHERE t.code = 'CF8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Finance', 'C' FROM tasks t WHERE t.code = 'CF8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'David', 'I' FROM tasks t WHERE t.code = 'CF8';
INSERT INTO raci_assignments (task_id, person_name, role)
SELECT t.id, 'Jordana', 'I' FROM tasks t WHERE t.code = 'CF8';
