-- Seed file for kb_dignities
-- Planetary dignities: domicile (rules the sign), exalted (strongest expression),
-- detriment (opposite of domicile), fall (opposite of exalted)

INSERT INTO kb_dignities (planet, sign, dignity_type, summary, what_it_means) VALUES

-- ═══ SUN ═══
('Sun', 'Leo', 'domicile',
 'This is your planet at home. The Sun rules Leo, so your core identity expresses itself naturally and powerfully. You don''t have to try to shine—you just do.',
 'You have an effortless sense of self. People notice you without you performing. Your confidence is organic, not constructed. This is one of the strongest placements for knowing who you are and owning it.'),

('Sun', 'Aries', 'exalted',
 'Your Sun is exalted here. Your identity is fueled by action and courage. You''re built to lead, initiate, and move first. This is the Sun at its most vital and assertive.',
 'You feel most like yourself when you''re being bold. You don''t wait for permission. Your sense of purpose is tied to independence and forward motion. You have natural authority.'),

('Sun', 'Aquarius', 'detriment',
 'Your Sun is in detriment. The personal ego sits uncomfortably in the sign of the collective. You might struggle with wanting to stand out while also wanting to belong to something bigger.',
 'You may wrestle with identity—feeling like you don''t fit conventional roles. This isn''t weakness. It means your sense of self is tied to originality and community, not personal glory. You define yourself differently than most.'),

('Sun', 'Libra', 'fall',
 'Your Sun is in fall here. Your sense of self gets filtered through others—you sometimes lose yourself in relationships or compromise. Finding your own identity separate from partnerships is your lifelong work.',
 'You might defer to others or struggle to make decisions alone. This doesn''t mean you''re weak—it means your identity is relational. The growth is learning to be yourself even when you''re alone.'),

-- ═══ MOON ═══
('Moon', 'Cancer', 'domicile',
 'The Moon rules Cancer. Your emotions are at home here—deep, intuitive, and powerfully felt. You process life through feeling first, always.',
 'You have natural emotional intelligence. You read rooms, sense moods, and nurture instinctively. Your gut feelings are almost always right. Home and family aren''t optional for you—they''re your foundation.'),

('Moon', 'Taurus', 'exalted',
 'Your Moon is exalted in Taurus. Your emotional nature is grounded, steady, and deeply sensory. You find peace through physical comfort, routine, and beauty.',
 'You''re emotionally stable in a way most people aren''t. You don''t get rattled easily. You need consistency and quality in your environment to feel safe. Your calm is a gift to everyone around you.'),

('Moon', 'Capricorn', 'detriment',
 'Your Moon is in detriment. Feelings get filtered through duty and control. You were taught early that emotions are inconvenient, so you manage them like tasks.',
 'You might struggle to be vulnerable or ask for comfort. You process feelings privately and show love through responsibility. The growth is letting yourself feel without needing a reason.'),

('Moon', 'Scorpio', 'fall',
 'Your Moon is in fall. Your emotional world is intense, private, and sometimes overwhelming. You feel everything at maximum depth but trust almost no one with it.',
 'You experience emotions others can''t even name. You''re transformative but sometimes destructive with your feelings. The growth is learning that vulnerability isn''t the same as weakness, and that not everything requires a crisis to process.'),

-- ═══ MERCURY ═══
('Mercury', 'Gemini', 'domicile',
 'Mercury rules Gemini. Your mind is quick, curious, and endlessly connecting dots. Communication is your superpower—you think fast and talk faster.',
 'Information moves through you like electricity. You learn by talking, asking, and linking ideas. You''re the person who always has the perfect word or the interesting fact. Your mind is your greatest tool.'),

('Mercury', 'Virgo', 'domicile',
 'Mercury rules Virgo too. But here it''s precise, analytical, and detail-oriented. Your mind works like a fine instrument—nothing gets past you.',
 'You notice what everyone else misses. You think in systems and processes. Your communication is clear and practical. You''re the person who actually reads the fine print and catches the error.'),

('Mercury', 'Aquarius', 'exalted',
 'Mercury is exalted in Aquarius. Your thinking is original, future-oriented, and unbound by convention. You see patterns others won''t see for years.',
 'Your mind works differently and that''s your strength. You think in systems, innovations, and possibilities. You''re not interested in how things have always been done—you want to know how they could be.'),

