-- Add promo_code column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_users_promo_code ON users(promo_code);
