-- =============================================
-- Special Placements Schema
-- =============================================
-- Adds three tables that power the "special" callouts
-- in the You tab — dignities, life-theme markers, and
-- retrograde interpretations.
--
-- Stelliums and chart patterns (Grand Trine, T-Square, etc.)
-- are detected in code rather than stored here, since they
-- depend on the full chart, not individual placements.
-- =============================================

-- PLANETARY DIGNITIES — when a planet is especially powerful or challenged in a sign
-- (domicile, exalted, detriment, fall)
create table if not exists public.kb_dignities (
  id serial primary key,
  planet text not null,                  -- "Venus"
  sign text not null,                    -- "Pisces"
  dignity_type text not null,            -- "domicile", "exalted", "detriment", "fall"
  summary text not null,                 -- Dolly-voiced 2-3 sentence interpretation
  what_it_means text not null,           -- practical meaning for the person
  unique(planet, sign)
);

-- LIFE-THEME MARKERS — specific placements associated with fame, fortune,
-- marriage, psychic ability, healing, leadership, creativity, etc.
create table if not exists public.kb_life_markers (
  id serial primary key,
  marker_type text not null,             -- "fame", "fortune", "marriage", "psychic", "healing", "leadership", "creativity", "karmic"
  condition_type text not null,          -- "planet_in_sign", "planet_in_house", "sign_on_house"
  planet text,                           -- "Jupiter" (null for sign_on_house)
  sign text,                             -- "Leo" (null for planet_in_house)
  house_number integer,                  -- 10 (null for planet_in_sign)
  label text not null,                   -- short badge label: "Fame Marker"
  summary text not null,                 -- Dolly-voiced interpretation
  unique(marker_type, condition_type, planet, sign, house_number)
);

-- RETROGRADE INTERPRETATIONS — what it means when a natal planet is retrograde
create table if not exists public.kb_retrogrades (
  id serial primary key,
  planet text unique not null,           -- "Mercury", "Venus", etc.
  summary text not null,                 -- Dolly-voiced 2-3 sentences
  life_patterns text not null,           -- how it shows up day-to-day
  growth text not null                   -- how to work with it
);

-- RLS + public read
alter table public.kb_dignities enable row level security;
alter table public.kb_life_markers enable row level security;
alter table public.kb_retrogrades enable row level security;

create policy "Public read access" on public.kb_dignities for select using (true);
create policy "Public read access" on public.kb_life_markers for select using (true);
create policy "Public read access" on public.kb_retrogrades for select using (true);
