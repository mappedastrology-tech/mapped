-- Distilled, attributed knowledge passages that power Dolly's retrieval and the
-- reference library. Searched via search_kb_passages() (OR-ranked full-text).
-- Seed data: supabase/seed_kb_passages.sql

create table if not exists public.kb_passages (
  id           uuid primary key default gen_random_uuid(),
  domain       text not null,       -- astrology | vedic-astrology | esoteric-astrology | crystals | herbalism | meditation | magic | manifestation
  topic        text,
  title        text not null,
  body         text not null,        -- DISTILLED (never verbatim copyrighted text)
  summary      text,
  keywords     text[] not null default '{}',
  entities     text[] not null default '{}',
  source_title text,
  source_author text,
  source_year  int,
  public_domain boolean not null default false,
  created_at   timestamptz not null default now(),
  fts tsvector
);

create or replace function public.kb_passages_fts_update() returns trigger
language plpgsql as $$
begin
  new.fts := to_tsvector('english',
    coalesce(new.title,'') || ' ' || coalesce(new.topic,'') || ' ' ||
    coalesce(new.body,'') || ' ' || array_to_string(new.keywords,' ') || ' ' ||
    array_to_string(new.entities,' '));
  return new;
end;
$$;

drop trigger if exists kb_passages_fts_trg on public.kb_passages;
create trigger kb_passages_fts_trg before insert or update on public.kb_passages
  for each row execute function public.kb_passages_fts_update();

create index if not exists kb_passages_fts_idx      on public.kb_passages using gin (fts);
create index if not exists kb_passages_keywords_idx on public.kb_passages using gin (keywords);
create index if not exists kb_passages_entities_idx on public.kb_passages using gin (entities);
create index if not exists kb_passages_domain_idx   on public.kb_passages (domain);

alter table public.kb_passages enable row level security;
drop policy if exists kb_passages_read on public.kb_passages;
create policy kb_passages_read on public.kb_passages for select using (true);

-- OR-ranked retrieval: any query word may match; ts_rank orders by overlap so a
-- natural-language question ("what does my saturn return mean") retrieves well.
create or replace function public.search_kb_passages(q text, d text default null, lim int default 6)
returns setof public.kb_passages
language sql stable as $$
  with parts as (
    select array_to_string(
             (select array_agg(w)
              from unnest(regexp_split_to_array(lower(coalesce(q,'')), '[^a-z0-9]+')) w
              where length(w) > 2),
             ' or ') as orq
  ),
  tq as (
    select case when orq is null or orq = '' then null
                else websearch_to_tsquery('english', orq) end as query
    from parts
  )
  select p.*
  from public.kb_passages p cross join tq
  where (d is null or p.domain = d)
    and (tq.query is null or p.fts @@ tq.query)
  order by case when tq.query is null then 0 else ts_rank(p.fts, tq.query) end desc,
           p.created_at desc
  limit greatest(1, least(lim, 20));
$$;

grant execute on function public.search_kb_passages(text, text, int) to anon, authenticated;
