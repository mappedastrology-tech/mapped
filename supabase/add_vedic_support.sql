-- =============================================
-- Mapped — Vedic Astrology Support Migration
-- =============================================
-- Run this in your Supabase SQL Editor after setup.sql
-- Adds zodiac system preference columns to support
-- both Western (Tropical) and Vedic (Sidereal) astrology.
-- =============================================

-- Add zodiac system preference to profiles (user's global default)
alter table public.profiles
  add column if not exists zodiac_system text default 'tropical'
    check (zodiac_system in ('tropical', 'sidereal')),
  add column if not exists ayanamsa text default 'lahiri'
    check (ayanamsa in ('lahiri', 'krishnamurti', 'raman'));

-- Add zodiac system to charts (what system was this chart calculated with)
alter table public.charts
  add column if not exists zodiac_system text default 'tropical'
    check (zodiac_system in ('tropical', 'sidereal')),
  add column if not exists ayanamsa text default 'lahiri'
    check (ayanamsa in ('lahiri', 'krishnamurti', 'raman'));

-- Add zodiac system to connections (each connection's chart system)
alter table public.connections
  add column if not exists zodiac_system text default 'tropical'
    check (zodiac_system in ('tropical', 'sidereal')),
  add column if not exists ayanamsa text default 'lahiri'
    check (ayanamsa in ('lahiri', 'krishnamurti', 'raman'));
