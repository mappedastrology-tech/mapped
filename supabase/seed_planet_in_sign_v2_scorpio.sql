-- Updated Scorpio entries — planet-specific, not sign-generic
-- Each planet talks about ITS domain through the Scorpio lens

-- Delete old Scorpio entries first
DELETE FROM kb_planet_in_sign WHERE sign = 'Scorpio';

INSERT INTO kb_planet_in_sign (planet, sign, summary, life_patterns, relationships, challenges, growth, book_references) VALUES

('Sun', 'Scorpio',
 'Your core identity is built on depth. You know who you are at a fundamental level that most people never reach. Your sense of self was forged through intensity — loss, transformation, or experiences that stripped away the superficial. You don''t do identity lightly.',
 'You carry yourself with quiet authority. People sense there''s more to you than what''s visible, and they''re right. You''re drawn to work that involves investigation, psychology, research, or anything that requires seeing below the surface. You make decisions from your gut and you''re rarely wrong. You protect your privacy fiercely because your inner world is sacred to you.',
 'You bring intensity to relationships because that''s how you connect — through honesty and depth, not small talk. Partners either find this magnetic or overwhelming. You need someone who can match your emotional courage. Surface-level relationships bore you to the point of resentment.',
 'Your need for control can make you rigid. You sometimes test people to see if they''ll stay, and the testing itself drives them away. You can hold your identity so tightly that you resist the very transformation you''re built for. When you feel threatened, you withdraw completely rather than showing vulnerability.',
 'Your power is in your willingness to go where others won''t — into the uncomfortable, the hidden, the real. Stop testing people and start trusting the ones who''ve already proven themselves. Your identity gets stronger every time you transform, not weaker. Let the old versions of yourself die gracefully.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Moon', 'Scorpio',
 'Your emotional needs are extreme. You need to feel deeply to feel alive — lukewarm emotions don''t register for you. Your inner world is a landscape of intense feelings that most people would find overwhelming, but for you it''s just Tuesday. Emotional safety means knowing someone can handle your depth.',
 'You process feelings privately and thoroughly. You don''t cry at commercials — you cry at 2am about something that happened three years ago that you finally understand. You remember emotional details with photographic precision. You know when someone''s energy shifts before they do. Your moods are tidal, not gradual.',
 'You need a partner who isn''t afraid of emotional intensity. You want to be known completely, but you''ll only reveal yourself to someone who''s earned it through consistency. You feel betrayal at a cellular level. Your love is fierce and protective — you''d go to war for someone you care about.',
 'You can use emotional insight as a weapon when hurt. Your fear of vulnerability makes you guard yourself so heavily that people can''t actually reach you. You may confuse emotional intensity with emotional intimacy — they''re not the same thing. Holding onto pain becomes an identity rather than something to process.',
 'Let yourself be known before you feel safe — safety comes from being known, not the other way around. Your emotional depth is a superpower for connection when you share it instead of weaponize it. Not every feeling needs to be analyzed to death. Sometimes the bravest thing you can do is feel something and let it pass.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Mercury', 'Scorpio',
 'Your mind is investigative, penetrating, and relentless. You don''t think in surfaces — every conversation, every piece of information gets processed through a filter of "what''s really going on here?" Your mental energy is focused and probing. You understand subtext better than text.',
 'You ask the question nobody else will ask. You read between every line. You''re drawn to psychology, mystery, research, true crime, or anything that involves uncovering hidden truth. Your memory for important details is exceptional. You think strategically and several moves ahead. You''re quiet in groups but devastating in one-on-one conversation.',
 'You communicate with precision and emotional weight. Small talk exhausts you. You want conversations that go somewhere real. You can read your partner''s mood from a single text message. You remember everything someone said and will reference it months later. Partners either love your depth of attention or feel surveilled by it.',
 'Your mental intensity can become paranoia. You look for hidden meanings that aren''t there. You can use what you know about people against them when you feel cornered. Your communication style can feel like interrogation. You struggle to let things go mentally — you replay conversations looking for what you missed.',
 'Trust your instincts but question your conclusions. Not everything has a hidden agenda. Use your investigative mind to understand people, not to build cases against them. Your ability to see truth is a gift — share your insights with kindness, not as accusations. Let some mysteries remain unsolved.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Venus', 'Scorpio',
 'You love like it''s life or death — because for you, it is. Your attractions are magnetic and your loyalty is absolute. You don''t fall in love gradually; you fall completely, with your whole self. Beauty, for you, lives in what''s raw, real, and emotionally honest — not in what''s pretty or polished.',
 'You''re drawn to intensity in aesthetics — dark music, complex art, emotionally charged films. Your taste runs deep, not wide. You value loyalty over likeability. You''d rather have one person who truly knows you than a hundred casual friends. You spend money on things that matter to you and nothing on things that don''t.',
 'You demand total emotional honesty from partners and you can sense dishonesty instantly. Physical intimacy is spiritual for you — it''s how you bond at the deepest level. You''re possessive not because you don''t trust your partner, but because you''ve given them something irreplaceable and you need to know it''s safe.',
 'Your possessiveness can suffocate the love you''re trying to protect. You test partners'' loyalty in ways that create the very betrayal you fear. You can confuse intensity with love — some relationships are consuming without being nourishing. Walking away from something that isn''t working feels like dying, so you stay too long.',
 'Real love doesn''t need to be tested — it needs to be trusted. Your capacity for deep bonding is extraordinary; honor it by choosing partners worthy of it instead of trying to make everyone worthy through sheer intensity. Let love breathe. The right person won''t leave just because you loosened your grip.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Mars', 'Scorpio',
 'Your drive is strategic, patient, and absolutely relentless. You don''t fight in the open — you play the long game. When you want something, you pursue it with a quiet intensity that most people don''t notice until it''s already done. Your willpower is one of the strongest placements in astrology.',
 'You work best alone or in small trusted groups. You don''t waste energy on things that don''t matter. When you commit to a goal, nothing stops you. You''re physically intense — your body holds energy and tension. You exercise to release what your mind won''t let go of. You''re competitive but you''d rather win strategically than publicly.',
 'Your sexual energy is powerful and magnetic. You attract people without trying. Physical intimacy is how you express what words can''t. You''re fiercely protective of partners. Your anger is cold and surgical — you don''t yell, you cut. You need a partner who can handle intensity without being intimidated.',
 'Your anger goes underground and festers. You can hold grudges that outlast the relationship. Your strategic nature can become manipulation when you feel powerless. You sometimes destroy things preemptively rather than risk losing them. Your intensity in conflict can be disproportionate to the situation.',
 'Express anger when you feel it, not three months later as a calculated move. Your strategic mind is an asset when directed at goals, not people. Physical outlets for your intensity are non-negotiable — your body needs to move what your mind holds. Your power is most impressive when it''s used to build, not to control.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Jupiter', 'Scorpio',
 'Your growth comes through going deep — into yourself, into taboo subjects, into the parts of life other people avoid. You expand by transforming. Each crisis makes you wiser, not weaker. Your luck lives in your willingness to face what others run from.',
 'You''re drawn to psychology, healing, finance, or anything that involves understanding what''s hidden. You grow through intensity, not comfort. You''re generous with people you trust — sometimes to the point of over-investing. You learn best through immersive experience, not theory.',
 'You bring depth and growth to relationships. Partners grow around you because you push them to be honest. You attract intense connections that change both people. You believe in transformative love — relationships should make you better or they''re not worth having.',
 'You can become addicted to intensity and mistake drama for growth. You over-invest in people and situations that aren''t worthy of your energy. Your "growth through crisis" pattern means you sometimes create crises to feel alive.',
 'Growth doesn''t always have to hurt. Learn to expand through joy and curiosity, not just transformation. Your depth is a gift — use it to help others heal, not just to go deeper into your own patterns.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Saturn', 'Scorpio',
 'Your biggest life lessons come through power, trust, and emotional vulnerability. You were taught early that letting people in is dangerous, so you built walls that are almost impossible to breach. Your discipline is emotional — you control your feelings with an iron grip.',
 'You handle crisis better than anyone. Where others panic, you go calm and strategic. You''re responsible with other people''s resources, secrets, and emotions. You take commitment seriously — when you''re in, you''re in completely. You fear being out of control more than almost anything.',
 'You take relationships with deadly seriousness. Casual doesn''t exist for you. You may attract partners who test your trust issues, or you may avoid vulnerability entirely until you find someone safe enough. Your love is loyal but guarded.',
 'Your fear of vulnerability isolates you. You can become controlling to manage the anxiety of trusting someone. You may struggle with intimacy — physical or emotional — because it requires surrender. You hold yourself to impossible standards of emotional self-sufficiency.',
 'The lesson isn''t to stop trusting — it''s to trust wisely and accept that some pain is the price of real connection. Your emotional discipline is a strength when it protects you and a prison when it isolates you. Let someone in before you''re ready. You''ll survive it.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Uranus', 'Scorpio',
 'Your generation transforms societal taboos. You bring sudden change to power structures, sexuality, and emotional honesty. Individually, you experience unexpected upheavals that force deep personal transformation. Your rebellion is internal and psychological.',
 'You''re drawn to unconventional approaches to intimacy, power, and transformation. You may have experienced sudden losses or changes that reshaped your understanding of control. Technology and psychology interest you equally.',
 'You bring unpredictability to deep relationships. You need partners who can handle sudden emotional shifts. You may be attracted to unconventional relationship structures.',
 'Sudden changes in trust or intimacy can make you hypervigilant. You may sabotage deep connections before they can hurt you.',
 'Let transformation happen without trying to control its timing. Your ability to regenerate after upheaval is remarkable.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Neptune', 'Scorpio',
 'Your generation has a deep, almost psychic understanding of hidden truths. You sense what''s beneath the surface of culture — the collective shadow, the unspoken power dynamics. Individually, your spiritual life is intense and transformative.',
 'You may be drawn to spiritual practices that involve shadow work, depth psychology, or altered states. Your intuition about people''s hidden motivations is sharp. You sense deception easily.',
 'You bring spiritual depth to intimate relationships. You may idealize intense connections or confuse spiritual bonding with emotional dependency.',
 'Your tendency to see the hidden side of everything can become paranoia or obsession with darkness. You may romanticize suffering.',
 'Use your depth perception for healing, not just for seeing what''s wrong. Your spiritual insight is a gift when directed toward compassion.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Pluto', 'Scorpio',
 'This is Pluto in its own sign — the most powerful expression of transformation possible. Your generation carries massive potential for psychological and cultural rebirth. Individually, transformation isn''t something that happens to you — it''s who you are.',
 'You live in cycles of death and rebirth more intensely than any other Pluto generation. You''re drawn to extremes. You understand power at a fundamental level — how it works, who has it, and how it corrupts. You''re not afraid of the dark.',
 'Your relationships are transformative by nature. You change people and they change you. Nothing about your intimate life is casual or surface-level.',
 'The intensity can become self-destructive. You may be drawn to crisis and extremes because calm feels like stagnation.',
 'You don''t need to destroy things to transform them. Evolution can be gentle. Your generation''s gift is showing the world what it''s afraid to look at — use that power responsibly.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']);
