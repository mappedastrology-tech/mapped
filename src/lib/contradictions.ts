/**
 * Contradiction detection — finds placements that say opposite things
 * and generates Dolly-voiced "asterisk warnings" about how they interact.
 *
 * The tone is nuanced and real: "You're not a hypocrite — you're complex."
 */

import { SIGN_FULL } from "./knowledge";

interface Planet {
  name: string;
  sign: string;
  house: string | null;
  retrograde: boolean;
}

export interface Contradiction {
  planet1: string;
  sign1: string;
  planet2: string;
  sign2: string;
  theme: string;     // Short label: "Jealousy vs. Freedom"
  summary: string;   // Dolly-voiced explanation
}

// Sign traits that can conflict
const SIGN_TRAITS: Record<string, string[]> = {
  Ari: ["independent", "impulsive", "direct", "competitive", "impatient"],
  Tau: ["stable", "possessive", "patient", "sensual", "stubborn"],
  Gem: ["curious", "scattered", "communicative", "restless", "adaptable"],
  Can: ["nurturing", "clingy", "emotional", "protective", "moody"],
  Leo: ["confident", "dramatic", "generous", "attention-seeking", "proud"],
  Vir: ["analytical", "critical", "practical", "perfectionist", "reserved"],
  Lib: ["diplomatic", "indecisive", "partnership-oriented", "people-pleasing", "harmonious"],
  Sco: ["intense", "jealous", "secretive", "controlling", "loyal", "possessive", "all-or-nothing"],
  Sag: ["free-spirited", "blunt", "optimistic", "noncommittal", "adventurous", "independent"],
  Cap: ["disciplined", "serious", "ambitious", "emotionally-guarded", "patient"],
  Aqu: ["detached", "unconventional", "independent", "cerebral", "freedom-loving"],
  Pis: ["empathic", "escapist", "dreamy", "boundary-less", "intuitive"],
};

// Known contradictions between sign energies
interface ConflictRule {
  signs: [string, string];   // Sign abbreviations that conflict
  theme: string;
  getWarning: (p1: string, s1Full: string, p2: string, s2Full: string) => string;
}

