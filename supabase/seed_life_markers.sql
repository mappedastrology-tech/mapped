-- Seed file for kb_life_markers
-- Special placements that flag life themes: fame, fortune, marriage,
-- psychic ability, healing gifts, leadership, creativity, karmic lessons

INSERT INTO kb_life_markers (marker_type, condition_type, planet, sign, house_number, label, summary) VALUES

-- ═══════════════════════════
-- FAME MARKERS
-- ═══════════════════════════
('fame', 'planet_in_house', 'Sun', NULL, 10, 'Fame Marker',
 'Sun in the 10th house is a classic visibility placement. Your sense of self is tied up with your public role and what you''re known for. Career can feel less like a job and more like a stage.'),

('fame', 'planet_in_house', 'Jupiter', NULL, 10, 'Fame Marker',
 'Jupiter in the 10th expands your public presence. Astrologers read it as optimism and generosity in your working life, and a reputation built on goodwill. It invites you to aim high.'),

('fame', 'planet_in_house', 'Venus', NULL, 1, 'Beauty & Charm',
 'Venus in the 1st house gives you natural attractiveness and likability. People are drawn to you before you say a word. This placement shows up in celebrities, models, and anyone whose presence is their power.'),

('fame', 'planet_in_house', 'Venus', NULL, 10, 'Public Admiration',
 'Venus in the 10th means you''re liked publicly. Your career involves beauty, art, diplomacy, or something people admire. You make success look effortless and elegant.'),

('fame', 'planet_in_house', 'Neptune', NULL, 10, 'Iconic Image',
 'Neptune in the 10th means your public image has a mystical or idealized quality. People project onto you. You can become famous for an image that''s bigger than who you actually are. Celebrities with cult followings often have this.'),

('fame', 'planet_in_house', 'Pluto', NULL, 10, 'Power & Influence',
 'Pluto in the 10th gives your public role real intensity. You don''t just want a career—you want influence. Your relationship with power and authority is worth getting honest about, and your work can be a place of real change.'),

('fame', 'sign_on_house', NULL, 'Leo', 10, 'Leo Midheaven',
 'Leo on the 10th house cusp means your career and public image are meant to shine. You need recognition for your work. You''re drawn to leadership roles, creative industries, or anything where you can be seen and celebrated.'),

-- ═══════════════════════════
-- FORTUNE / WEALTH MARKERS
-- ═══════════════════════════
('fortune', 'planet_in_house', 'Jupiter', NULL, 2, 'Abundance Mindset',
 'Jupiter in the 2nd house is classic abundance symbolism. Astrologers read it as an expansive, generous relationship with resources and self-worth. The growth edge is matching a big appetite with good judgment.'),

('fortune', 'planet_in_house', 'Venus', NULL, 2, 'Luxury & Comfort',
 'Venus in the 2nd links what you value with what you love. You may have expensive taste and a strong eye for quality. Pleasure, beauty, and a sense of security feel connected for you.'),

('fortune', 'planet_in_house', 'Pluto', NULL, 8, 'Power & Depth',
 'Pluto in the 8th is about power and depth in what you share with others—trust, intimacy, and joint resources. Astrologers read it as a placement of big psychological change. Control and letting go are recurring themes.'),

('fortune', 'planet_in_house', 'Jupiter', NULL, 8, 'Shared Abundance',
 'Jupiter in the 8th expands through what''s shared—trust, intimacy, and collaboration. Astrologers associate it with generosity flowing between you and other people, and with finding meaning in depth.'),

('fortune', 'planet_in_house', 'Saturn', NULL, 2, 'Earned Wealth',
 'Saturn in the 2nd asks you to build security slowly and on your own terms. Early on, self-worth can feel like something you have to earn. Over time, patience and discipline become a foundation you trust.'),

('fortune', 'planet_in_sign', 'Jupiter', 'Taurus', NULL, 'Natural Abundance',
 'Jupiter in Taurus is associated with steady, grounded growth. You value quality, patience, and things that last, and you understand the worth of slow building.'),

