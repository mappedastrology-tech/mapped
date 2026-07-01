/**
 * Human Design CENTERS + LINES content.
 *
 * The nine centers are the energy hubs of the bodygraph, each tied to a
 * biological correlate. A DEFINED center runs a fixed, reliable current you can
 * count on. An OPEN center is not a lack — it is where you take in, amplify, and
 * ultimately grow wise about a force you are not built to hold constantly. Each
 * open center also carries a "not-self" trap: the way conditioning pushes you to
 * pretend the borrowed energy is your own.
 *
 * The six lines are the archetypal ways of being that color every gate and shape
 * your profile — the tone your energy takes as it moves through the world.
 */

import type { CenterContent, LineContent } from "./content.types";

export const CENTER_CONTENT: Record<string, CenterContent> = {
  head: {
    id: "head",
    name: "Head / Pressure",
    role:
      "The center of mental pressure and inspiration — the source of the questions, wonderings, and doubts that set your mind in motion.",
    defined:
      "Your inspiration runs on a fixed current. You wonder in a consistent way, and the same kinds of questions reliably pressure you to think. This gives a steady mental drive, though the pressure to make sense of things never fully switches off.",
    open:
      "You are a sponge for the questions of the world, which makes you genuinely curious and open-minded. The not-self trap is feeling pressured to answer or resolve questions that were never yours — chasing mental noise that has nothing to do with your life.",
    whenDefinedApp:
      "Trust that inspiration will arrive on its own schedule. You do not have to act on every thought — let ideas pressure you inwardly, and share them only when they are ready.",
    whenOpenApp:
      "Notice which questions are actually yours to answer. Let the rest pass through you unresolved. Your gift is discernment about what deserves thinking, not the compulsion to think about everything.",
  },
  ajna: {
    id: "ajna",
    name: "Ajna",
    role:
      "The center of mental awareness and conceptualization — how the mind processes information, forms opinions, and organizes thought into understanding.",
    defined:
      "You think in a fixed and consistent way. Your mind has a reliable structure — a certainty about how you understand things — which makes you a dependable thinker, though your conclusions can feel more settled than the moment truly warrants.",
    open:
      "Your mind is flexible and can hold many ways of seeing at once, making you a natural learner. The not-self trap is pretending to be certain to feel safe — clinging to fixed opinions when your real gift is staying genuinely open.",
    whenDefinedApp:
      "Offer your consistent perspective freely, but remember your mind is for processing, not deciding. Let your true authority — not your fixed opinions — guide your actual choices.",
    whenOpenApp:
      "Release the need to be certain. It is fine to say you do not know yet. Your flexibility lets you see truth from every angle — treasure that over the comfort of a fixed conclusion.",
  },
  throat: {
    id: "throat",
    name: "Throat",
    role:
      "The center of communication and manifestation — where energy is transformed into speech and action, turning inner impulse into outer expression.",
    defined:
      "You have consistent access to your voice and a reliable way of expressing yourself. Communication comes with a steady quality, and you can speak or act on your own timing — though you may talk simply to release the pressure to speak.",
    open:
      "You can adapt your voice to many styles and speak wisely on behalf of others. The not-self trap is grabbing for attention — talking to be seen, forcing yourself to speak, or acting to prove you matter rather than waiting to be invited.",
    whenDefinedApp:
      "Still let your strategy and authority govern when you speak and act. Consistent access to your voice does not mean every moment is yours to fill — right timing carries your words further.",
    whenOpenApp:
      "Let yourself be invited before you speak, and watch how the right words arrive when the moment is genuinely yours. When you stop forcing it, your voice carries a wisdom that draws people in.",
  },
  g: {
    id: "g",
    name: "G / Identity",
    role:
      "The center of identity, love, and direction — your sense of self and the trajectory that carries you toward the people and places that are yours.",
    defined:
      "You have a fixed sense of who you are and where you are going. Your identity and direction feel stable through changing circumstances, giving you a reliable inner compass — a felt continuity of self that others often find grounding.",
    open:
      "You are a chameleon of identity and direction, able to become many selves across many settings. The not-self trap is searching desperately for who you are and where to go — mistaking a lack of fixed direction for being lost.",
    whenDefinedApp:
      "Trust your inner compass even when life reroutes you. Your direction is reliable — follow it, and let the right environment amplify the identity you already carry.",
    whenOpenApp:
      "Place yourself in the right environments and let identity and direction find you there. You are not meant to force a fixed self — the right place reveals who you are becoming in each season.",
  },
  heart: {
    id: "heart",
    name: "Heart / Ego / Will",
    role:
      "The center of willpower, self-worth, and ego — the drive to make and keep promises, prove yourself, and know your own value.",
    defined:
      "You have consistent access to willpower and a steady sense of your own worth. You can make commitments and follow through, driven by a reliable ego force — though the urge to prove yourself can push you past healthy limits.",
    open:
      "You need nothing to prove and can read the willpower and worth of others clearly. The not-self trap is overcommitting to prove your value — making promises you cannot keep to win approval you never needed to earn.",
    whenDefinedApp:
      "Honor your commitments and let rest cycles balance your drive. Your willpower is real, but pace it — promise only what your strategy and authority truly say yes to.",
    whenOpenApp:
      "Stop trying to prove your worth; it was never in question. Make promises about yourself sparingly and let go of the need to compete. Your value is inherent, not something you have to demonstrate.",
  },
  sacral: {
    id: "sacral",
    name: "Sacral",
    role:
      "The center of life-force, work, and sexuality — the sustainable generative energy that fuels doing, building, and creating over the long haul.",
    defined:
      "You carry a deep, renewable well of life-force energy. When you are engaged in the right work, you can generate and build tirelessly, and your body gives clear gut responses that guide you toward what truly lights you up.",
    open:
      "You take in and amplify the energy around you but do not generate it consistently, making you sensitive to when enough is enough. The not-self trap is not knowing when to stop — pushing past your limits and burning out to keep up.",
    whenDefinedApp:
      "Spend your energy on work that genuinely responds a yes in your gut, and go to bed a little tired so the well empties and refills clean each day.",
    whenOpenApp:
      "Learn when enough is enough and give yourself permission to stop. Remove yourself from draining situations before exhaustion sets in — your wisdom is knowing sustainable energy from borrowed intensity.",
  },
  solarPlexus: {
    id: "solarPlexus",
    name: "Solar Plexus / Emotional",
    role:
      "The center of emotions, feelings, and moods — the wave of emotional experience that moves through you over time, coloring how you meet the world.",
    defined:
      "You move through an emotional wave — highs, lows, and hopes that rise and fall on their own rhythm. This is your authority: clarity comes not in the moment but across the wave, so no truth is fully known in a single feeling.",
    open:
      "You feel emotions deeply because you amplify what others carry, making you empathic and attuned. The not-self trap is avoiding confrontation and truth to keep the peace — absorbing others' moods and mistaking them for your own.",
    whenDefinedApp:
      "Never decide in the heat of a feeling. Sleep on it, ride the wave, and wait for the calm neutrality where your real yes or no becomes clear — there is no truth in the now.",
    whenOpenApp:
      "Notice that the intensity you feel often is not yours. Give the wave room to pass before reacting, and resist smoothing everything over. Your gift is deep emotional wisdom, not the duty to keep everyone comfortable.",
  },
  spleen: {
    id: "spleen",
    name: "Spleen",
    role:
      "The center of intuition, instinct, and survival — the body's immune system and its quiet, in-the-moment awareness of health, fear, and safety.",
    defined:
      "You have a consistent intuition and a steady sense of well-being. Your body speaks in quiet instinctual hits that keep you safe and healthy, and you carry a reliable, grounded presence others instinctively trust.",
    open:
      "You are wise about health, fear, and what keeps people well because you sample it in others. The not-self trap is holding onto things, people, and habits that are bad for you out of fear of letting go and feeling unsafe.",
    whenDefinedApp:
      "Trust the quiet, one-time whisper of your intuition — it speaks softly and only once. Do not wait for it to repeat or argue you into logic; act on the instinct in the moment.",
    whenOpenApp:
      "Let go of what no longer serves you, even when fear says hold on. You do not need to cling to feel safe — your open spleen is meant to grow deeply wise about fear, not ruled by it.",
  },
  root: {
    id: "root",
    name: "Root",
    role:
      "The center of stress, drive, and adrenaline — the pressure to get things done and the pulse that moves you from stillness into action.",
    defined:
      "You carry a consistent way of handling pressure and a steady adrenaline drive. Stress moves through you in a reliable rhythm, giving you the fuel to start things and push through — though you may always feel some pressure to be doing.",
    open:
      "You amplify pressure and can accomplish a great deal under it, but it is not constant for you. The not-self trap is rushing to be free of pressure — hurrying through tasks just to escape the stress rather than acting on real timing.",
    whenDefinedApp:
      "Ride your natural adrenaline rhythm and let pressure fuel you without letting it convince you everything is urgent. Your drive is reliable — you do not have to burn it all at once.",
    whenOpenApp:
      "Slow down. The rush to clear your plate is borrowed pressure, not truth. When you stop hurrying to be free of stress, you discover which deadlines are real and which are illusions.",
  },
};