('Mercury', 'Sagittarius', 'detriment',
 'Mercury is in detriment in Sagittarius. Your mind thinks big—so big that details feel like obstacles. You see the forest but trip over every tree.',
 'You''re a visionary thinker who struggles with execution. You speak in grand ideas and can come across as preachy. The growth is learning that details matter and that listening is as important as declaring.'),

('Mercury', 'Pisces', 'fall',
 'Mercury is in fall in Pisces. Your mind thinks in images, feelings, and intuition rather than logic and facts. Language sometimes fails you because what you know is beyond words.',
 'You absorb information empathically. You might struggle to articulate what you deeply understand. Your thinking is creative and spiritual, not linear. The gift is that you perceive things rational minds miss entirely.'),

-- ═══ VENUS ═══
('Venus', 'Taurus', 'domicile',
 'Venus rules Taurus. Love and beauty are experienced through the senses—touch, taste, comfort. Your approach to love is loyal, physical, and deeply grounded.',
 'You know what you like and you don''t settle. You express love through presence, quality time, and creating beautiful environments. You''re a natural at making life feel luxurious, even on a budget.'),

('Venus', 'Libra', 'domicile',
 'Venus rules Libra. Love is an art form for you—partnership, harmony, and aesthetic beauty are central to your happiness.',
 'You have a natural gift for relationships. You understand compromise, charm, and creating balance. You make people feel seen and valued. Your taste is refined and you create beauty wherever you go.'),

('Venus', 'Pisces', 'exalted',
 'Venus is exalted in Pisces. This is love at its most unconditional, romantic, and transcendent. You love without boundaries and see the divine in people.',
 'You love more deeply than most people are comfortable with. Your compassion is limitless. You see potential in everyone and love them for who they could be. The beauty you perceive is spiritual, not just physical.'),

('Venus', 'Scorpio', 'detriment',
 'Venus is in detriment in Scorpio. Love isn''t light or casual for you—it''s obsessive, transformative, and all-consuming. You love like your life depends on it.',
 'You don''t do casual. Your relationships are intense power exchanges. You need total honesty and deep emotional intimacy. Jealousy and control can be issues, but so can profound loyalty and transformative love.'),

('Venus', 'Aries', 'detriment',
 'Venus is in detriment in Aries. You chase love aggressively and impatiently. You want what you want now, and the thrill of pursuit matters more than the comfort of having.',
 'You fall fast and hard. You''re attracted to independence and directness. Romance is an adventure, not a routine. The challenge is staying once the chase is over.'),

('Venus', 'Virgo', 'fall',
 'Venus is in fall in Virgo. Love gets filtered through criticism and analysis. You show love by fixing things, but it can come across as never being satisfied.',
 'You love through service and practical help. You notice everything about your partner—including flaws. The growth is accepting imperfection in love and expressing affection without conditions.'),

-- ═══ MARS ═══
('Mars', 'Aries', 'domicile',
 'Mars rules Aries. This is raw, unfiltered drive. You act first, think later. Your energy is direct, competitive, and fearless.',
 'You have natural physical vitality and courage. You don''t hesitate. When you want something, you go after it immediately. You''re built for competition and leadership. Your anger is hot but burns out fast.'),

('Mars', 'Scorpio', 'domicile',
 'Mars rules Scorpio too. But here the energy is strategic, controlled, and relentless. You don''t fight in the open—you play the long game.',
 'Your willpower is extraordinary. You pursue goals with laser focus and don''t stop until you''ve won. You''re psychologically powerful and can intimidate without trying. Your strength is endurance and intensity.'),

('Mars', 'Capricorn', 'exalted',
 'Mars is exalted in Capricorn. Your drive is disciplined, ambitious, and incredibly effective. You channel aggression into achievement.',
 'You''re the person who actually follows through. Your ambition is patient and calculated. You build empires slowly and methodically. You earn respect through results, not noise.'),

('Mars', 'Libra', 'detriment',
 'Mars is in detriment in Libra. Your drive gets diluted by the need for harmony. You struggle to assert yourself without guilt or over-compromising.',
 'You fight for fairness, not yourself. You avoid conflict and can be passive-aggressive. The growth is learning that your needs matter and that being direct isn''t the same as being aggressive.'),

('Mars', 'Taurus', 'detriment',
 'Mars is in detriment in Taurus. Your energy is slow to start and stubborn once moving. You resist change and fight to keep things as they are.',
 'You''re steady and persistent but can be lazy or immovable. Your anger builds slowly but erupts powerfully. You fight for security and comfort. The growth is learning to adapt and act before you''re forced to.'),

