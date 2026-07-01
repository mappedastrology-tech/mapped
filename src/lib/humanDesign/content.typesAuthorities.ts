/**
 * Human Design TYPES + AUTHORITIES content.
 *
 * The five Types describe how your energy meets the world — the shape of your
 * aura and the mechanics of how you're built to engage. The seven Authorities
 * describe where your reliable "yes" and "no" actually live in the body.
 *
 * VOICE: warm, literate, empowering, grounded. Second person. No hedging.
 */

import type { TypeContent, AuthorityContent } from "./content.types";

export const TYPE_CONTENT: Record<string, TypeContent> = {
  Manifestor: {
    type: "Manifestor",
    description:
      "You are here to initiate — to start things that would not exist without you. Your aura is closed and repelling, which is not a flaw but a design; it protects the raw impact you carry. You feel the urge to act arrive from somewhere deep and unarguable, and when you follow it, movement ripples out around you.",
    strategyDetail:
      "Inform before you act. Not to ask permission, but to soften your impact on the people your movement will touch. A quick word before you begin dissolves the resistance your closed aura naturally provokes, and leaves you free to move without being managed.",
    signatureDetail:
      "Peace. When you initiate freely and inform as you go, the friction that used to surround you quiets, and you settle into an unbothered, spacious calm.",
    notSelfDetail:
      "Anger. When you're controlled, interrupted, or forced to explain yourself endlessly, anger rises. It's the signal that your urge to initiate is being fenced in.",
    application:
      "Each day, notice the first thing you genuinely want to start — then tell one affected person before you begin. Practice acting without waiting for approval, and protect real time to rest, since your energy comes in bursts, not steady streams.",
  },
  Generator: {
    type: "Generator",
    description:
      "You are the life force — built to work, build, and master the things that light you up. Your aura is open and enveloping, drawing life toward you so you can respond to it. When you're engaged in work you love, you carry a deep, renewable energy that others feel and want to be near.",
    strategyDetail:
      "Wait to respond. Life brings you people, questions, and opportunities to react to, and your body answers before your mind does. Let something show up and feel for the gut lift toward it, rather than mentally deciding what you should chase and pushing to make it happen.",
    signatureDetail:
      "Satisfaction. When you spend your energy responding to what truly moves you, you end the day used up in the best way — content, fulfilled, and quietly proud.",
    notSelfDetail:
      "Frustration. When you commit to things your gut never said yes to, frustration builds. It's telling you you're forcing an opening instead of waiting for a real one.",
    application:
      "Stop initiating from your head. Let opportunities come and check for the gut response before you agree. Only commit your energy where you feel the lift, and give yourself permission to exhaust your body doing work that genuinely absorbs you.",
  },
  "Manifesting Generator": {
    type: "Manifesting Generator",
    description:
      "You are a Generator with a Manifestor's speed woven in — built to respond, then move fast, skip steps, and do several things at once. Your aura is open and enveloping, and your gift is efficiency: finding the shortcut, multitasking with ease, and course-correcting on the fly toward what truly lights you up.",
    strategyDetail:
      "Wait to respond, then inform. First feel the gut lift toward something, exactly as a Generator does. Then, because you move quickly and skip ahead, tell the people around you before you launch — so your speed carries them along rather than leaving them behind.",
    signatureDetail:
      "Satisfaction. When you respond to what excites you and let yourself move at your natural pace, you feel a deep, energized fulfillment that many varied things brought together.",
    notSelfDetail:
      "Frustration, often edged with anger. When you commit without a real gut yes, or force yourself to go slow and single-track, both signals rise to redirect you.",
    application:
      "Trust your gut yes, then move fast and inform as you go. Let yourself juggle several passions at once instead of forcing a single lane. Expect to revisit steps you skipped — that's not failure, it's how you find the most efficient path.",
  },
  Projector: {
    type: "Projector",
    description:
      "You are here to guide — to see deeply into people, systems, and how energy is actually being used. Your aura is focused and penetrating, reading others one at a time with startling clarity. You aren't built to out-work anyone; you're built to be the one whose insight makes the whole thing run better.",
    strategyDetail:
      "Wait for the invitation and for recognition. Let people see your gift and ask for it, rather than pushing your wisdom onto those who haven't opened to it. The right invitations — into relationships, work, and roles — arrive when your value is genuinely seen, and those are the ones worth your energy.",
    signatureDetail:
      "Success. When your guidance is recognized and welcomed, and you're invited into the right rooms, life opens with an ease that feels almost improbable.",
    notSelfDetail:
      "Bitterness. When you give unsolicited advice, overwork to prove your worth, or go unrecognized, bitterness sets in. It's telling you you're spending yourself where you weren't invited.",
    application:
      "Study what genuinely fascinates you and become deeply skilled at it, so your gift is undeniable. Wait for real invitations into the big things, rest far more than a Generator, and let recognition — not effort — be the thing you trust.",
  },
  Reflector: {
    type: "Reflector",
    description:
      "You are the rarest design — a mirror for the world around you. With all your centers open, you take in the health of your community and reflect it back, feeling exactly how a place or group is doing. You are wise, sampling every quality of human nature without being fixed as any one of them.",
    strategyDetail:
      "Wait a lunar cycle before major decisions. Because you're so open, you need time to move through the moon's full arc — roughly twenty-eight days — talking it through with trusted people, letting the decision reveal itself as your changing readings settle into clarity.",
    signatureDetail:
      "Surprise. When you live in alignment, you meet the world with delight and wonder — genuinely surprised and enchanted by what unfolds around you.",
    notSelfDetail:
      "Disappointment. When you rush decisions or absorb an unhealthy environment as if it were yours, disappointment settles in. It's telling you where you are, or who you're with, isn't right.",
    application:
      "Guard your environment fiercely — the right place and people are everything for you. Take a full lunar cycle with big choices, and talk them out with a few trusted voices. Give yourself daily space to discharge what you've absorbed and return to yourself.",
  },
};

