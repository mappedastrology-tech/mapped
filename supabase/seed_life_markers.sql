-- Seed file for kb_life_markers
-- Special placements that flag life themes: fame, fortune, marriage,
-- psychic ability, healing gifts, leadership, creativity, karmic lessons

INSERT INTO kb_life_markers (marker_type, condition_type, planet, sign, house_number, label, summary) VALUES

-- ═══════════════════════════
-- FAME MARKERS
-- ═══════════════════════════
('fame', 'planet_in_house', 'Sun', NULL, 10, 'Fame Marker',
 'Sun in the 10th house is one of the strongest fame indicators in astrology. Your identity is tied to public visibility. You''re meant to be seen, recognized, and known for something. Career isn''t just a job for you—it''s your stage.'),

('fame', 'planet_in_house', 'Jupiter', NULL, 10, 'Fame Marker',
 'Jupiter in the 10th expands your public presence. You attract recognition and opportunities in your career almost magnetically. People in positions of power tend to open doors for you. Your reputation grows naturally.'),

('fame', 'planet_in_house', 'Venus', NULL, 1, 'Beauty & Charm',
 'Venus in the 1st house gives you natural attractiveness and likability. People are drawn to you before you say a word. This placement shows up in celebrities, models, and anyone whose presence is their power.'),

('fame', 'planet_in_house', 'Venus', NULL, 10, 'Public Admiration',
 'Venus in the 10th means you''re liked publicly. Your career involves beauty, art, diplomacy, or something people admire. You make success look effortless and elegant.'),

('fame', 'planet_in_house', 'Neptune', NULL, 10, 'Iconic Image',
 'Neptune in the 10th means your public image has a mystical or idealized quality. People project onto you. You can become famous for an image that''s bigger than who you actually are. Celebrities with cult followings often have this.'),

('fame', 'planet_in_house', 'Pluto', NULL, 10, 'Power & Influence',
 'Pluto in the 10th gives you intense public power. You don''t just have a career—you have influence. People either respect or fear your authority. Transformation through your public role is inevitable.'),

('fame', 'sign_on_house', NULL, 'Leo', 10, 'Leo Midheaven',
 'Leo on the 10th house cusp means your career and public image are meant to shine. You need recognition for your work. You''re drawn to leadership roles, creative industries, or anything where you can be seen and celebrated.'),

-- ═══════════════════════════
-- FORTUNE / WEALTH MARKERS
-- ═══════════════════════════
('fortune', 'planet_in_house', 'Jupiter', NULL, 2, 'Wealth Indicator',
 'Jupiter in the 2nd house is classic wealth energy. Money comes to you more easily than most. You have a natural abundance mindset and tend to attract financial opportunities. The challenge is spending as big as you earn.'),

('fortune', 'planet_in_house', 'Venus', NULL, 2, 'Luxury & Comfort',
 'Venus in the 2nd means you attract money through beauty, relationships, or creative work. You have expensive taste and usually find a way to afford it. Money comes through things you love doing.'),

('fortune', 'planet_in_house', 'Pluto', NULL, 8, 'Transformative Wealth',
 'Pluto in the 8th is power money. Inheritances, investments, other people''s resources—you have access to wealth that isn''t just earned the regular way. Financial transformation is a theme. You may experience dramatic financial shifts.'),

('fortune', 'planet_in_house', 'Jupiter', NULL, 8, 'Inherited Abundance',
 'Jupiter in the 8th expands through shared resources. Inheritance, marriage money, investments, or business partnerships bring financial growth. You benefit from other people''s resources and trust.'),

('fortune', 'planet_in_house', 'Saturn', NULL, 2, 'Earned Wealth',
 'Saturn in the 2nd means money doesn''t come easy early in life—but it builds. You earn every dollar through discipline. By midlife, your financial foundation is rock solid because you built it right.'),

('fortune', 'planet_in_sign', 'Jupiter', 'Taurus', NULL, 'Natural Abundance',
 'Jupiter in Taurus is one of the best placements for sustained wealth. Your growth is steady, material, and grounded. You attract resources through patience and quality. You understand the value of things.'),

-- ═══════════════════════════
-- MARRIAGE / PARTNERSHIP MARKERS
-- ═══════════════════════════
('marriage', 'planet_in_house', 'Venus', NULL, 7, 'Love Blessing',
 'Venus in the 7th house is the classic indicator of a happy marriage. Partnership is where you thrive. You attract loving relationships naturally and bring harmony to every connection. Marriage is central to your happiness.'),

('marriage', 'planet_in_house', 'Jupiter', NULL, 7, 'Fortunate Marriage',
 'Jupiter in the 7th expands through partnership. You tend to marry well—someone who brings growth, generosity, or opportunity into your life. Relationships feel lucky for you. Marriage often improves your circumstances.'),

('marriage', 'planet_in_house', 'Sun', NULL, 7, 'Identity Through Partnership',
 'Sun in the 7th means relationships define you. You need a significant partner to feel complete. This isn''t codependency—it''s your design. Marriage is where you become your fullest self.'),