const CONFLICT_RULES: ConflictRule[] = [
  // Jealousy vs Freedom
  {
    signs: ["Sco", "Sag"],
    theme: "Intensity vs. Freedom",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} wants total loyalty, control, and emotional depth. Your ${p2} in ${s2} wants freedom, adventure, and no strings attached. You're not a hypocrite — you're someone who needs both depth AND space. The tension is real: you can feel suffocated by the very closeness you crave. The people who get you are the ones who can be deeply committed without being possessive about it — and you need to offer that same thing back.`,
  },
  {
    signs: ["Sco", "Aqu"],
    theme: "Control vs. Detachment",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} wants emotional merger and intensity. Your ${p2} in ${s2} needs space and intellectual distance. Part of you wants to consume and be consumed; another part of you steps back to observe from a safe distance. This isn't emotional confusion — it's emotional range. You're capable of both deep intimacy and radical independence. The key is knowing which mode you're in and not punishing people for needing the other one.`,
  },
  {
    signs: ["Sco", "Gem"],
    theme: "Depth vs. Lightness",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} wants to go deep — into people, emotions, truth. Your ${p2} in ${s2} wants to keep things light, curious, and moving. You can feel torn between wanting to know everything about someone and not wanting to sit in heavy emotions. Neither side is wrong. You need both — the ability to probe deeply AND the ability to come up for air.`,
  },
  // Stability vs Freedom
  {
    signs: ["Tau", "Sag"],
    theme: "Security vs. Adventure",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} wants routine, comfort, and stability. Your ${p2} in ${s2} wants new experiences and expansion. You feel this as a constant pull between building something solid and blowing it up to start fresh. Neither impulse is wrong. You need a home base that's secure enough to launch from — and adventures that always bring you back.`,
  },
  {
    signs: ["Tau", "Aqu"],
    theme: "Tradition vs. Revolution",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} loves the familiar and resists change. Your ${p2} in ${s2} is restless and wants to break the mold. You value stability but get bored by it. You want innovation but crave comfort. The resolution: build a life that's structurally stable but internally experimental.`,
  },
  // Emotion vs Logic
  {
    signs: ["Can", "Aqu"],
    theme: "Heart vs. Head",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} feels everything personally and needs emotional safety. Your ${p2} in ${s2} processes life intellectually and needs space. You can seem cold when you're actually overwhelmed with feeling, or overly emotional when you're trying to think clearly. The people close to you need to know that both modes are real.`,
  },
  {
    signs: ["Can", "Cap"],
    theme: "Softness vs. Structure",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} needs nurturing and emotional warmth. Your ${p2} in ${s2} demands discipline and emotional restraint. Part of you wants to be held; another part thinks needing comfort is weakness. This is one of the most important tensions in your chart. The growth is learning that being strong and being soft aren't opposites.`,
  },
  // Independence vs Partnership
  {
    signs: ["Ari", "Lib"],
    theme: "Self vs. Others",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} needs to go first, be independent, and lead. Your ${p2} in ${s2} needs harmony, partnership, and compromise. You want to do your own thing but also want everyone to be happy with you. This tension makes you a natural leader who actually cares about people — when you stop trying to be both simultaneously and learn to alternate.`,
  },
  // Perfectionism vs Chaos
  {
    signs: ["Vir", "Pis"],
    theme: "Order vs. Surrender",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} wants everything precise, analyzed, and organized. Your ${p2} in ${s2} wants to dissolve boundaries, dream, and let go. You oscillate between hyper-control and total surrender. Neither extreme works alone. The integration is learning when to plan and when to trust the current.`,
  },
  {
    signs: ["Vir", "Sag"],
    theme: "Details vs. Big Picture",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} obsesses over details and wants perfection. Your ${p2} in ${s2} sees the grand vision and can't be bothered with specifics. You have big dreams but also high standards — which means you either execute perfectly or not at all. The growth is letting "good enough" exist on the way to great.`,
  },
  // Control vs Surrender
  {
    signs: ["Sco", "Pis"],
    theme: "Control vs. Surrender",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} wants to control, investigate, and hold power. Your ${p2} in ${s2} wants to dissolve, merge, and let go. Part of you grips tighter; another part wants to release everything. Both are valid ways of processing intensity. The wisdom is knowing when to hold on and when to let the current carry you.`,
  },
  // Serious vs Playful
  {
    signs: ["Cap", "Leo"],
    theme: "Discipline vs. Expression",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} is serious, strategic, and image-conscious in a controlled way. Your ${p2} in ${s2} wants to shine, perform, and be celebrated. You want to be respected AND adored — and sometimes those require completely different behavior. The resolution is finding a stage that rewards both your discipline and your warmth.`,
  },
  {
    signs: ["Cap", "Sag"],
    theme: "Caution vs. Risk",
    getWarning: (p1, s1, p2, s2) =>
      `Your ${p1} in ${s1} plans carefully and respects limits. Your ${p2} in ${s2} takes risks and hates restriction. You feel the brakes and the gas pedal at the same time. This actually makes you better at both — you take calculated risks instead of reckless ones, and your discipline has vision behind it.`,
  },
];

/** Detect contradictions across all planets in a chart */
export function detectContradictions(planets: Planet[]): Contradiction[] {
  const found: Contradiction[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      if (p1.sign === p2.sign) continue; // Same sign = no contradiction

      for (const rule of CONFLICT_RULES) {
        const [s1, s2] = rule.signs;
        const key = `${rule.theme}-${[p1.sign, p2.sign].sort().join("-")}`;

        if (seen.has(key)) continue;

        if (
          (p1.sign === s1 && p2.sign === s2) ||
          (p1.sign === s2 && p2.sign === s1)
        ) {
          const first = p1.sign === s1 ? p1 : p2;
          const second = p1.sign === s1 ? p2 : p1;

          seen.add(key);
          found.push({
            planet1: first.name,
            sign1: first.sign,
            planet2: second.name,
            sign2: second.sign,
            theme: rule.theme,
            summary: rule.getWarning(
              first.name,
              SIGN_FULL[first.sign] || first.sign,
              second.name,
              SIGN_FULL[second.sign] || second.sign
            ),
          });
        }
      }
    }
  }

  return found;
}

/** Detect stelliums (3+ planets in the same sign) */
export interface Stellium {
  sign: string;
  planets: string[];
  summary: string;
}

