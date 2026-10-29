-- Rewrite deterministic life-marker copy (kb_life_markers).
--
-- These rows told people what their chart *will* do — "you tend to marry well",
-- "money comes to you more easily than most", "you need a significant partner to
-- feel complete… it's your design", "your dreams are often prophetic", "trust
-- your gut, it's almost never wrong". Mapped offers astrology for reflection, not
-- prediction, and never makes money, relationship or health forecasts (see the
-- safety charter). Same placements, same marker types; the summaries now describe
-- a theme to notice rather than an outcome, and four labels that promised an
-- outcome ("Fortunate Marriage", "Wealth Indicator", "Inherited Abundance",
-- "Transformative Wealth") are renamed. "Love Blessing" becomes "Love & Partnership".
--
-- supabase/seed_life_markers.sql carries the same text, so a fresh database
-- seeded from it matches a migrated one. Content only: no schema change, no RLS
-- change. Idempotent (plain UPDATEs keyed on the table's unique columns).
--
-- To reverse: re-run the previous version of supabase/seed_life_markers.sql's
-- rows as UPDATEs from git history (git show <commit>^:supabase/seed_life_markers.sql).

begin;

update public.kb_life_markers
   set summary = 'Sun in the 10th house is a classic visibility placement. Your sense of self is tied up with your public role and what you''re known for. Career can feel less like a job and more like a stage.'
 where marker_type = 'fame' and condition_type = 'planet_in_house' and planet = 'Sun' and sign is null and house_number = 10;

update public.kb_life_markers
   set summary = 'Jupiter in the 10th expands your public presence. Astrologers read it as optimism and generosity in your working life, and a reputation built on goodwill. It invites you to aim high.'
 where marker_type = 'fame' and condition_type = 'planet_in_house' and planet = 'Jupiter' and sign is null and house_number = 10;

update public.kb_life_markers
   set summary = 'Pluto in the 10th gives your public role real intensity. You don''t just want a career—you want influence. Your relationship with power and authority is worth getting honest about, and your work can be a place of real change.'
 where marker_type = 'fame' and condition_type = 'planet_in_house' and planet = 'Pluto' and sign is null and house_number = 10;

update public.kb_life_markers
   set summary = 'Jupiter in the 2nd house is classic abundance symbolism. Astrologers read it as an expansive, generous relationship with resources and self-worth. The growth edge is matching a big appetite with good judgment.', label = 'Abundance Mindset'
 where marker_type = 'fortune' and condition_type = 'planet_in_house' and planet = 'Jupiter' and sign is null and house_number = 2;

update public.kb_life_markers
   set summary = 'Venus in the 2nd links what you value with what you love. You may have expensive taste and a strong eye for quality. Pleasure, beauty, and a sense of security feel connected for you.'
 where marker_type = 'fortune' and condition_type = 'planet_in_house' and planet = 'Venus' and sign is null and house_number = 2;

update public.kb_life_markers
   set summary = 'Pluto in the 8th is about power and depth in what you share with others—trust, intimacy, and joint resources. Astrologers read it as a placement of big psychological change. Control and letting go are recurring themes.', label = 'Power & Depth'
 where marker_type = 'fortune' and condition_type = 'planet_in_house' and planet = 'Pluto' and sign is null and house_number = 8;

update public.kb_life_markers
   set summary = 'Jupiter in the 8th expands through what''s shared—trust, intimacy, and collaboration. Astrologers associate it with generosity flowing between you and other people, and with finding meaning in depth.', label = 'Shared Abundance'
 where marker_type = 'fortune' and condition_type = 'planet_in_house' and planet = 'Jupiter' and sign is null and house_number = 8;

update public.kb_life_markers
   set summary = 'Saturn in the 2nd asks you to build security slowly and on your own terms. Early on, self-worth can feel like something you have to earn. Over time, patience and discipline become a foundation you trust.'
 where marker_type = 'fortune' and condition_type = 'planet_in_house' and planet = 'Saturn' and sign is null and house_number = 2;

update public.kb_life_markers
   set summary = 'Jupiter in Taurus is associated with steady, grounded growth. You value quality, patience, and things that last, and you understand the worth of slow building.'
 where marker_type = 'fortune' and condition_type = 'planet_in_sign' and planet = 'Jupiter' and sign = 'Taurus' and house_number is null;

update public.kb_life_markers
   set summary = 'Venus in the 7th house is the classic partnership placement. Relationships are where you light up, and you bring warmth and harmony to your connections. Partnership matters deeply to you.', label = 'Love & Partnership'
 where marker_type = 'marriage' and condition_type = 'planet_in_house' and planet = 'Venus' and sign is null and house_number = 7;

update public.kb_life_markers
   set summary = 'Jupiter in the 7th expands through partnership. Astrologers read it as generosity in relationships—you may be drawn to people who bring growth, optimism, or a wider world into your life.', label = 'Generous Partnerships'
 where marker_type = 'marriage' and condition_type = 'planet_in_house' and planet = 'Jupiter' and sign is null and house_number = 7;

update public.kb_life_markers
   set summary = 'Sun in the 7th means relationships are a big part of how you understand yourself. You come alive in one-on-one connection and learn about yourself through other people. The growth edge is knowing you''re whole on your own, too.'
 where marker_type = 'marriage' and condition_type = 'planet_in_house' and planet = 'Sun' and sign is null and house_number = 7;

update public.kb_life_markers
   set summary = 'Saturn in the 7th takes commitment seriously. You may approach partnership carefully, or later than people around you, and you value steadiness and responsibility over flash. Trust is something you build.'
 where marker_type = 'marriage' and condition_type = 'planet_in_house' and planet = 'Saturn' and sign is null and house_number = 7;

update public.kb_life_markers
   set summary = 'Pluto in the 7th means your close relationships can be deeply transformative—they change you. Power dynamics are worth noticing, and you deserve partnerships where power is shared.'
 where marker_type = 'marriage' and condition_type = 'planet_in_house' and planet = 'Pluto' and sign is null and house_number = 7;

update public.kb_life_markers
   set summary = 'Neptune in the 12th is a classic placement for intuition and imagination. You may feel close to dreams, the unconscious, and the spiritual. Sensitivity is part of your gift, so protect your energy.'
 where marker_type = 'psychic' and condition_type = 'planet_in_house' and planet = 'Neptune' and sign is null and house_number = 12;

update public.kb_life_markers
   set summary = 'Moon in the 12th gives you a quiet emotional radar. You may pick up on moods before anyone says a word, and your dreams can be vivid. You absorb other people''s feelings easily. Solitude recharges you.'
 where marker_type = 'psychic' and condition_type = 'planet_in_house' and planet = 'Moon' and sign is null and house_number = 12;

update public.kb_life_markers
   set summary = 'Moon in the 8th gives you emotional depth and perceptiveness. You notice what''s under the surface of a room. It''s a real strength when you trust it—and it''s always fair to check your read with the people involved.'
 where marker_type = 'psychic' and condition_type = 'planet_in_house' and planet = 'Moon' and sign is null and house_number = 8;

update public.kb_life_markers
   set summary = 'Moon in Pisces is one of the most intuitive lunar placements. You feel the world at a frequency many people miss, and your emotional intelligence runs deep. Art, music, and care for others are natural outlets.'
 where marker_type = 'psychic' and condition_type = 'planet_in_sign' and planet = 'Moon' and sign = 'Pisces' and house_number is null;

update public.kb_life_markers
   set summary = 'Moon in Scorpio gives you penetrating emotional insight. You read undercurrents and hidden motives quickly. Your gut is worth listening to, and worth checking against what people actually tell you.'
 where marker_type = 'psychic' and condition_type = 'planet_in_sign' and planet = 'Moon' and sign = 'Scorpio' and house_number is null;

update public.kb_life_markers
   set summary = 'Pluto in the 6th brings intensity to service and daily work. You may be drawn to psychology, crisis work, or deep body practices. You like getting to the root of things rather than skimming the surface.'
 where marker_type = 'healing' and condition_type = 'planet_in_house' and planet = 'Pluto' and sign is null and house_number = 6;

update public.kb_life_markers
   set summary = 'Saturn in the 10th builds authority over time. Your career may start slowly, and your standing grows with patience. People take you seriously. Your discipline and work ethic are visible to everyone.'
 where marker_type = 'leadership' and condition_type = 'planet_in_house' and planet = 'Saturn' and sign is null and house_number = 10;

update public.kb_life_markers
   set summary = 'Saturn in the 12th is read as a placement of hidden lessons. Some people with it describe a sense of responsibility or heaviness that''s hard to name. Solitude, reflection, and support—spiritual or professional—can help you work with it.'
 where marker_type = 'karmic' and condition_type = 'planet_in_house' and planet = 'Saturn' and sign is null and house_number = 12;

update public.kb_life_markers
   set summary = 'Saturn in the 4th ties your sense of family to duty or restraint. Building your own sense of home and safety—on your terms—is the work this placement points to.'
 where marker_type = 'karmic' and condition_type = 'planet_in_house' and planet = 'Saturn' and sign is null and house_number = 4;

commit;
