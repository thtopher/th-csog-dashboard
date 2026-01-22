-- Calculated Metrics Table
-- Stores metrics calculated from uploaded Excel files

CREATE TABLE IF NOT EXISTS calculated_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id TEXT NOT NULL,           -- e.g., 'harvestRate', 'arAging'
  executive_id TEXT,                  -- Which executive this metric belongs to
  value DECIMAL NOT NULL,             -- The calculated value
  unit TEXT,                          -- e.g., '%', '$', 'days'
  source_upload_id UUID REFERENCES upload_history(id) ON DELETE SET NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_start DATE,
  period_end DATE,
  details JSONB,                      -- Additional calculation details
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries by executive and metric
CREATE INDEX IF NOT EXISTS idx_metrics_executive_metric
  ON calculated_metrics(executive_id, metric_id);

-- Index for latest metrics
CREATE INDEX IF NOT EXISTS idx_metrics_calculated_at
  ON calculated_metrics(calculated_at DESC);

-- Enable RLS
ALTER TABLE calculated_metrics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all metrics
CREATE POLICY "Allow read access to all metrics"
  ON calculated_metrics
  FOR SELECT
  USING (true);

-- Allow service role to insert/update metrics
CREATE POLICY "Allow service role full access"
  ON calculated_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_calculated_metrics_updated_at
  BEFORE UPDATE ON calculated_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_updated_at();
