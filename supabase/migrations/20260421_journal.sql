-- Journal entries — daily writing with AI-generated prompts
create table if not exists journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  prompt text not null default '',
  content text not null default '',
  mood text,
  celestial_context jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- One entry per user per day
  unique(user_id, date)
);

-- Index for querying by user and date range
create index if not exists idx_journal_entries_user_date
  on journal_entries(user_id, date desc);

-- RLS: users can only access their own entries
alter table journal_entries enable row level security;

create policy "Users can read own journal entries"
  on journal_entries for select using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on journal_entries for insert with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on journal_entries for update using (auth.uid() = user_id);


-- AI-generated reflections at various cadences
create table if not exists journal_reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  cadence text not null check (cadence in ('weekly', 'monthly', 'quarterly', 'yearly', 'new-year')),
  period_start date not null,
  period_end date not null,
  content text not null,
  entry_count integer not null default 0,
  created_at timestamptz default now()
);

-- Index for querying reflections
create index if not exists idx_journal_reflections_user
  on journal_reflections(user_id, created_at desc);

-- RLS
alter table journal_reflections enable row level security;

create policy "Users can read own reflections"
  on journal_reflections for select using (auth.uid() = user_id);

create policy "Users can insert own reflections"
  on journal_reflections for insert with check (auth.uid() = user_id);
