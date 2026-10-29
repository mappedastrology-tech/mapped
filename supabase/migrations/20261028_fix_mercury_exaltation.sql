-- Mercury is exalted in Virgo, not Aquarius.
--
-- supabase/seed_dignities.sql seeded a ('Mercury', 'Aquarius', 'exalted') row.
-- Every traditional dignity table, from Ptolemy on, puts Mercury's exaltation in
-- Virgo — and the app's own code already does (chartAnalysis.ts EXALTATION,
-- dollyDepth.ts EXALTATION), so the knowledge base contradicted the chart screen.
--
-- kb_dignities is unique on (planet, sign) and Virgo already holds Mercury's
-- domicile row, so the exaltation cannot be moved onto a new Virgo row. Instead:
--   1. delete the wrong Aquarius row (Mercury in Aquarius is peregrine), and
--   2. say in the Virgo row that Mercury is both at home and exalted there.
-- The seed file carries the same change, so fresh and migrated databases match.
--
-- Content only: no schema change, no RLS change. Idempotent.
--
-- To reverse (restores the incorrect row):
--   insert into public.kb_dignities (planet, sign, dignity_type, summary, what_it_means) values
--   ('Mercury', 'Aquarius', 'exalted',
--    'Mercury is exalted in Aquarius. Your thinking is original, future-oriented, and unbound by convention. You see patterns others won''t see for years.',
--    'Your mind works differently and that''s your strength. You think in systems, innovations, and possibilities. You''re not interested in how things have always been done—you want to know how they could be.')
--   on conflict (planet, sign) do nothing;
--   update public.kb_dignities
--      set summary = 'Mercury rules Virgo too. But here it''s precise, analytical, and detail-oriented. Your mind works like a fine instrument—nothing gets past you.'
--    where planet = 'Mercury' and sign = 'Virgo';

begin;

delete from public.kb_dignities
 where planet = 'Mercury' and sign = 'Aquarius' and dignity_type = 'exalted';

update public.kb_dignities
   set summary = 'Mercury rules Virgo too—and is exalted here as well, the only planet whose exaltation falls in a sign it rules. Here it''s precise, analytical, and detail-oriented. Your mind works like a fine instrument—nothing gets past you.'
 where planet = 'Mercury' and sign = 'Virgo';

commit;