const STELLIUM_DESCRIPTIONS: Record<string, { meaning: string; lived: string }> = {
  Ari: {
    meaning: "This much fire in one place makes you a force of nature. You lead with instinct, move fast, and have an almost compulsive need to be first. People either get swept up in your energy or get out of the way.",
    lived: "You thrive in environments that reward initiative and independent action. When life feels slow, you get destructive — always have a challenge in front of you. Physical movement is non-negotiable for your mental health.",
  },
  Tau: {
    meaning: "This much earth energy makes you immovable once you've decided. Your relationship with comfort, beauty, and security isn't casual — it's foundational. You build slowly but what you build lasts.",
    lived: "Financial security matters more to you than to most people — honor that instead of judging it. Your senses are heightened; invest in quality food, textures, spaces. Stubbornness is your superpower when aimed at the right things.",
  },
  Gem: {
    meaning: "This much air energy makes your mind the center of everything. You're processing, connecting, and communicating constantly — your brain literally never stops. People find you fascinating and sometimes exhausting.",
    lived: "You need variety like you need oxygen — monotony will make you physically anxious. Write things down or you'll lose brilliant ideas in the chaos. Multiple projects at once isn't scattered for you — it's how you function.",
  },
  Can: {
    meaning: "This much water energy makes you deeply feeling, fiercely protective, and profoundly tied to home and family. Your emotional life isn't a side note — it IS the main story.",
    lived: "Create a home that feels like a sanctuary — you literally can't function without one. Your intuition about people is almost psychic; trust it more. Set boundaries around your emotional energy or you'll burn out caring for everyone else.",
  },
  Leo: {
    meaning: "This much fire makes you impossible to ignore. Creativity, warmth, and self-expression aren't hobbies — they're survival mechanisms. You were born to be seen and celebrated, and there's nothing wrong with that.",
    lived: "Find a stage — literally or metaphorically. You need an audience for your gifts to reach full power. Relationships where you're dimming yourself will make you physically ill. Generosity is your love language; let it flow.",
  },
  Vir: {
    meaning: "This much earth energy makes you extraordinarily competent, observant, and service-oriented. You notice what everyone else misses and you can't rest until things are right.",
    lived: "Your perfectionism is an asset at work but a weapon against yourself — learn the difference. Health and routines aren't boring to you, they're grounding. You show love by fixing things; make sure your people know that.",
  },
  Lib: {
    meaning: "This much air energy makes you deeply relational, aesthetically driven, and oriented toward fairness in everything. You experience life through connection — solitude doesn't recharge you, partnership does.",
    lived: "Stop apologizing for needing people — it's your design, not a flaw. Your environment affects your mood more than most; curate it intentionally. When you can't decide, it's usually because you're weighing other people's needs above your own.",
  },
  Sco: {
    meaning: "This much water energy gives you a depth and intensity that most people can't touch. Nothing about you is surface-level — you feel everything deeply, you see through everyone, and you never forget.",
    lived: "You need emotional truth in every relationship or you'll sabotage it. Jealousy and control are your shadow side — acknowledge them instead of pretending they don't exist. Channel your intensity into creative or transformative work or it'll eat you alive.",
  },
  Sag: {
    meaning: "This much fire makes you restless, philosophical, and perpetually aimed at the horizon. Freedom isn't a preference — it's a requirement. You're here to explore, learn, and expand beyond every boundary.",
    lived: "Always have a trip, a course, or a big idea in progress — stagnation is your kryptonite. You tell hard truths that others avoid; learn diplomacy so the message actually lands. Commitment works for you when it comes with room to grow.",
  },
  Cap: {
    meaning: "This much earth energy makes you ambitious, disciplined, and built for the long climb. You take life seriously — not because you're joyless, but because you understand that real things take real work.",
    lived: "Set the 10-year goal and reverse-engineer it. You respect yourself most when you're building something substantial. Let yourself rest without calling it laziness — your productivity is already above average even on slow days.",
  },
  Aqu: {
    meaning: "This much air energy makes you intellectually independent, community-oriented, and genuinely different from the people around you. You think in systems and futures while everyone else is stuck in the present.",
    lived: "Find your people — the weirdos, the visionaries, the ones who get you. Your ideas need a community to take root. Emotional detachment isn't strength; practice being present with feelings even when it's uncomfortable.",
  },
  Pis: {
    meaning: "This much water energy makes you extraordinarily empathic, creative, and spiritually attuned. You absorb the emotional atmosphere of every room you enter, and your inner world is vast.",
    lived: "Boundaries aren't optional — they're the only thing between you and complete emotional overwhelm. Creative expression is medicine for you, not a luxury. You need more alone time than you probably allow yourself.",
  },
};

export function detectStelliums(planets: Planet[]): Stellium[] {
  const signGroups: Record<string, string[]> = {};

  for (const p of planets) {
    if (!signGroups[p.sign]) signGroups[p.sign] = [];
    signGroups[p.sign].push(p.name);
  }

  const stelliums: Stellium[] = [];

  for (const [sign, names] of Object.entries(signGroups)) {
    if (names.length >= 3) {
      const description = STELLIUM_DESCRIPTIONS[sign];
      const planetList = names.join(", ");
      const summary = description
        ? `${planetList}. ${description.meaning} ${description.lived}`
        : `You have a stellium with ${planetList} all in ${sign}. That's a massive concentration of energy in one sign.`;

      stelliums.push({
        sign,
        planets: names,
        summary,
      });
    }
  }

  return stelliums;
}
