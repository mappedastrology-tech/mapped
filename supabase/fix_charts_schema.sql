-- =============================================
-- Mapped — Charts Table Schema Fix
-- =============================================
-- Run this in your Supabase SQL Editor.
--
-- Ensures the public.charts table has ALL columns that saveChart()
-- tries to insert. Safe to re-run (uses IF NOT EXISTS).
--
-- Adds:
--   - zodiac_system  (tropical | sidereal)
--   - ayanamsa       (lahiri | krishnamurti | raman)
--   - special_points (jsonb — Chiron, Nodes, etc.)
--   - midheaven      (jsonb — MC point)
-- =============================================

alter table public.charts
  add column if not exists zodiac_system text default 'tropical'
    check (zodiac_system in ('tropical', 'sidereal')),
  add column if not exists ayanamsa text default 'lahiri'
    check (ayanamsa in ('lahiri', 'krishnamurti', 'raman')),
  add column if not exists special_points jsonb,
  add column if not exists midheaven jsonb;

-- Tell PostgREST to reload its schema cache immediately so the new
-- columns are visible to the client without waiting for auto-refresh.
notify pgrst, 'reload schema';
