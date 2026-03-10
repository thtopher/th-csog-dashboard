-- Migration 007: Strategic goals (WMBT) progress tracking
-- Stores user-adjustable progress for "What Must Be True" milestones

CREATE TABLE IF NOT EXISTS strategic_goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id TEXT NOT NULL,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  updated_by TEXT,          -- user email who made the change
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only keep one row per milestone (latest wins)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sgp_milestone_id
  ON strategic_goal_progress(milestone_id);

CREATE INDEX IF NOT EXISTS idx_sgp_updated_at
  ON strategic_goal_progress(updated_at DESC);

-- Also store KPI snapshots for the Business KPIs tab
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id TEXT NOT NULL,
  value DECIMAL NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_kpi_date
  ON kpi_snapshots(kpi_id, date DESC);

-- Enable RLS
ALTER TABLE strategic_goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies: all authenticated users can read, service role can write
DROP POLICY IF EXISTS "Allow read access to goal progress" ON strategic_goal_progress;
CREATE POLICY "Allow read access to goal progress"
  ON strategic_goal_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access to goal progress" ON strategic_goal_progress;
CREATE POLICY "Allow service role full access to goal progress"
  ON strategic_goal_progress FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to kpi snapshots" ON kpi_snapshots;
CREATE POLICY "Allow read access to kpi snapshots"
  ON kpi_snapshots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access to kpi snapshots" ON kpi_snapshots;
CREATE POLICY "Allow service role full access to kpi snapshots"
  ON kpi_snapshots FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at on strategic_goal_progress
DROP TRIGGER IF EXISTS update_sgp_updated_at ON strategic_goal_progress;
CREATE TRIGGER update_sgp_updated_at
  BEFORE UPDATE ON strategic_goal_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
