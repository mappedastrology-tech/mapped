-- Dolly reports: "Report this reply" on an AI-written reply.
--
-- Google Play's AI-Generated Content policy requires an app whose AI writes
-- text to let people flag offensive output from inside the app; Apple's
-- guidelines 1.2 and 4.7 ask the same of chatbot apps. Each row is one report:
-- which reply, why, and an optional note from the person who reported it.
--
-- Written by POST /api/dolly/report with the reader's own token, so RLS
-- applies to the insert. The owner reviews every row in the Supabase dashboard
-- (Table editor -> dolly_reports), which bypasses RLS.
--
-- conversation_id is a plain uuid, not a foreign key, on purpose. The mobile
-- screen can report a reply before its conversation row has been saved, and a
-- person may delete the conversation afterwards; the report (with its own copy
-- of the reply text) has to survive both. user_id DOES cascade from
-- auth.users, so deleting an account deletes that person's reports too.
--
-- The four reasons match REPORT_REASONS in src/lib/dollyReport.ts.
-- Safe to run more than once. Run it in the Supabase SQL editor.
-- To reverse: drop table if exists public.dolly_reports;

create table if not exists public.dolly_reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  source          text not null default 'dolly',
  conversation_id uuid,            -- dolly_conversations.id, when the chat had been saved
  message_id      text,            -- the client's id for the reply within that chat
  reply_text      text not null,   -- the reply as shown, up to 8,000 characters
  reason          text not null,
  note            text,
  created_at      timestamptz not null default now(),

  constraint dolly_reports_reason_check
    check (reason in ('harmful', 'offensive', 'inaccurate', 'other')),
  constraint dolly_reports_source_check
    check (source in ('dolly', 'journal')),
  constraint dolly_reports_reply_len check (char_length(reply_text) <= 8000),
  constraint dolly_reports_note_len check (note is null or char_length(note) <= 1000)
);

-- Newest first is how they get reviewed; user_id is the cascade's lookup.
create index if not exists dolly_reports_created_at_idx on public.dolly_reports (created_at desc);
create index if not exists dolly_reports_user_id_idx on public.dolly_reports (user_id);

-- RLS: a person may file a report as themselves and read their own back.
-- No update or delete policy: a report is a record, not a draft.
alter table public.dolly_reports enable row level security;

drop policy if exists "dolly_reports own insert" on public.dolly_reports;
create policy "dolly_reports own insert" on public.dolly_reports
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "dolly_reports own select" on public.dolly_reports;
create policy "dolly_reports own select" on public.dolly_reports
  for select to authenticated using (auth.uid() = user_id);
