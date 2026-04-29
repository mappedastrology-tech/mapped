-- Seed data for kb_aspects table
-- Inserts the 5 major astrological aspects

INSERT INTO kb_aspects (name, symbol, degrees, orb, nature, summary, keywords) VALUES
(
  'conjunction',
  '☌',
  0,
  8,
  'neutral',
  $$When two planets meet at the same degree, their energies merge into one force. You're dealing with an amplified expression of both planets' themes—intensity is the baseline. Whether this works for you depends entirely on which planets are involved.$$,
  'merger,fusion,intensified,combined,unified,activated,direct,raw'
),
(
  'sextile',
  '⚹',
  60,
  6,
  'harmonious',
  $$A 60-degree angle creates an easy flow between two planetary energies. Opportunities arrive without drama, and you can tap into both planets' strengths without fighting against yourself. This is where potential converts to action with less friction.$$,
  'supportive,flowing,opportunity,ease,creative,natural talent,assistance'
),
(
  'square',
  '□',
  90,
  7,
  'challenging',
  $$A 90-degree angle creates tension between two planets that forces you to engage, adjust, and build something real. You can't ignore a square—it demands maturity and problem-solving. This friction, though uncomfortable, is where actual growth happens.$$,
  'friction,tension,challenge,effort,obstacle,drive,ambition,conflict,growth'
),
(
  'trine',
  '△',
  120,
  8,
  'harmonious',
  $$A 120-degree angle is the universe's green light—the planets work as if they were designed to do so. Talents come naturally, situations develop smoothly, and success feels effortless. You have built-in support for expressing these energies.$$,
  'harmony,ease,talent,grace,luck,flow,support,natural ability,blessing'
),
(
  'opposition',
  '☍',
  180,
  8,
  'challenging',
  $$Two planets directly across from each other create a pull toward balance or a dramatic push-pull dynamic. You experience competing needs, external pressure, or constant negotiation between two sides. Oppositions demand integration—you can't choose one planet over the other forever.$$,
  'polarity,opposition,awareness,projection,balance,tension,integration,external pressure'
);
