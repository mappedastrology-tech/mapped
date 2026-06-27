-- ============================================================================
-- Learning Library — progress, quiz attempts, and completion certificates.
-- Run in the Supabase SQL editor. All tables are user-owned and RLS-protected:
-- the public anon key can only ever see/modify the signed-in user's own rows.
-- Course/lesson CONTENT is shipped in the app code, not the database — these
-- tables only store per-user progress.
-- ============================================================================

-- ── Per-user, per-course progress (one row per user per course) ──────────────
create table if not exists public.course_progress (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  course_id           text not null,
  completed_lesson_ids text[] not null default '{}',
  last_lesson_id      text,
  best_score          real,                       -- best final-test score, 0..1
  started_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  completed_at        timestamptz,
  unique (user_id, course_id)
);

create index if not exists course_progress_user_idx on public.course_progress (user_id);

alter table public.course_progress enable row level security;

drop policy if exists "own course progress" on public.course_progress;
create policy "own course progress" on public.course_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Quiz / final-test attempt log (append-only history) ──────────────────────
create table if not exists public.quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  course_id  text not null,
  lesson_id  text,                                -- null = final test attempt
  score      real not null,                       -- 0..1
  passed     boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_course_idx
  on public.quiz_attempts (user_id, course_id);

alter table public.quiz_attempts enable row level security;

drop policy if exists "own quiz attempts" on public.quiz_attempts;
create policy "own quiz attempts" on public.quiz_attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Completion certificates (issued on passing the final test) ───────────────
create table if not exists public.certificates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  course_id    text not null,
  course_title text not null,
  score        real not null,                     -- 0..1
  code         text not null,                     -- short human-readable verification code
  issued_at    timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists certificates_user_idx on public.certificates (user_id);

alter table public.certificates enable row level security;

drop policy if exists "own certificates" on public.certificates;
create policy "own certificates" on public.certificates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Spaced-repetition review queue (one row per user per lesson) ─────────────
-- After a lesson is completed it gets a review scheduled. Each successful review
-- pushes the next one further out (1 → 3 → 7 → 14 → 30 → 60 days); a missed
-- review resets to 1 day. The app surfaces lessons whose due_at has passed.
create table if not exists public.lesson_reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  course_id     text not null,
  lesson_id     text not null,
  due_at        timestamptz not null default now(),
  interval_days integer not null default 1,
  updated_at    timestamptz not null default now(),
  unique (user_id, course_id, lesson_id)
);

create index if not exists lesson_reviews_due_idx on public.lesson_reviews (user_id, due_at);

alter table public.lesson_reviews enable row level security;

drop policy if exists "own lesson reviews" on public.lesson_reviews;
create policy "own lesson reviews" on public.lesson_reviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Daily learning activity / XP (one row per user per day) ──────────────────
-- Powers levels, streaks, the weekly chart, and daily goals.
create table if not exists public.learning_activity (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  xp            integer not null default 0,
  items         integer not null default 0,
  updated_at    timestamptz not null default now(),
  unique (user_id, activity_date)
);

create index if not exists learning_activity_user_idx on public.learning_activity (user_id, activity_date);

alter table public.learning_activity enable row level security;

drop policy if exists "own learning activity" on public.learning_activity;
create policy "own learning activity" on public.learning_activity
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
