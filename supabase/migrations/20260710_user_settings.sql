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
