-- Third Horizon CSOG Dashboard
-- SOP Alignment Migration
-- Migration: 002_sop_alignment.sql
-- Purpose: Restructure to align with Third Horizon SOP organizational model

-- ============================================
-- EXECUTIVES TABLE
-- The 7 C-suite roles with their accountability domains
-- ============================================
CREATE TABLE executives (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    photo_url VARCHAR(500),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_executives_active ON executives(is_active, display_order);

-- ============================================
-- MODIFY PROCESSES TABLE
-- Add executive_id, process_type, and code fields
-- ============================================
ALTER TABLE processes
    ADD COLUMN executive_id VARCHAR(50) REFERENCES executives(id),
    ADD COLUMN process_type VARCHAR(20) DEFAULT 'process' CHECK (process_type IN ('process', 'function')),
    ADD COLUMN code VARCHAR(20);

CREATE INDEX idx_processes_executive ON processes(executive_id);
CREATE INDEX idx_processes_type ON processes(process_type);
CREATE INDEX idx_processes_code ON processes(code);

-- ============================================
-- MODIFY USERS TABLE
-- Add executive_id, title, reports_to for org structure
-- ============================================
ALTER TABLE users
    ADD COLUMN executive_id VARCHAR(50) REFERENCES executives(id),
    ADD COLUMN title VARCHAR(200),
    ADD COLUMN reports_to UUID REFERENCES users(id);

CREATE INDEX idx_users_executive ON users(executive_id);

-- ============================================
-- TASKS TABLE
-- Individual SOP tasks with codes and descriptions
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'blocked')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(process_id, code)
);

CREATE INDEX idx_tasks_process ON tasks(process_id, display_order);
CREATE INDEX idx_tasks_code ON tasks(code);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- RACI ASSIGNMENTS TABLE
-- Maps tasks to people with RACI roles
-- ============================================
CREATE TABLE raci_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    person_name VARCHAR(100) NOT NULL,
    person_id UUID REFERENCES users(id),
    role VARCHAR(1) NOT NULL CHECK (role IN ('A', 'R', 'C', 'I')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(task_id, person_name, role)
);

CREATE INDEX idx_raci_task ON raci_assignments(task_id);
CREATE INDEX idx_raci_person ON raci_assignments(person_id);
CREATE INDEX idx_raci_role ON raci_assignments(role);

-- ============================================
-- EXECUTIVE DOMAINS VIEW
-- Convenience view for executive domain aggregation
-- ============================================
CREATE OR REPLACE VIEW executive_domains AS
SELECT
    e.id AS executive_id,
    e.name AS executive_name,
    e.title AS executive_title,
    e.role AS domain_name,
    e.display_order,
    COUNT(DISTINCT p.id) FILTER (WHERE p.process_type = 'process') AS process_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.process_type = 'function') AS function_count,
    COUNT(DISTINCT t.id) AS task_count
FROM executives e
LEFT JOIN processes p ON p.executive_id = e.id AND p.is_active = true
LEFT JOIN tasks t ON t.process_id = p.id AND t.is_active = true
WHERE e.is_active = true
GROUP BY e.id, e.name, e.title, e.role, e.display_order
ORDER BY e.display_order;

-- ============================================
-- TASK RACI VIEW
-- Convenience view for task RACI matrix display
-- ============================================
CREATE OR REPLACE VIEW task_raci_matrix AS
SELECT
    t.id AS task_id,
    t.code AS task_code,
    t.description AS task_description,
    p.id AS process_id,
    p.code AS process_code,
    p.name AS process_name,
    p.process_type,
    e.id AS executive_id,
    e.name AS executive_name,
    MAX(CASE WHEN ra.role = 'A' THEN ra.person_name END) AS accountable,
    MAX(CASE WHEN ra.role = 'R' THEN ra.person_name END) AS responsible,
    STRING_AGG(CASE WHEN ra.role = 'C' THEN ra.person_name END, ', ') FILTER (WHERE ra.role = 'C') AS contributors,
    STRING_AGG(CASE WHEN ra.role = 'I' THEN ra.person_name END, ', ') FILTER (WHERE ra.role = 'I') AS informed
FROM tasks t
JOIN processes p ON t.process_id = p.id
LEFT JOIN executives e ON p.executive_id = e.id
LEFT JOIN raci_assignments ra ON ra.task_id = t.id
WHERE t.is_active = true AND p.is_active = true
GROUP BY t.id, t.code, t.description, p.id, p.code, p.name, p.process_type, e.id, e.name
ORDER BY e.display_order, p.display_order, t.display_order;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_executives_updated_at BEFORE UPDATE ON executives FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_raci_updated_at BEFORE UPDATE ON raci_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
