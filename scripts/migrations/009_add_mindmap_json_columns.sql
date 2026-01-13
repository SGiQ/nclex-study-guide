-- Add JSON columns for React Flow data
ALTER TABLE mindmaps 
ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS edges JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance if we query by content (optional but good practice)
-- CREATE INDEX IF NOT EXISTS idx_mindmaps_nodes ON mindmaps USING gin (nodes);
