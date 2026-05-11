-- Ritual completions + tarot readings persistence
-- Run this in Supabase SQL editor to create the tables

-- ═══ Ritual Completions ═══
CREATE TABLE IF NOT EXISTS ritual_completions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id TEXT NOT NULL,
  ritual_title TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mood_word TEXT NOT NULL,
  mood_category TEXT NOT NULL CHECK (mood_category IN ('heavy', 'hard', 'neutral', 'soft_positive', 'bright_positive')),
  fit_rating TEXT NOT NULL CHECK (fit_rating IN ('not_really', 'some', 'yes')),
  journal_entry TEXT,
  moon_phase TEXT NOT NULL,
  zodiac_season TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  was_recommendation BOOLEAN NOT NULL DEFAULT false,
  was_override BOOLEAN NOT NULL DEFAULT false,
  was_user_searched BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_completions_user ON ritual_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_date ON ritual_completions(user_id, completed_at DESC);

-- RLS: users can only read/write their own completions
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own completions"
  ON ritual_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own completions"
  ON ritual_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own completions"
  ON ritual_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own completions"
  ON ritual_completions FOR DELETE
  USING (auth.uid() = user_id);


-- ═══ Tarot Readings ═══
CREATE TABLE IF NOT EXISTS tarot_readings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deck TEXT NOT NULL,
  spread_name TEXT NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_user ON tarot_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_date ON tarot_readings(user_id, read_at DESC);

ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own readings"
  ON tarot_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own readings"
  ON tarot_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own readings"
  ON tarot_readings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own readings"
  ON tarot_readings FOR DELETE
  USING (auth.uid() = user_id);
