-- Seed file for kb_planets table
-- Inserts the 10 main planets with their astrological meanings

INSERT INTO kb_planets (name, symbol, category, summary, keywords, life_area, question) VALUES
(
  'Sun',
  '☉',
  'Personal',
  $$Your Sun sign is your core identity—the essence of who you are at your best. It's the light you shine outward, your fundamental drive and sense of purpose. This is your baseline personality, the part of you that feels most authentically "you."$$,
  'core identity, purpose, will, authenticity, ego, vitality',
  $$Your sense of self, creative expression, and what makes you feel alive and recognized in the world.$$,
  'Who am I at my core?'
),
(
  'Moon',
  '☽',
  'Personal',
  $$Your Moon sign is your inner emotional world—how you feel, process, and respond when nobody's watching. It's your private self, your instinctive reactions, and where you go for comfort. This is what you need to feel secure.$$,
  'emotions, instinct, nurturing, home, security, subconscious',
  $$Your emotional needs, family patterns, intuition, and the private life you create for yourself away from the public eye.$$,
  'What do I need to feel safe and at peace?'
),
(
  'Mercury',
  '☿',
  'Personal',
  $$Mercury is how you think, communicate, and process information. It's your voice, your curiosity, and the way you move through the world gathering data and making connections. This is your mental style and how you're wired to learn.$$,
  'communication, thinking, curiosity, learning, adaptability, short trips',
  $$How you express yourself, gather information, problem-solve, and connect with others through conversation and writing.$$,
  'How do I think and communicate?'
),
(
  'Venus',
  '♀',
  'Personal',
  $$Venus is what you love, what attracts you, and how you love in return. It's not just romance—it's your values, aesthetic preferences, and what brings you pleasure. This is how you connect with beauty and desire.$$,
  'love, pleasure, values, aesthetics, attraction, harmony, creativity',
  $$Your relationships, how you give and receive affection, your sense of beauty, and what brings you genuine pleasure and satisfaction.$$,
  'What and who do I love? What\'s worth my time and energy?'
),
(
  'Mars',
  '♂',
  'Personal',
  $$Mars is your drive, your assertion, and how you go after what you want. It's your courage, your anger, and your willingness to fight for something that matters. This is your action-oriented energy and competitive edge.$$,
  'drive, action, courage, passion, conflict, sexuality, ambition',
  $$How you assert yourself, pursue your goals, and engage in conflict—your physical energy and the things you're willing to fight for.$$,
  'What do I want, and what will I do to get it?'
),
(
  'Jupiter',
  '♃',
  'Social',
  $$Jupiter is your expansion—your luck, your generosity, and your ability to find meaning. It's where you're naturally gifted and where abundance flows to you. This is your optimism and your potential for growth beyond current limits.$$,
  'expansion, luck, generosity, wisdom, growth, optimism, abundance',
  $$Your personal growth, sense of meaning and purpose in the bigger picture, luck and opportunity, and what brings you genuine fulfillment.$$,
  'What brings me genuine fulfillment and growth?'
),
(
  'Saturn',
  '♄',
  'Social',
  $$Saturn is your structure, your accountability, and your hard-earned wisdom. It shows where you're tested, where discipline matters, and where real growth happens through effort. This is maturity and long-term responsibility.$$,
  'structure, discipline, limitation, maturity, responsibility, boundaries, time',
  $$Where you need to build real competence and integrity, how you approach long-term commitments, and what requires your patience and focus.$$,
  'What do I need to master? Where do I need to commit?'
),
(
  'Uranus',
  '♅',
  'Transpersonal',
  $$Uranus is your awakening—where you break free from convention and discover what's authentically yours. It's sudden insight, rebellion against limiting structures, and your unique genius. This is where you're meant to be a pioneer.$$,
  'innovation, awakening, rebellion, genius, freedom, disruption, revolution',
  $$How you innovate and think outside existing systems, where you rebel against convention, and how you contribute something uniquely your own to the world.$$,
  'Where am I meant to be different and liberate myself?'
),
(
  'Neptune',
  '♆',
  'Transpersonal',
  $$Neptune is your imagination, your intuition, and your connection to something larger than yourself. It's mysticism, spirituality, and the dissolution of boundaries—both beautiful and confusing. This is where you dissolve into unity.$$,
  'spirituality, intuition, dreams, imagination, compassion, dissolution, transcendence',
  $$Your spiritual path, creative imagination, compassion for others, and where you're called to surrender control and trust something beyond the material.$$,
  'What calls me to transcend myself and connect spiritually?'
),
(
  'Pluto',
  '♇',
  'Transpersonal',
  $$Pluto is transformation through crisis—where you die and are reborn, often painfully. It's your power, your shadow, and your capacity for deep psychological change. This is where you access your most profound strength.$$,
  'transformation, power, shadow, death and rebirth, intensity, psychology, regeneration',
  $$Where you face your deepest fears and power, how you transform through difficult experiences, and what demands your psychological honesty and courage.$$,
  'What am I being asked to transform within myself?'
);