('marriage', 'planet_in_house', 'Saturn', NULL, 7, 'Committed Partnership',
 'Saturn in the 7th takes marriage seriously. You may marry later or to someone older. Your partnerships are built on commitment and responsibility. The love is earned and lasting, not flashy.'),

('marriage', 'planet_in_house', 'Pluto', NULL, 7, 'Intense Bonds',
 'Pluto in the 7th means your partnerships are transformative and intense. Relationships change you fundamentally. Power dynamics in love are a theme you can''t avoid—only master.'),

-- ═══════════════════════════
-- PSYCHIC / INTUITION MARKERS
-- ═══════════════════════════
('psychic', 'planet_in_house', 'Neptune', NULL, 12, 'Psychic Gift',
 'Neptune in the 12th is one of the strongest psychic indicators in astrology. You have a direct line to the unconscious, to dreams, to spiritual realms. Your intuition isn''t a guess—it''s a channel. Protect your energy because you absorb everything.'),

('psychic', 'planet_in_house', 'Moon', NULL, 12, 'Deep Intuition',
 'Moon in the 12th gives you unconscious emotional radar. You feel things before they happen. Your dreams are vivid and often prophetic. You absorb other people''s emotions without realizing it. Solitude recharges you.'),

('psychic', 'planet_in_house', 'Moon', NULL, 8, 'Emotional X-Ray',
 'Moon in the 8th gives you emotional x-ray vision. You sense what people hide. You know when someone is lying, hurting, or about to change. This is a powerful gift if you learn to trust it without drowning in it.'),

('psychic', 'planet_in_house', 'Neptune', NULL, 1, 'Empath',
 'Neptune in the 1st makes you an empath. You absorb the energy of every room you walk into. People see in you what they need to see. You have a chameleon-like quality that''s both a gift and a trap.'),

('psychic', 'planet_in_sign', 'Moon', 'Pisces', NULL, 'Mystic Moon',
 'Moon in Pisces is the most intuitive lunar placement. You feel the world at a frequency most people can''t access. Your emotional intelligence is almost supernatural. Art, music, and healing are natural outlets.'),

('psychic', 'planet_in_sign', 'Moon', 'Scorpio', NULL, 'Psychic Depth',
 'Moon in Scorpio gives you penetrating emotional insight. You know things you shouldn''t know. You sense betrayal, attraction, and hidden motives like a sixth sense. Trust your gut—it''s almost never wrong.'),

-- ═══════════════════════════
-- HEALING MARKERS
-- ═══════════════════════════
('healing', 'planet_in_house', 'Neptune', NULL, 6, 'Natural Healer',
 'Neptune in the 6th house connects you to healing work. Your daily life may involve health, service, or helping others through physical or spiritual means. You instinctively know what people need to feel better.'),

('healing', 'planet_in_house', 'Pluto', NULL, 6, 'Transformative Healer',
 'Pluto in the 6th transforms through service and health. You may be drawn to psychology, surgery, crisis work, or deep body practices. You heal by going to the root cause, not the symptoms.'),

('healing', 'planet_in_house', 'Moon', NULL, 6, 'Emotional Caretaker',
 'Moon in the 6th makes your daily work about nurturing others. You need to feel useful. Your emotional wellbeing is tied to being of service. Health care, counseling, or caregiving may call to you.'),

-- ═══════════════════════════
-- LEADERSHIP MARKERS
-- ═══════════════════════════
('leadership', 'planet_in_house', 'Sun', NULL, 1, 'Natural Leader',
 'Sun in the 1st house gives you natural leadership energy. You walk into a room and people look at you. Your identity is strong and visible. You''re meant to lead from the front, not the background.'),

('leadership', 'planet_in_house', 'Saturn', NULL, 10, 'Authority Figure',
 'Saturn in the 10th builds authority over time. You may start slow in your career, but you end up at the top. People take you seriously. Your discipline and work ethic are visible to everyone.'),

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
 'Saturn in the 12th carries karmic weight from the past. You may feel a sense of guilt or burden you can''t explain. Solitude, meditation, and spiritual practice help you work through what you inherited. This is heavy but transformative.'),

('karmic', 'planet_in_house', 'Saturn', NULL, 4, 'Family Karma',
 'Saturn in the 4th means your family legacy includes restriction or duty. You may have had a difficult or emotionally cold upbringing. Building your own sense of home and safety—on your terms—is your karmic work.'),

('karmic', 'planet_in_house', 'Pluto', NULL, 12, 'Deep Transformation',
 'Pluto in the 12th is powerful unconscious energy. You may be drawn to psychology, shamanism, or shadow work. Past life themes run deep. You transform by facing what''s hidden—in yourself and in the collective.'),

('karmic', 'planet_in_house', 'Saturn', NULL, 1, 'Self-Mastery Karma',
 'Saturn in the 1st means your biggest lesson is about self. You may have felt restricted, criticized, or overly responsible from a young age. The karma is learning that you''re enough without performing or proving anything.');
