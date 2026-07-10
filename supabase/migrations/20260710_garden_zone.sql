-- Per-account garden zip/zone so a user's planting calendar follows them
-- across devices (previously stored only in browser localStorage).
alter table public.profiles
  add column if not exists garden_zip  text,
  add column if not exists garden_zone text;
