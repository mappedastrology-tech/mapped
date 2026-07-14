-- ============================================================
-- Mapped — pending migrations (safe to run more than once).
-- Paste this whole file into the Supabase SQL Editor and Run.
-- ============================================================

-- 1) Garden zip/zone on profiles ---------------------------
-- Per-account garden zip/zone so a user's planting calendar follows them
-- across devices (previously stored only in browser localStorage).
alter table public.profiles
  add column if not exists garden_zip  text,
  add column if not exists garden_zone text;

-- 2) Generic per-account settings store --------------------
-- Generic per-account key/value settings store, so user preferences
-- (oracle deck, fishing spot, numerology name/system, …) follow the account
-- across devices instead of living only in one browser's localStorage.
create table if not exists public.user_settings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_settings enable row level security;

drop policy if exists "user_settings own select" on public.user_settings;
create policy "user_settings own select" on public.user_settings
  for select using (auth.uid() = user_id);

drop policy if exists "user_settings own insert" on public.user_settings;
create policy "user_settings own insert" on public.user_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_settings own update" on public.user_settings;
create policy "user_settings own update" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_settings own delete" on public.user_settings;
create policy "user_settings own delete" on public.user_settings
  for delete using (auth.uid() = user_id);

-- 3) Dolly cross-session memory ----------------------------
-- Cross-session memory for Dolly: one evolving free-text summary per user of
-- what's going on in their life, so she remembers context across days.
create table if not exists public.dolly_memory (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  summary    text,
  updated_at timestamptz not null default now()
);

alter table public.dolly_memory enable row level security;

drop policy if exists "dolly_memory own select" on public.dolly_memory;
create policy "dolly_memory own select" on public.dolly_memory
  for select using (auth.uid() = user_id);

drop policy if exists "dolly_memory own insert" on public.dolly_memory;
create policy "dolly_memory own insert" on public.dolly_memory
  for insert with check (auth.uid() = user_id);

drop policy if exists "dolly_memory own update" on public.dolly_memory;
create policy "dolly_memory own update" on public.dolly_memory
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "dolly_memory own delete" on public.dolly_memory;
create policy "dolly_memory own delete" on public.dolly_memory
  for delete using (auth.uid() = user_id);
