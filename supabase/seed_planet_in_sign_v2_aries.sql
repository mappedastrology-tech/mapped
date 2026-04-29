-- Updated Aries entries — planet-specific, not sign-generic
-- Each planet talks about ITS domain through the Aries lens

-- Delete old Aries entries first
DELETE FROM kb_planet_in_sign WHERE sign = 'Aries';

INSERT INTO kb_planet_in_sign (planet, sign, summary, life_patterns, relationships, challenges, growth, book_references) VALUES

('Sun', 'Aries',
 'Your core identity is about being FIRST. You are the pioneer, the one who charges ahead before the map is drawn. Your sense of self is built on independence, courage, and the need to prove yourself through action. You know who you are because you''re constantly discovering it — through doing, not thinking.',
 'You move fast and you expect the world to keep up. You''re the person who volunteers first, applies for the job nobody else dares to try, takes the road nobody''s taken. You''re naturally competitive because you measure yourself against something bigger. You don''t follow trends; you start them. Your life is a series of fresh starts and bold moves.',
 'You bring directness and enthusiasm to relationships. You love fiercely and fast, and you expect the same in return. You don''t do slow burns — you''re all in or not interested. Partners appreciate your honesty but sometimes get whiplash from your intensity. You need someone who won''t slow you down or try to contain you.',
 'Your impatience makes you quit things before they''re ready. You can be so focused on the next challenge that you don''t finish what you''ve started. You can steamroll people without meaning to. Your competitive nature sometimes makes you see relationships as battles to win rather than connections to nurture.',
 'Your courage is real and rare — use it to start meaningful things, not just to feed your ego. Completion is just as powerful as initiation. Learn that leading doesn''t mean always being fastest. Your identity gets deeper when you stay with something long enough to understand it, not just conquer it.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Moon', 'Aries',
 'Your emotional needs are about FEELING ALIVE. You need action, adrenaline, and the rush of new experience to feel like you exist. Boredom is your biggest emotional fear. You don''t process feelings by sitting with them — you move through them fast, sometimes so fast you don''t notice what you actually felt.',
 'You''re energized by challenge and competition. Peaceful routines feel stagnant to you. You get irritable and moody when you''re trapped or restricted. Your emotional expression is direct and uncomplicated — you get angry fast and you''re over it fast. You need to feel like you''re making progress, moving forward, winning something every day.',
 'You need emotional excitement and freedom in relationships. You want a partner who''s active, engaged, not clingy or dependent. You can be loving but you need space to be yourself. You show affection through action and adventure, not through prolonged emotional conversation. You need someone who challenges you.',
 'Your need for stimulation can make you restless and unable to stay with deep feelings. You may avoid real emotional vulnerability by keeping things surface-level and fast-paced. Your moodiness can come across as aggression. Calm relationships feel like emotional death to you, so you create drama to feel something.',
 'Emotional depth doesn''t require you to slow down — it requires you to NOTICE. Your feelings are real even if you process them quickly. Learn to stay present with what you feel for longer than five minutes. The people worth keeping are worth slowing down for.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Mercury', 'Aries',
 'Your thinking style is DIRECT and FAST. You see a problem and you immediately see the solution. Your mind works in straight lines, not spirals. You think out loud, you make decisions quickly, and you''re rarely second-guessing yourself. You understand things through action and direct experience, not theory.',
 'You''re a natural speaker — bold, assertive, convincing. People listen when you talk because you speak with conviction. You get bored by long explanations; you want facts, fast. You''re quick-witted and your humor is sharp and immediate. You think competitively and you approach arguments like you approach everything else — to win.',
 'Your communication style is refreshingly honest. You say what others are thinking but won''t say out loud. You don''t play games in conversation — you want straight answers and you give straight answers. You can stimulate partners intellectually through debate. You''re not interested in small talk.',
 'Your directness can hurt people before you realize you''ve said something harsh. You interrupt because you''re already moving to the next idea. You may not listen fully because you''re already formulating your response. Your certainty can feel arrogant. You struggle with complex, nuanced topics that don''t have clear answers.',
 'Listening is a skill worth developing — you might learn something if you hear someone all the way through. Your directness is a strength; use it to clarify, not to conquer. Not every conversation is a battle. Sometimes the wisest thing is saying nothing and sitting with the complexity.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Venus', 'Aries',
 'You love with IMMEDIATE, PASSIONATE INTENSITY. You see someone attractive and you''re already imagining the adventure. Your attractions are fast, hot, and undeniable. You don''t do gradual seduction — you prefer the direct approach. Beauty, for you, means fire, confidence, and energy.',
 'You''re drawn to exciting, active people who can keep up with you. Your aesthetic leans toward bold colors, striking style, and things that make a statement. You value independence in partners — you don''t want someone clingy. You spend money on experiences and adventures. You flirt easily because you''re naturally playful and confident.',
 'You bring passion and excitement to relationships. You pursue your love interest directly and without apology. You want a partner who''s a team captain, not a supporting player. Physical intimacy is important — you''re sensual and present during sex. You show love through action, not words.',
 'Your impatience can make you abandon relationships once the conquest is over. You can mistake the thrill of new attraction for lasting love. Your competitiveness might make you want someone partly because someone else does. You can be selfish in love because you''re focused on getting what you want.',
 'Real love is about building something with someone, not just winning them. Let the excitement come from deepening a connection, not chasing a new one. Your passion is beautiful — channel it toward someone worth the intensity. The best relationships feed your spirit, not just your ego.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Mars', 'Aries',
 'This is Mars in its own sign — the most direct expression of DRIVE, ACTION, and COURAGE. Your willpower is legendary. You don''t hesitate, you don''t question, you ACT. Your sexuality is uncomplicated and confident. Your anger is fast and explosive, then it''s gone. You move at maximum intensity.',
 'You''re a natural athlete or warrior-type. You throw yourself into physical challenges fearlessly. You compete to win, not to participate. Your sexual energy is obvious and powerful — you attract people without trying. You work best in short bursts of intense effort. Laziness is your only real enemy.',
 'You bring physical vitality and passion to sexuality. You''re generous with your body and your energy. You need a partner who can match your intensity and sexual appetite. You''re protective of people you care about — you''ll fight for them. You''re straightforward about desire.',
 'Your rage can be destructive before you''ve even thought about consequences. You can be reckless with your own safety and other people''s feelings. Your impatience makes you start fights without thinking through them. You may confuse aggression with confidence.',
 'Your courage is genuine — use it for things worth fighting for, not just to prove you''re tough. Channel your physical intensity into creation, not just conquest. Your anger is information; listen to it instead of just acting it out. The strongest warriors know when not to fight.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Jupiter', 'Aries',
 'Your growth comes through BOLD ACTION and taking BIGGER RISKS. You expand by going places others won''t go, trying things others won''t try. Your luck isn''t passive — it comes from your willingness to charge into opportunity. Each challenge makes you more courageous, not less.',
 'You''re naturally optimistic and confident in your abilities. You take on leadership roles easily because you genuinely believe you can win. You''re drawn to adventure, competition, and anything that feels NEW. You learn through direct experience and action. Your generosity is legendary when you''re inspired.',
 'You bring optimism and possibility to relationships. You inspire people to be braver versions of themselves. You attract growth-oriented partners who want to expand. You believe in second chances and you encourage risk-taking in people you care about.',
 'Your overconfidence can lead you into situations you''re not ready for. You may take unnecessary risks that endanger yourself or others. Your optimism can become blind — you don''t always see the obstacles. You can be reckless with other people''s money and resources.',
 'Confidence without wisdom is just recklessness. Your ability to take action is powerful — direct it toward goals that actually matter. Growth requires some fear; it shouldn''t be thoughtless. Teach people courage by being thoughtfully brave, not just impulsively bold.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Saturn', 'Aries',
 'Your biggest life lessons come through LEARNING TO THINK BEFORE YOU ACT. You were born needing to prove yourself, and Saturn''s job is teaching you that not everything is a battle. Your discipline is the warrior''s discipline — learning when to hold back, when to wait, when the best strategy is patience.',
 'You''re responsible in action. When you commit to something, you follow through. You have natural leadership because people trust that you''ll make the hard calls. You may have experienced early setbacks that taught you to be more careful. You''re learning that premature action has consequences.',
 'You bring stability and reliability to relationships over time. You learn through relationships that your needs aren''t the only ones that matter. You take partnership seriously once you''re in it. You''re faithful and committed, even if it takes you a while to get there.',
 'Your impatience wars with Saturn''s need for caution. You can become aggressive when forced to slow down. You may be terrified of losing your edge if you become too careful. Your fear of missing out makes it hard to be deliberate. You sometimes learn lessons the hard way because you won''t listen.',
 'The lesson isn''t to stop being bold — it''s to be strategically bold. Your warrior energy is needed; timing is everything. The fastest way isn''t always the way. Your power increases when you know the difference between courage and recklessness.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Uranus', 'Aries',
 'Your generation breaks RULES and REDEFINES INDEPENDENCE itself. You bring sudden disruption to leadership structures, gender roles, and how we think about courage. Individually, you experience sudden bursts of revolutionary energy. Your rebellion is restless and forward-moving.',
 'You''re drawn to new technology, unconventional approaches, and anything that feels like the next frontier. You may have experienced sudden shifts in status or identity that made you question everything. You''re impatient with tradition and authority.',
 'You bring unpredictability and excitement to relationships. You need partners who can handle your need for freedom. You may be attracted to unconventional relationship structures or ways of expressing love.',
 'Your need for independence can sabotage intimate connection. You may leave relationships suddenly when they start to feel confining. Your restlessness makes it hard to commit to anything long-term.',
 'Freedom and commitment aren''t opposites. Your revolutionary energy is needed in the world. Use your need for independence to inspire others, not to isolate yourself. True courage is sometimes staying, not always leaving.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Neptune', 'Aries',
 'Your generation has visionary energy and spiritual courage. You see possibilities and ideals that inspire whole movements. You sense where the culture is heading before it gets there. Individually, your spiritual path involves action and direct experience of the divine.',
 'You''re drawn to spiritual practices that involve movement, dance, or direct action. You may have a mystical experience that changes your understanding of courage or heroism. You idealize leaders and revolutionary figures.',
 'You bring idealism and inspiration to relationships. You may see partners as symbols of something bigger than themselves. You inspire people to believe in impossible things.',
 'Your idealism can become naïveté. You may follow leaders or causes blindly. You can confuse your spiritual vision with reality. You''re prone to hero-worship that sets people up to disappoint you.',
 'Your vision is valuable — ground it in reality. Spiritual inspiration is powerful when it leads to actual action and change. Ideals without effort are just dreams. Your generation''s gift is showing the world what''s possible.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']),

('Pluto', 'Aries',
 'Your generation undergoes TOTAL TRANSFORMATION of leadership, power, and identity itself. You''re born into a world that demands a new kind of courage — one that destroys old paradigms and births new ones. Individually, you experience absolute power struggles and rebirth.',
 'You''re drawn to positions of power or to understanding power dynamics at a deep level. You may have experienced trauma or intense situations that gave you a different relationship to fear. You understand that destruction and creation are the same process. You''re not afraid of going to the edge.',
 'Your relationships are intense power dynamics. You transform people through your presence. Nothing about your intimate life is surface-level. You''re drawn to people who challenge your power or your understanding of it.',
 'You can become obsessed with control and domination. You may destroy things — including relationships — preemptively because you''re afraid of losing them. Your intensity can become abusive. Your need to transform everything can be destructive.',
 'Power is most real when it''s used to build and create. You don''t need to destroy to transform. Your generation''s role is to show the world the cycle of death and rebirth — do it consciously and responsibly. Your true power is in your ability to regenerate and help others do the same.',
 ARRAY['Woolfolk, The Only Astrology Book You''ll Ever Need', 'Hand, Planets in Transit']);
