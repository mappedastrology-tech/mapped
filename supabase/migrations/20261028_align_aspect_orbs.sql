-- Align kb_aspects.orb with the orbs the app actually calculates with.
--
-- The chart, transits, synastry and Dolly's depth block all use one table:
-- src/lib/astro/constants.ts ASPECTS — conjunction 8, opposition 8, trine 7,
-- square 7, sextile 5. The knowledge base said trine 8 and sextile 6, so anything
-- that quoted it described orbs the app never applies.
--
-- Content only: no schema change, no RLS change. Idempotent.
--
-- To reverse:
--   update public.kb_aspects set orb = 6 where name = 'sextile';
--   update public.kb_aspects set orb = 8 where name = 'trine';

begin;

update public.kb_aspects set orb = 8 where name = 'conjunction';
update public.kb_aspects set orb = 8 where name = 'opposition';
update public.kb_aspects set orb = 7 where name = 'trine';
update public.kb_aspects set orb = 7 where name = 'square';
update public.kb_aspects set orb = 5 where name = 'sextile';

commit;
