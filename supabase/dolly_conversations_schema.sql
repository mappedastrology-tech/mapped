-- Dolly conversation storage
-- One conversation per user per day. Messages stored as JSONB array.
-- Auto-starts fresh each day, keeps conversation history within the day.

CREATE TABLE IF NOT EXISTS dolly_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- Index for fast lookups by user + day
CREATE INDEX IF NOT EXISTS idx_dolly_conversations_user_day
  ON dolly_conversations(user_id, day DESC);

-- Row-level security: users can only access their own conversations
ALTER TABLE dolly_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations"
  ON dolly_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON dolly_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON dolly_conversations FOR UPDATE
  USING (auth.uid() = user_id);
