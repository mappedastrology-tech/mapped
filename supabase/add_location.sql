-- Adds current-location columns to profiles.
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Used by the "Location" setting in Account — feeds sunrise/sunset, almanac,
-- gardening zone, and transit calculations.

alter table public.profiles
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists location_label text,
  add column if not exists garden_zone text;