-- ═══════════════════════════
-- MARRIAGE / PARTNERSHIP MARKERS
-- ═══════════════════════════
('marriage', 'planet_in_house', 'Venus', NULL, 7, 'Love & Partnership',
 'Venus in the 7th house is the classic partnership placement. Relationships are where you light up, and you bring warmth and harmony to your connections. Partnership matters deeply to you.'),

('marriage', 'planet_in_house', 'Jupiter', NULL, 7, 'Generous Partnerships',
 'Jupiter in the 7th expands through partnership. Astrologers read it as generosity in relationships—you may be drawn to people who bring growth, optimism, or a wider world into your life.'),

('marriage', 'planet_in_house', 'Sun', NULL, 7, 'Identity Through Partnership',
 'Sun in the 7th means relationships are a big part of how you understand yourself. You come alive in one-on-one connection and learn about yourself through other people. The growth edge is knowing you''re whole on your own, too.'),

('marriage', 'planet_in_house', 'Saturn', NULL, 7, 'Committed Partnership',
 'Saturn in the 7th takes commitment seriously. You may approach partnership carefully, or later than people around you, and you value steadiness and responsibility over flash. Trust is something you build.'),

('marriage', 'planet_in_house', 'Pluto', NULL, 7, 'Intense Bonds',
 'Pluto in the 7th means your close relationships can be deeply transformative—they change you. Power dynamics are worth noticing, and you deserve partnerships where power is shared.'),

-- ═══════════════════════════
-- PSYCHIC / INTUITION MARKERS
-- ═══════════════════════════
('psychic', 'planet_in_house', 'Neptune', NULL, 12, 'Psychic Gift',
 'Neptune in the 12th is a classic placement for intuition and imagination. You may feel close to dreams, the unconscious, and the spiritual. Sensitivity is part of your gift, so protect your energy.'),

('psychic', 'planet_in_house', 'Moon', NULL, 12, 'Deep Intuition',
 'Moon in the 12th gives you a quiet emotional radar. You may pick up on moods before anyone says a word, and your dreams can be vivid. You absorb other people''s feelings easily. Solitude recharges you.'),

('psychic', 'planet_in_house', 'Moon', NULL, 8, 'Emotional X-Ray',
 'Moon in the 8th gives you emotional depth and perceptiveness. You notice what''s under the surface of a room. It''s a real strength when you trust it—and it''s always fair to check your read with the people involved.'),

('psychic', 'planet_in_house', 'Neptune', NULL, 1, 'Empath',
 'Neptune in the 1st makes you an empath. You absorb the energy of every room you walk into. People see in you what they need to see. You have a chameleon-like quality that''s both a gift and a trap.'),

('psychic', 'planet_in_sign', 'Moon', 'Pisces', NULL, 'Mystic Moon',
 'Moon in Pisces is one of the most intuitive lunar placements. You feel the world at a frequency many people miss, and your emotional intelligence runs deep. Art, music, and care for others are natural outlets.'),

('psychic', 'planet_in_sign', 'Moon', 'Scorpio', NULL, 'Psychic Depth',
 'Moon in Scorpio gives you penetrating emotional insight. You read undercurrents and hidden motives quickly. Your gut is worth listening to, and worth checking against what people actually tell you.'),

-- ═══════════════════════════
-- HEALING MARKERS
-- ═══════════════════════════
('healing', 'planet_in_house', 'Neptune', NULL, 6, 'Natural Healer',
 'Neptune in the 6th house connects you to healing work. Your daily life may involve health, service, or helping others through physical or spiritual means. You instinctively know what people need to feel better.'),

('healing', 'planet_in_house', 'Pluto', NULL, 6, 'Transformative Healer',
 'Pluto in the 6th brings intensity to service and daily work. You may be drawn to psychology, crisis work, or deep body practices. You like getting to the root of things rather than skimming the surface.'),

('healing', 'planet_in_house', 'Moon', NULL, 6, 'Emotional Caretaker',
 'Moon in the 6th makes your daily work about nurturing others. You need to feel useful. Your emotional wellbeing is tied to being of service. Health care, counseling, or caregiving may call to you.'),

-- ═══════════════════════════
-- LEADERSHIP MARKERS
-- ═══════════════════════════
('leadership', 'planet_in_house', 'Sun', NULL, 1, 'Natural Leader',
 'Sun in the 1st house gives you natural leadership energy. You walk into a room and people look at you. Your identity is strong and visible. You''re meant to lead from the front, not the background.'),