export const LINE_CONTENT: Record<number, LineContent> = {
  1: {
    line: 1,
    name: "Investigator",
    description:
      "You need a foundation before you can feel secure. You dig, study, and gather knowledge until you truly understand the ground beneath you — depth and thoroughness are how you build real confidence.",
  },
  2: {
    line: 2,
    name: "Hermit",
    description:
      "You carry a natural gift that flows best in solitude, yet the world keeps calling you out to share it. You need alone time to recharge, and recognition finds you when you are simply being yourself.",
  },
  3: {
    line: 3,
    name: "Martyr",
    description:
      "You learn by doing, bumping into life and discovering what works through trial and error. Nothing is a failure — every experiment teaches you what does not work, and that hard-won wisdom becomes your gift to others.",
  },
  4: {
    line: 4,
    name: "Opportunist",
    description:
      "You thrive through relationships and your network. Opportunities come to you through people you know, so trust, friendship, and a solid foundation of connection are the ground on which your whole life moves forward.",
  },
  5: {
    line: 5,
    name: "Heretic",
    description:
      "People project onto you, seeing a savior who can solve their problems. You carry practical, universal solutions the world needs, but your reputation depends on delivering at the right time to the right people.",
  },
  6: {
    line: 6,
    name: "Role Model",
    description:
      "You live in three phases — a trial-and-error youth, a reflective time on the roof observing life, then a return as an embodied example. In time you become the living proof of what you have learned.",
  },
};
