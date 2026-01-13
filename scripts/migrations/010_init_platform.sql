-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default program (NCLEX-PN)
-- We explicitly set ID 1 to ensure our defaults work
INSERT INTO programs (id, name, slug, description)
VALUES (1, 'NCLEX-PN', 'nclex-pn', 'Comprehensive review for the Practical Nursing credential')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence if needed (in case id 1 was already used/skipped, though explicit insert usually overrides)
-- SELECT setval('programs_id_seq', (SELECT MAX(id) FROM programs));

-- Add active_program_id to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS active_program_id INTEGER REFERENCES programs(id) DEFAULT 1;

-- Add program_id to content tables
-- using DEFAULT 1 automatically backfills existing rows
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id) DEFAULT 1;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id) DEFAULT 1;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id) DEFAULT 1;
ALTER TABLE mindmaps ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id) DEFAULT 1;
ALTER TABLE infographics ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id) DEFAULT 1;
ALTER TABLE slides ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id) DEFAULT 1;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_program ON users(active_program_id);
CREATE INDEX IF NOT EXISTS idx_episodes_program ON episodes(program_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_program ON quizzes(program_id);
