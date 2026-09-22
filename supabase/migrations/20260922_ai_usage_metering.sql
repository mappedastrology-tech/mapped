-- Per-call record of what Claude usage cost, so monthly ceilings can be enforced.
--
-- One row per API call rather than a running total per user. A counter would be
-- smaller, but it cannot answer "which route ran away with the month", and a
-- lost increment is invisible where a missing row is not.
--
-- cost_micros is millionths of a dollar. Cents would round nearly every call to
-- zero (a Haiku token costs $0.000001) and floats would drift once thousands of
-- them are summed; integer micros add exactly. See src/lib/ai/pricing.ts.
--
-- RLS is enabled with NO policies, which is the point: this table is reachable
-- only by the service role, which bypasses RLS. Subscribers are deliberately not
-- shown their spend, and a policy letting them read their own rows would hand
-- them the ceiling by inference.

create table if not exists public.ai_usage (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references auth.users (id) on delete cascade,
  -- Calendar month in UTC, as YYYY-MM. Stored rather than derived so the
  -- monthly sum is a plain indexed equality match instead of a function scan.
  month             text not null,
  route             text not null,
  model             text not null,
  input_tokens      integer not null default 0,
  output_tokens     integer not null default 0,
  cache_read_tokens integer not null default 0,
  cache_write_tokens integer not null default 0,
  cost_micros       bigint not null default 0,
  created_at        timestamptz not null default now(),

  constraint ai_usage_month_format check (month ~ '^\d{4}-\d{2}$'),
  constraint ai_usage_cost_nonneg check (cost_micros >= 0)
);

-- The only read this table serves in the request path: this user, this month.
create index if not exists ai_usage_user_month_idx
  on public.ai_usage (user_id, month);

alter table public.ai_usage enable row level security;