('Mars', 'Cancer', 'fall',
 'Mars is in fall in Cancer. Your drive is emotional and defensive. You fight to protect, not to conquer. Your energy rises and falls with your moods.',
 'You struggle to be assertive directly. You fight sideways—through guilt, emotional withdrawal, or passive aggression. The growth is learning to express anger honestly without making it about everyone else''s feelings.'),

-- ═══ JUPITER ═══
('Jupiter', 'Sagittarius', 'domicile',
 'Jupiter rules Sagittarius. This is expansion at its most natural—optimism, adventure, and big-picture thinking. You believe everything will work out, and it usually does.',
 'You''re lucky in a way that seems unfair. Opportunities find you. Your faith in life is genuine, not naive. You need freedom, travel, and meaning to feel alive.'),

('Jupiter', 'Pisces', 'domicile',
 'Jupiter rules Pisces too. Your expansion is spiritual, compassionate, and boundless. You grow through faith, empathy, and surrender.',
 'You have a deep connection to something larger than yourself. Your generosity is spiritual. You expand through art, healing, and helping. You can overdo it—boundaries with your compassion matter.'),

('Jupiter', 'Cancer', 'exalted',
 'Jupiter is exalted in Cancer. Growth comes through nurturing, family, and emotional security. Your generosity is maternal and protective.',
 'You grow by making others feel safe. Family and home are where your luck lives. You have an emotional abundance that makes people trust you deeply. Real estate, food, and caregiving can all be sources of fortune.'),

('Jupiter', 'Gemini', 'detriment',
 'Jupiter is in detriment in Gemini. Your mind expands in every direction at once—lots of knowledge, not much depth. You know a little about everything.',
 'You''re intellectually restless. You start books you don''t finish and collect hobbies. The growth is choosing depth over breadth and committing to one idea long enough to master it.'),

('Jupiter', 'Virgo', 'detriment',
 'Jupiter is in detriment in Virgo. Expansion gets micromanaged. You want to grow but you overthink every step and get stuck in the details.',
 'Your luck works through service and precision, not grand gestures. Growth comes from improving systems and helping others. The challenge is letting good enough be good enough.'),

('Jupiter', 'Capricorn', 'fall',
 'Jupiter is in fall in Capricorn. Optimism meets skepticism. You want to believe but you need proof first. Growth comes slowly and through hard work.',
 'You don''t trust easy success. Everything you build is earned through discipline. Your luck is delayed but durable. The growth is allowing some spontaneity and faith alongside your five-year plan.'),

-- ═══ SATURN ═══
('Saturn', 'Capricorn', 'domicile',
 'Saturn rules Capricorn. Discipline is your native language. You understand structure, ambition, and the price of achievement better than anyone.',
 'You were born old and get younger with time. Early life may have felt heavy or restrictive, but you build real things that last. Authority comes naturally to you. You earn everything.'),

('Saturn', 'Aquarius', 'domicile',
 'Saturn rules Aquarius too. Here discipline serves the collective. You build systems, organizations, and structures that serve the future.',
 'You think in terms of what''s fair for everyone, not just what benefits you. You''re disciplined about your ideals. You build communities and networks with serious intent.'),

('Saturn', 'Libra', 'exalted',
 'Saturn is exalted in Libra. Discipline applied to relationships and justice. You take commitments seriously and hold others to high standards.',
 'You understand that real relationships require work and fairness. You don''t make promises lightly. Marriage and partnership are sacred to you. You bring structure to chaos through diplomacy.'),

('Saturn', 'Cancer', 'detriment',
 'Saturn is in detriment in Cancer. Emotional expression gets restricted. You were taught to toughen up when you needed to be held.',
 'Family relationships may have felt cold or overly dutiful. You struggle to be emotionally open. The growth is building a chosen family that makes you feel safe enough to be vulnerable.'),

('Saturn', 'Leo', 'detriment',
 'Saturn is in detriment in Leo. Self-expression gets blocked by fear of judgment. You want to shine but something always holds you back.',
 'You may have been criticized for being too much or too visible. Creativity and joy feel like they need permission. The growth is performing anyway—even scared, even imperfect.'),

('Saturn', 'Aries', 'fall',
 'Saturn is in fall in Aries. Your impulse to act gets blocked by fear. You want to charge ahead but something always stops you.',
 'You struggle between wanting independence and fearing the consequences of taking risks. The growth is learning that discipline and action aren''t opposites—you can be bold AND responsible.');
