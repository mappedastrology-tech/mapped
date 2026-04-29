-- =============================================
-- Mapped — Astrology Knowledge Database Schema
-- =============================================
-- This is the foundational knowledge layer.
-- It stores everything Mapped "knows" about astrology,
-- drawn from the frameworks in the reference books:
--   - The Only Astrology Book You'll Ever Need (Woolfolk)
--   - Planets in Transit (Hand)
--   - Astrology for the Soul (Spiller)
--   - Plus traditional and modern astrological wisdom
--
-- This data powers:
--   - The "You" tab detail pages (tap a placement to learn more)
--   - The "Learn" section on Home
--   - Dolly's knowledge base
--   - The interpretations engine
-- =============================================

-- SIGNS — the 12 zodiac signs
create table if not exists public.kb_signs (
  id serial primary key,
  name text unique not null,           -- "Aries"
  abbreviation text unique not null,   -- "Ari"
  symbol text not null,                -- "♈"
  element text not null,               -- "Fire", "Earth", "Air", "Water"
  modality text not null,              -- "Cardinal", "Fixed", "Mutable"
  ruling_planet text not null,         -- "Mars"
  date_range text not null,            -- "Mar 21 – Apr 19"
  summary text not null,               -- 2-3 sentence overview
  strengths text not null,             -- comma-separated traits
  challenges text not null,            -- comma-separated shadow traits
  life_theme text not null,            -- how this sign shows up in real life
  relationships text not null,         -- how this sign approaches relationships
  career text not null,                -- career/purpose tendencies
  growth_edge text not null,           -- what this sign needs to work on
  book_references text[]               -- ["Woolfolk p.45", "Hand p.102"]
);

-- PLANETS — the 10 main celestial bodies + what they represent
create table if not exists public.kb_planets (
  id serial primary key,
  name text unique not null,           -- "Sun"
  symbol text not null,                -- "☉"
  category text not null,              -- "Personal", "Social", "Transpersonal"
  summary text not null,               -- what this planet represents
  keywords text not null,              -- "identity, ego, vitality, purpose"
  life_area text not null,             -- what area of life it governs
  question text not null               -- the question this planet answers, e.g. "Who am I at my core?"
);

-- PLANETS IN SIGNS — what each planet means in each sign (120 combinations)
create table if not exists public.kb_planet_in_sign (
  id serial primary key,
  planet text not null,                -- "Sun"
  sign text not null,                  -- "Aries"
  summary text not null,               -- 3-4 sentence interpretation
  life_patterns text not null,         -- how this shows up day-to-day
  relationships text not null,         -- how this affects relationships
  challenges text not null,            -- the shadow side
  growth text not null,                -- how to work with this energy
  book_references text[],
  unique(planet, sign)
);

-- HOUSES — the 12 houses and their meanings
create table if not exists public.kb_houses (
  id serial primary key,
  number integer unique not null,      -- 1-12
  name text not null,                  -- "First House"
  traditional_name text not null,      -- "House of Self"
  summary text not null,               -- what this house governs
  life_area text not null,             -- "identity, appearance, first impressions"
  keywords text not null,              -- searchable keywords
  question text not null,              -- "How do I present myself to the world?"
  sign_association text not null,      -- "Aries" (natural sign)
  planet_association text not null     -- "Mars" (natural ruler)
);

-- PLANETS IN HOUSES — what each planet means in each house (120 combinations)
create table if not exists public.kb_planet_in_house (
  id serial primary key,
  planet text not null,
  house_number integer not null,
  summary text not null,               -- 3-4 sentence interpretation
  life_patterns text not null,
  strengths text not null,
  challenges text not null,
  book_references text[],
  unique(planet, house_number)
);

-- ASPECTS — the major aspects between planets
create table if not exists public.kb_aspects (
  id serial primary key,
  name text unique not null,           -- "conjunction"
  symbol text not null,                -- "☌"
  degrees integer not null,            -- 0
  orb integer not null,                -- typical orb of influence in degrees
  nature text not null,                -- "neutral", "harmonious", "challenging"
  summary text not null,               -- what this aspect type means
  keywords text not null
);

-- SIGNS IN HOUSES — what it means to have a sign on a house cusp (144 combinations)
create table if not exists public.kb_sign_on_house (
  id serial primary key,
  sign text not null,
  house_number integer not null,
  summary text not null,               -- 2-3 sentences
  approach text not null,              -- how you approach this life area
  unique(sign, house_number)
);

-- Disable RLS on knowledge tables — this data is public/read-only
-- (every user sees the same astrology knowledge)
alter table public.kb_signs enable row level security;
alter table public.kb_planets enable row level security;
alter table public.kb_planet_in_sign enable row level security;
alter table public.kb_houses enable row level security;
alter table public.kb_planet_in_house enable row level security;
alter table public.kb_aspects enable row level security;
alter table public.kb_sign_on_house enable row level security;

-- Allow all authenticated and anonymous users to read
create policy "Public read access" on public.kb_signs for select using (true);
create policy "Public read access" on public.kb_planets for select using (true);
create policy "Public read access" on public.kb_planet_in_sign for select using (true);
create policy "Public read access" on public.kb_houses for select using (true);
create policy "Public read access" on public.kb_planet_in_house for select using (true);
create policy "Public read access" on public.kb_aspects for select using (true);
create policy "Public read access" on public.kb_sign_on_house for select using (true);
