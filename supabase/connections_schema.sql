-- Connections table: stores people you've added to your map
-- Each connection has birth data so we can calculate their chart
-- and compare it against yours.

CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,        -- 'partner', 'mother', 'father', 'sister', 'brother', 'friend', 'aunt', 'uncle', 'grandmother', 'grandfather', 'child'
  category TEXT NOT NULL,            -- 'family', 'partner', 'friend'
  birth_date TEXT NOT NULL,          -- 'YYYY-MM-DD'
  birth_time TEXT,                   -- 'HH:MM' or null if unknown
  unknown_time BOOLEAN DEFAULT false,
  city_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  -- Calculated chart data (filled after first calculation)
  big_three JSONB,
  planets JSONB,
  houses JSONB,
  aspects JSONB,
  special_points JSONB,
  midheaven JSONB,
  -- Synastry with the user (filled after comparison)
  synastry JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only see their own connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON public.connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON public.connections FOR DELETE
  USING (auth.uid() = user_id);
