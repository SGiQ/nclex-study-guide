-- Create notes table for per-user persistent note taking
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'General',
    content TEXT NOT NULL,
    context TEXT DEFAULT 'General',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for user notes fetching
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
