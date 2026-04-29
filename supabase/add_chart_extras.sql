-- =============================================
-- Mapped — Chart Extras Migration
-- =============================================
-- Run this in your Supabase SQL Editor.
-- Adds special_points and midheaven columns to the charts table.
-- These are already stored on the connections table; this brings
-- the charts table to parity so saveChart() can insert cleanly.
-- =============================================

alter table public.charts
  add column if not exists special_points jsonb,
  add column if not exists midheaven jsonb;
