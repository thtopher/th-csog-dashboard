-- Third Horizon CSOG Dashboard
-- Executive Seed Data
-- Seeds: 002_executives.sql

-- ============================================
-- EXECUTIVES
-- The 7 C-suite roles per Third Horizon SOP
-- ============================================
INSERT INTO executives (id, name, title, role, email, display_order) VALUES
    ('exec-ceo', 'David Smith', 'CEO', 'Business Oversight', 'david@thirdhorizon.co', 1),
    ('exec-president', 'Greg Williams', 'President', 'Client Operations', 'greg@thirdhorizon.co', 2),
    ('exec-coo', 'Jordana Choucair', 'COO', 'Business Operations', 'jordana@thirdhorizon.co', 3),
    ('exec-cfo', 'Aisha Waheed', 'CFO', 'Finance', 'aisha@thirdhorizon.co', 4),
    ('exec-cdao', 'Chris Hart', 'CDAO', 'Data Systems & IT', 'chris@thirdhorizon.co', 5),
    ('exec-cgo', 'Cheryl Matochik', 'CGO', 'Growth', 'cheryl@thirdhorizon.co', 6),
    ('exec-cso', 'Ashley DeGarmo', 'CSO', 'Client Engagement', 'ashley@thirdhorizon.co', 7);

-- ============================================
-- UPDATE EXISTING DOMAINS TO MAP TO EXECUTIVES
-- Map the current 6 domains to the executive structure
-- ============================================
UPDATE operational_domains SET steward_name = 'David Smith' WHERE id = 'd1000000-0000-0000-0000-000000000006';  -- Board & CSOG -> CEO
UPDATE operational_domains SET steward_name = 'Cheryl Matochik' WHERE id = 'd1000000-0000-0000-0000-000000000001';  -- Growth -> CGO
UPDATE operational_domains SET steward_name = 'Ashley DeGarmo' WHERE id = 'd1000000-0000-0000-0000-000000000002';  -- Service Delivery -> CSO
UPDATE operational_domains SET steward_name = 'Ashley DeGarmo' WHERE id = 'd1000000-0000-0000-0000-000000000003';  -- Contract Closure -> CSO
UPDATE operational_domains SET steward_name = 'Aisha Waheed' WHERE id = 'd1000000-0000-0000-0000-000000000004';  -- Finance -> CFO
UPDATE operational_domains SET steward_name = 'Jordana Choucair' WHERE id = 'd1000000-0000-0000-0000-000000000005';  -- Internal Operations -> COO