export const AUTHORITY_CONTENT: Record<string, AuthorityContent> = {
  emotional: {
    id: "emotional",
    name: "Emotional — Solar Plexus",
    description:
      "Your defined Solar Plexus makes emotion your inner authority. You experience feeling as a wave that rises and falls over time, and truth arrives not in any single moment but across the arc of that wave. There is no such thing as clarity in the instant for you.",
    howToDecide:
      "Wait out the wave. Never decide at the peak of excitement or the pit of doubt — sleep on it, feel the same choice across highs and lows and neutral stretches. When the emotion has settled and the answer holds steady, that's your truth.",
  },
  sacral: {
    id: "sacral",
    name: "Sacral",
    description:
      "Your defined Sacral is a powerful, responsive life-force center, and it speaks in the moment through the body. It knows instantly what has energy for you and what doesn't — a gut response that fires before the mind has a chance to reason or negotiate.",
    howToDecide:
      "Trust the gut sound. A rising \"uh-huh\" means yes, energy is available; a sinking \"uh-uh\" means no. Ask yourself yes-or-no questions and feel the body's immediate answer — it's honest even when your mind wants to argue.",
  },
  splenic: {
    id: "splenic",
    name: "Splenic",
    description:
      "Your defined Spleen is your oldest survival intelligence — the instinct that keeps you safe, healthy, and in the right place at the right time. It speaks softly, once, in the present moment, as a quiet knowing rather than a loud or repeating voice.",
    howToDecide:
      "Follow the quiet in-the-moment hit. Your spleen whispers only once and doesn't repeat itself, so learn to catch it and act. If you hesitate and ask again, you'll hear your mind, not your instinct — trust the first spontaneous knowing.",
  },
  ego: {
    id: "ego",
    name: "Ego / Heart",
    description:
      "Your Ego, or Heart, authority runs on willpower and genuine desire. This center governs what you truly want and whether you have the heart to commit to it. Your truth is found in what you're willing to put your will behind — and what you honestly want for yourself.",
    howToDecide:
      "Listen for real want. Ask plainly: do I actually want this, and do I have the heart for it? Notice the words that fly out when you speak spontaneously — they reveal your true desire. If the will isn't there, it's a no.",
  },
  selfProjected: {
    id: "selfProjected",
    name: "Self-Projected",
    description:
      "Your authority runs through the G Center — your sense of identity, direction, and love. Truth for you lives in your own voice, because as you speak, the direction that's right for you and your life becomes audible in a way it never is while thinking silently.",
    howToDecide:
      "Talk it out, then listen to yourself. Speak the decision aloud to a trusted person who simply lets you process — don't ask their opinion. Hear which words carry aliveness and rightness for your identity. Your own voice tells you the way.",
  },
  mental: {
    id: "mental",
    name: "Mental / None (Sounding board)",
    description:
      "You have no inner bodily authority — an open, mentally-oriented design that decides best out loud, in dialogue. Your clarity doesn't live inside your body; it emerges in the exchange between you and the right environment, reflected back as you think through things in conversation.",
    howToDecide:
      "Use trusted sounding boards. Talk decisions through with a few people who know you and hold space without steering you. You're not seeking their advice — you're hearing your own mind clarify in the open, and noticing which environments feel true.",
  },
  lunar: {
    id: "lunar",
    name: "Lunar (Reflector)",
    description:
      "As a Reflector, your authority is lunar — it moves at the pace of the moon. With every center open, you have no fixed inner compass, so clarity comes not from within a single moment but from time itself carrying you through a full cycle of changing perspectives.",
    howToDecide:
      "Wait roughly twenty-eight days for big decisions. Let the moon complete its cycle while you talk the choice over with trusted people and feel it from every angle. When the same clarity keeps returning across the whole month, you've found your truth.",
  },
};
