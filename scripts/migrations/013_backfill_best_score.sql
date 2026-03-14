-- Backfill best_score from existing score where best_score is NULL
UPDATE user_progress 
SET best_score = score, attempt_count = 1 
WHERE content_type = 'quiz' AND best_score IS NULL AND score IS NOT NULL;

-- Ensure all NULL attempt_counts are at least 1 for existing quiz records
UPDATE user_progress
SET attempt_count = 1
WHERE content_type = 'quiz' AND attempt_count IS NULL;
