-- Migration 006: Consolidate calculated_metrics table
-- Originally in supabase/migrations/002_calculated_metrics.sql
-- Moved here to unify the migration path

CREATE TABLE IF NOT EXISTS calculated_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id TEXT NOT NULL,
  executive_id TEXT,
  value DECIMAL NOT NULL,
  unit TEXT,
  source_upload_id UUID REFERENCES upload_history(id) ON DELETE SET NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_start DATE,
  period_end DATE,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metrics_executive_metric
  ON calculated_metrics(executive_id, metric_id);

CREATE INDEX IF NOT EXISTS idx_metrics_calculated_at
  ON calculated_metrics(calculated_at DESC);

-- Enable RLS
ALTER TABLE calculated_metrics ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation
DROP POLICY IF EXISTS "Allow read access to all metrics" ON calculated_metrics;
CREATE POLICY "Allow read access to all metrics"
  ON calculated_metrics
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow service role full access" ON calculated_metrics;
CREATE POLICY "Allow service role full access"
  ON calculated_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reuse existing trigger function from migration 003
DROP TRIGGER IF EXISTS update_calculated_metrics_updated_at ON calculated_metrics;
CREATE TRIGGER update_calculated_metrics_updated_at
  BEFORE UPDATE ON calculated_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
