-- Every account gets one free deck of its choosing. A deck can now be acquired
-- two ways — bought, or taken as that free pick — and recording which is what
-- lets the store tell "you own this" from "you still have a pick to spend".
alter table public.purchased_decks
  add column if not exists source text not null default 'purchase';

alter table public.purchased_decks
  drop constraint if exists purchased_decks_source_check;

alter table public.purchased_decks
  add constraint purchased_decks_source_check
  check (source in ('purchase', 'free_pick'));

-- One free pick per account, enforced by the database rather than by the API.
-- Two taps racing each other, a retried request, or a bug in the route can all
-- produce a second insert; a partial unique index makes the second one fail
-- regardless of how it got there. Buying more decks is unaffected — the
-- constraint only covers rows where source = 'free_pick'.
create unique index if not exists purchased_decks_one_free_pick_per_user
  on public.purchased_decks (user_id)
  where source = 'free_pick';
