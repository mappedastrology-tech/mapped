/**
 * Concept tooltips — plain-language "what is this?" explanations for each part
 * of a Human Design chart. Shown on the info (ⓘ) buttons throughout the tab.
 */

export const HD_CONCEPTS: Record<string, string> = {
  overview:
    "Human Design blends astrology, the I Ching, the chakra system, and physics into one map — the BodyGraph. It's calculated from your birth date, exact time, and place, and describes how your energy is designed to work.",
  type:
    "Your Type is the big-picture category of your energy — Manifestor, Generator, Manifesting Generator, Projector, or Reflector. It's decided by which centers are defined and how they connect, and it sets your Strategy for moving through life.",
  strategy:
    "Your Strategy is the single most practical instruction in your chart — the way your Type is designed to engage with life so things flow with less resistance (for example, Generators are built to respond rather than initiate).",
  authority:
    "Your Authority is your body's reliable way of making correct decisions — not the mind's pros-and-cons, but a deeper signal (emotional clarity, gut response, spleen's intuition, and so on). It tells you HOW to decide.",
  signature:
    "Your Signature is the feeling you get when you're living in alignment with your design — satisfaction, peace, success, or surprise. It's the green light that you're on track.",
  notSelf:
    "The Not-Self theme is the feeling that shows up when you're working against your design — frustration, anger, bitterness, or disappointment. It's a helpful signal, not a flaw: it tells you to return to your Strategy and Authority.",
  profile:
    "Your Profile is a pair of numbers (like 1/3 or 4/6) drawn from the lines of your conscious and unconscious Sun. It describes the costume your personality wears — how you learn, connect, and move through the world.",
  line:
    "Each gate is divided into six lines, and each line is an archetype — Investigator, Hermit, Martyr, Opportunist, Heretic, Role Model. The lines of your two Suns form your Profile.",
  definition:
    "Definition describes how your defined centers link together. Single Definition means everything is connected; Split means there are two separate groups, and so on. It speaks to how self-contained versus bridging your energy is.",
  center:
    "The nine Centers are the hubs of the BodyGraph. A DEFINED (colored) center is a consistent, reliable part of who you are. An OPEN (white) center is where you're flexible, absorb others, and — over time — grow wise.",
  channel:
    "Channels are the wires between two centers, each formed by two gates. When you have BOTH gates of a channel activated, that channel is defined — a fixed talent or theme wired into you, and it's what colors in the centers it connects.",
  gate:
    "Gates are the 64 individual themes of the BodyGraph, drawn from the 64 hexagrams of the I Ching. Each planet in your chart activates a gate, giving you a specific gift or lens. Your activated gates are the raw vocabulary of your design.",
  incarnationCross:
    "Your Incarnation Cross is the overarching theme or life purpose of your chart, formed by the four gates of your conscious and unconscious Sun and Earth. It's the backdrop your whole life plays out against.",
  variables:
    "The four Variables (the arrows at the top of the chart) are an advanced layer describing how you best take in food, environment, motivation, and perspective. Left arrows point to a focused/active mode, right arrows to a receptive/open one.",
  personalityDesign:
    "Every chart is calculated twice. The Personality (conscious, black) is your birth moment — the you that you're aware of. The Design (unconscious, red) is ~88 days before birth — the body and traits you live out without noticing.",
  aura:
    "Each Type carries a distinct aura — the energetic field around you that others feel before a word is spoken. It's why the same advice lands differently for a Projector than a Generator.",
};

export function getHdConcept(key: string): string {
  return HD_CONCEPTS[key] ?? "";
}
