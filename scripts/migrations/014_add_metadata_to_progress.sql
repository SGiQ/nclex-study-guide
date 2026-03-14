-- Add metadata column to user_progress for SRS and custom stats
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for performance on JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_progress_metadata ON user_progress USING GIN (metadata);
