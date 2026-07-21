-- Dolly conversation storage — one conversation per user per day (applied).
-- Mirrors supabase/dolly_conversations_schema.sql; adds a delete policy.
CREATE TABLE IF NOT EXISTS public.dolly_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day)
);

CREATE INDEX IF NOT EXISTS idx_dolly_conversations_user_day
  ON public.dolly_conversations(user_id, day DESC);

ALTER TABLE public.dolly_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own conversations" ON public.dolly_conversations;
CREATE POLICY "Users can read own conversations"
  ON public.dolly_conversations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON public.dolly_conversations;
CREATE POLICY "Users can insert own conversations"
  ON public.dolly_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.dolly_conversations;
CREATE POLICY "Users can update own conversations"
  ON public.dolly_conversations FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.dolly_conversations;
CREATE POLICY "Users can delete own conversations"
  ON public.dolly_conversations FOR DELETE USING (auth.uid() = user_id);
