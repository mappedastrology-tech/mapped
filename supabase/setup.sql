-- =============================================
-- Mapped — Database Setup
-- =============================================
-- Run this in your Supabase SQL Editor:
--   1. Go to https://supabase.com/dashboard
--   2. Select your "mapped" project
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this entire file and click "Run"
-- =============================================

-- Table: profiles
-- Stores basic user info. Linked to Supabase Auth users.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  created_at timestamptz default now()
);

-- Table: charts
-- Stores birth chart data and calculation results for each user.
create table if not exists public.charts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  birth_date text not null,
  birth_time text not null,
  unknown_time boolean default false,
  city_name text,
  latitude double precision,
  longitude double precision,
  timezone text,
  big_three jsonb,        -- { sun: "Gem", moon: "Pis", rising: "Lib" }
  planets jsonb,          -- full array of planetary positions
  houses jsonb,           -- full array of house cusps
  aspects jsonb,          -- full array of aspects
  interpretations jsonb,  -- Claude's interpretations
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
-- This ensures users can only see and edit their OWN data.
-- Without this, anyone could read anyone's charts.

alter table public.profiles enable row level security;
alter table public.charts enable row level security;

-- Profiles: users can read and update only their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Charts: users can only CRUD their own charts
create policy "Users can view own charts"
  on public.charts for select
  using (auth.uid() = user_id);

create policy "Users can insert own charts"
  on public.charts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own charts"
  on public.charts for update
  using (auth.uid() = user_id);

create policy "Users can delete own charts"
  on public.charts for delete
  using (auth.uid() = user_id);

-- Automatic profile creation
-- When someone signs up, automatically create a profile row for them.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists (safe to re-run)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
