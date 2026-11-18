-- Dolly reply reports: someone flags one specific Dolly answer from the chat.
--
-- Why a table of its own and not a row in bug_reports:
--   * bug_reports keeps its row after the author deletes their account
--     (user_id ON DELETE SET NULL). A reported Dolly reply quotes the person's
--     own chart and their own question back, which is their personal content,
--     so it has to go with the account. This table cascades.
--   * The reply, the question that produced it and the reason are separate
--     columns, so the reports can be sorted by reason (wrong, unsafe…) when
--     reviewing Dolly's behaviour, instead of being dug out of free text.
--
-- NOT YET APPLIED to the production database. Apply it (Supabase dashboard →
-- SQL → New query, or the Supabase migration tool) before the code that writes
-- to it is deployed. It only creates a new table; nothing existing changes.

CREATE TABLE IF NOT EXISTS public.dolly_reply_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Which reply. message_id is the chat's own id for it (mobile), or a
  -- timestamp-based id on desktop; conversation_day is the day's chat it sits in.
  message_id TEXT NOT NULL,
  conversation_day DATE,
  -- Exactly what was on screen, captured at report time: the stored chat can
  -- be cleared or deleted later, and the report must still make sense.
  reply_text TEXT NOT NULL CHECK (char_length(reply_text) BETWEEN 1 AND 20000),
  prompt_text TEXT CHECK (prompt_text IS NULL OR char_length(prompt_text) <= 8000),
  reason TEXT NOT NULL CHECK (reason IN ('wrong', 'unhelpful', 'harmful', 'offensive', 'other')),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 2000),
  surface TEXT CHECK (surface IS NULL OR surface IN ('mobile', 'desktop')),
  app_version TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',  -- new | reviewed | fixed | wontfix (owner-managed)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Reporting the same reply twice adds nothing; the second tap is a no-op.
  UNIQUE (user_id, message_id)
);

CREATE INDEX IF NOT EXISTS dolly_reply_reports_created_at_idx
  ON public.dolly_reply_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS dolly_reply_reports_reason_idx
  ON public.dolly_reply_reports (reason, status);

-- RLS: a person may file a report as themselves and read their own back (the
-- "download my data" export reads it). No update or delete from the app: a
-- report is a record, and status is changed by the owner in the dashboard,
-- which bypasses RLS. Account deletion removes the rows through the cascade.
ALTER TABLE public.dolly_reply_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own dolly reply reports" ON public.dolly_reply_reports;
CREATE POLICY "Users can insert own dolly reply reports"
  ON public.dolly_reply_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'new');

DROP POLICY IF EXISTS "Users can view own dolly reply reports" ON public.dolly_reply_reports;
CREATE POLICY "Users can view own dolly reply reports"
  ON public.dolly_reply_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
