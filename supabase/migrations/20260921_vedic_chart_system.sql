-- Vedic / sidereal chart system.
--
-- Replaces the loose supabase/add_vedic_support.sql (sections 1–2 below are its
-- contents, unchanged and idempotent — safe if it was already run by hand) and
-- adds the columns the sidereal build needs:
--
--   house_system  'placidus' | 'whole_sign'. NULL means "the default for the
--                 zodiac": whole sign for sidereal, Placidus for tropical.
--   node_type     'mean' | 'true'. NULL means mean.
--   ascendant     charts/connections only: the exact Ascendant {sign, signNum,
--                 position, absPosition}. With whole-sign houses the house-1
--                 cusp is 0° of the rising sign, so the degree must be stored
--                 separately (Dolly's Lots and timing need it).
--
-- No new tables, so no new RLS policies: every column lands on a table whose
-- existing "own rows only" policies already cover it.
--
-- The app works before this is applied — it writes the new columns only when
-- they exist and falls back to the defaults — but the house-system and node
-- choices in Account won't stick until it is.
--
-- To reverse:
--   alter table public.profiles    drop column if exists house_system, drop column if exists node_type;
--   alter table public.charts      drop column if exists house_system, drop column if exists node_type, drop column if exists ascendant;
--   alter table public.connections drop column if exists house_system, drop column if exists node_type, drop column if exists ascendant;
-- (Leave zodiac_system / ayanamsa: the app has depended on them since before this migration.)

-- 1) Zodiac preference on profiles (the user's choice) ------------------------
alter table public.profiles
  add column if not exists zodiac_system text default 'tropical'
    check (zodiac_system in ('tropical', 'sidereal')),
  add column if not exists ayanamsa text default 'lahiri'
    check (ayanamsa in ('lahiri', 'krishnamurti', 'raman'));

-- 2) The system each stored chart was calculated in ---------------------------
alter table public.charts
  add column if not exists zodiac_system text default 'tropical'
    check (zodiac_system in ('tropical', 'sidereal')),
  add column if not exists ayanamsa text default 'lahiri'
    check (ayanamsa in ('lahiri', 'krishnamurti', 'raman'));

alter table public.connections
  add column if not exists zodiac_system text default 'tropical'
    check (zodiac_system in ('tropical', 'sidereal')),
  add column if not exists ayanamsa text default 'lahiri'
    check (ayanamsa in ('lahiri', 'krishnamurti', 'raman'));

-- 3) House system and node type ----------------------------------------------
alter table public.profiles
  add column if not exists house_system text
    check (house_system in ('placidus', 'whole_sign')),
  add column if not exists node_type text
    check (node_type in ('mean', 'true'));

alter table public.charts
  add column if not exists house_system text
    check (house_system in ('placidus', 'whole_sign')),
  add column if not exists node_type text
    check (node_type in ('mean', 'true')),
  add column if not exists ascendant jsonb;

alter table public.connections
  add column if not exists house_system text
    check (house_system in ('placidus', 'whole_sign')),
  add column if not exists node_type text
    check (node_type in ('mean', 'true')),
  add column if not exists ascendant jsonb;
