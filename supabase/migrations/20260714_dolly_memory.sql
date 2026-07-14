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
