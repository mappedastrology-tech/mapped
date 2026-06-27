-- Bug reports: in-app "Report a bug" submissions.
-- Each row captures the user's description plus auto-collected diagnostic
-- context (route, app version, device/browser, viewport) and an optional
-- screenshot stored in the `bug-screenshots` storage bucket.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  category TEXT NOT NULL DEFAULT 'bug',  -- bug | suggestion | other
  description TEXT NOT NULL,
  route TEXT,                 -- screen the user was on, e.g. "/maps"
  app_version TEXT,
  user_agent TEXT,
  viewport TEXT,              -- "WIDTHxHEIGHT"
  screenshot_path TEXT,       -- path within the bug-screenshots bucket (nullable)
  status TEXT NOT NULL DEFAULT 'new',  -- new | triaged | resolved | wontfix
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx ON public.bug_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS bug_reports_status_idx ON public.bug_reports (status);

-- RLS: a user may file a report as themselves and read their own back.
-- (You, the owner, review everything via the Supabase dashboard, which bypasses RLS.)
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own bug reports"
  ON public.bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own bug reports"
  ON public.bug_reports FOR SELECT
  USING (auth.uid() = user_id);

-- ── Screenshot storage ──────────────────────────────────────────────────────
-- Private bucket; screenshots are namespaced by user id ("<uid>/<timestamp>.jpg").
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-screenshots', 'bug-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users may upload only into their own folder.
CREATE POLICY "Users can upload own bug screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'bug-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own bug screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'bug-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
