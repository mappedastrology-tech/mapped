-- Personal data sync — journal entries (multi-per-day), custom rituals.
-- Idempotent: safe to run whether or not 20260421_journal.sql was ever applied.
-- Run this in the Supabase SQL editor.

-- ═══ Journal Entries (modern shape: multiple entries per day, keyed by client_id) ═══

-- Works from scratch: full modern shape if the table doesn't exist yet.
create table if not exists journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id text,                      -- local entry id, unique per user (upsert key)
  date date not null,
  prompt text not null default '',
  content text not null default '',
  mood text,
  celestial_context jsonb,
  prompt_id text,
  prompt_text text,
  is_burn boolean not null default false,
  is_voice boolean not null default false,
  tags jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If the legacy table (20260421_journal.sql) exists, upgrade it in place:

-- Multiple entries per day — drop the one-per-day constraint.
alter table journal_entries
  drop constraint if exists journal_entries_user_id_date_key;

-- New columns (no-ops on a fresh table).
alter table journal_entries add column if not exists client_id text;
alter table journal_entries add column if not exists prompt text not null default '';
alter table journal_entries add column if not exists content text not null default '';
alter table journal_entries add column if not exists mood text;
alter table journal_entries add column if not exists celestial_context jsonb;
alter table journal_entries add column if not exists prompt_id text;
alter table journal_entries add column if not exists prompt_text text;
alter table journal_entries add column if not exists is_burn boolean not null default false;
alter table journal_entries add column if not exists is_voice boolean not null default false;
alter table journal_entries add column if not exists tags jsonb;
alter table journal_entries add column if not exists updated_at timestamptz default now();

-- Upsert key for sync: one row per (user, local entry id).
-- Plain unique index — legacy rows with NULL client_id are unaffected
-- (NULLs are distinct), and PostgREST can infer it for ON CONFLICT.
create unique index if not exists idx_journal_entries_user_client
  on journal_entries(user_id, client_id);

create index if not exists idx_journal_entries_user_date
  on journal_entries(user_id, date desc);

-- RLS (legacy migration created select/insert/update but no delete policy).
alter table journal_entries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'journal_entries' and policyname = 'Users can read own journal entries'
  ) then
    create policy "Users can read own journal entries"
      on journal_entries for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'journal_entries' and policyname = 'Users can insert own journal entries'
  ) then
    create policy "Users can insert own journal entries"
      on journal_entries for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'journal_entries' and policyname = 'Users can update own journal entries'
  ) then
    create policy "Users can update own journal entries"
      on journal_entries for update using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'journal_entries' and policyname = 'Users can delete own journal entries'
  ) then
    create policy "Users can delete own journal entries"
      on journal_entries for delete using (auth.uid() = user_id);
  end if;
end $$;


-- ═══ Custom Rituals (wizard-generated) ═══
-- Full CustomRitual payload lives in `data` (jsonb) for flexibility;
-- ids are client-generated (`wizard-<ts>-<rand>`), same style as ritual_completions.

create table if not exists custom_rituals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custom_rituals_user on custom_rituals(user_id);

alter table custom_rituals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'custom_rituals' and policyname = 'Users read own custom rituals'
  ) then
    create policy "Users read own custom rituals"
      on custom_rituals for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'custom_rituals' and policyname = 'Users insert own custom rituals'
  ) then
    create policy "Users insert own custom rituals"
      on custom_rituals for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'custom_rituals' and policyname = 'Users update own custom rituals'
  ) then
    create policy "Users update own custom rituals"
      on custom_rituals for update using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'custom_rituals' and policyname = 'Users delete own custom rituals'
  ) then
    create policy "Users delete own custom rituals"
      on custom_rituals for delete using (auth.uid() = user_id);
  end if;
end $$;

-- NOTE: ritual check-in data ("mapped:completions" via feedback.saveCompletion)
-- is already covered by ritual_completions (ritual_completions_schema.sql) and
-- synced by completionSync.ts. The "mapped:ritual-completions" localStorage key
-- was a dead key (read by the streak counter, never written) — the component now
-- reads the real synced records instead. No additional table needed.