('leadership', 'planet_in_house', 'Saturn', NULL, 10, 'Authority Figure',
 'Saturn in the 10th builds authority over time. Your career may start slowly, and your standing grows with patience. People take you seriously. Your discipline and work ethic are visible to everyone.'),

('leadership', 'planet_in_house', 'Mars', NULL, 10, 'Driven Ambition',
 'Mars in the 10th is pure career drive. You pursue your goals aggressively and publicly. You''re competitive in your field and need to be the best. Your energy is visible and your ambition is obvious.'),

('leadership', 'planet_in_house', 'Pluto', NULL, 1, 'Magnetic Presence',
 'Pluto in the 1st gives you an intense, magnetic presence. People either gravitate toward you or instinctively back away. You have a natural power that can''t be faked or hidden. Use it consciously.'),

('leadership', 'sign_on_house', NULL, 'Aries', 10, 'Aries Midheaven',
 'Aries on the 10th house cusp means your career requires initiative and courage. You''re meant to pioneer, not follow. You need a career where you can lead, start things, and move fast.'),

('leadership', 'sign_on_house', NULL, 'Capricorn', 1, 'Capricorn Rising',
 'Capricorn rising gives you the presence of someone who''s already in charge. People respect you on sight. You appear serious, capable, and mature. Authority is your default energy.'),

-- ═══════════════════════════
-- CREATIVITY MARKERS
-- ═══════════════════════════
('creativity', 'planet_in_house', 'Venus', NULL, 5, 'Artistic Gift',
 'Venus in the 5th house is a pure creative blessing. Art, music, performance, romance—these aren''t hobbies for you. They''re essential. You create beauty as naturally as you breathe.'),

('creativity', 'planet_in_house', 'Neptune', NULL, 5, 'Visionary Creator',
 'Neptune in the 5th gives you artistic vision that''s otherworldly. Your creativity channels something larger than you. Film, music, poetry, dance—your art has a spiritual quality that moves people deeply.'),

('creativity', 'planet_in_house', 'Sun', NULL, 5, 'Creative Identity',
 'Sun in the 5th means your identity is tied to creation. You need to make things—art, children, projects, performances. Self-expression isn''t optional. Without a creative outlet, you wilt.'),

('creativity', 'planet_in_house', 'Moon', NULL, 5, 'Emotional Artist',
 'Moon in the 5th means your emotions fuel your creativity. You create from feeling, not concept. Your art is personal and intimate. Romance and play are emotional necessities, not luxuries.'),

('creativity', 'planet_in_sign', 'Venus', 'Pisces', NULL, 'Dreamer Artist',
 'Venus in Pisces is exalted—this is artistic talent at its highest expression. You perceive beauty that others can''t see. Music, visual art, poetry, film—your creative gifts are deeply spiritual.'),

-- ═══════════════════════════
-- KARMIC MARKERS
-- ═══════════════════════════
('karmic', 'planet_in_house', 'Saturn', NULL, 12, 'Hidden Karma',
 'Saturn in the 12th is read as a placement of hidden lessons. Some people with it describe a sense of responsibility or heaviness that''s hard to name. Solitude, reflection, and support—spiritual or professional—can help you work with it.'),

('karmic', 'planet_in_house', 'Saturn', NULL, 4, 'Family Karma',
 'Saturn in the 4th ties your sense of family to duty or restraint. Building your own sense of home and safety—on your terms—is the work this placement points to.'),

('karmic', 'planet_in_house', 'Pluto', NULL, 12, 'Deep Transformation',
 'Pluto in the 12th is powerful unconscious energy. You may be drawn to psychology, shamanism, or shadow work. Past life themes run deep. You transform by facing what''s hidden—in yourself and in the collective.'),

('karmic', 'planet_in_house', 'Saturn', NULL, 1, 'Self-Mastery Karma',
 'Saturn in the 1st means your biggest lesson is about self. You may have felt restricted, criticized, or overly responsible from a young age. The karma is learning that you''re enough without performing or proving anything.');
