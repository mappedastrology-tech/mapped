-- Palm readings — one row per user, per person, per hand.
-- "person_id" is 'self' for the user's own hands, or a generated id for a
-- friend/other person they read. Text only; the photo is never stored.
-- Synced across the user's devices.
create table if not exists palm_readings (
  user_id uuid references auth.users(id) on delete cascade not null,
  person_id text not null,                 -- 'self' or a client-generated id
  person_name text not null default 'You',
  is_self boolean not null default false,
  hand text not null check (hand in ('left', 'right')),
  reading jsonb not null,
  updated_at timestamptz default now() not null,
  primary key (user_id, person_id, hand)
);

create index if not exists idx_palm_readings_user on palm_readings(user_id);

alter table palm_readings enable row level security;

create policy "Users can read own palm readings"
  on palm_readings for select using (auth.uid() = user_id);
create policy "Users can insert own palm readings"
  on palm_readings for insert with check (auth.uid() = user_id);
create policy "Users can update own palm readings"
  on palm_readings for update using (auth.uid() = user_id);
create policy "Users can delete own palm readings"
  on palm_readings for delete using (auth.uid() = user_id);
