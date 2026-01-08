-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id SERIAL PRIMARY KEY,
  episode_number INTEGER UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  duration VARCHAR(50),
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(episode_number),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(episode_number),
  title VARCHAR(500) NOT NULL,
  cards JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create mindmaps table
CREATE TABLE IF NOT EXISTS mindmaps (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(episode_number),
  title VARCHAR(500) NOT NULL,
  file_name VARCHAR(500),
  file_data BYTEA,
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create infographics table
CREATE TABLE IF NOT EXISTS infographics (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(episode_number),
  title VARCHAR(500) NOT NULL,
  file_name VARCHAR(500),
  file_data BYTEA,
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(episode_number),
  title VARCHAR(500) NOT NULL,
  file_name VARCHAR(500),
  file_data BYTEA,
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_episodes_number ON episodes(episode_number);
CREATE INDEX IF NOT EXISTS idx_quizzes_episode ON quizzes(episode_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_episode ON flashcards(episode_id);
CREATE INDEX IF NOT EXISTS idx_mindmaps_episode ON mindmaps(episode_id);
CREATE INDEX IF NOT EXISTS idx_infographics_episode ON infographics(episode_id);
CREATE INDEX IF NOT EXISTS idx_slides_episode ON slides(episode_id);
