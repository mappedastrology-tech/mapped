/**
 * Recognising a person in crisis, before anything is allowed to refuse them.
 *
 * Dolly's system prompt already tells the model to drop the astrology and
 * point at real help. That was never the problem. The problem is everything
 * that answers BEFORE the model is reached:
 *
 *   - the free tier's paywall,
 *   - the 24h paywall cooldown,
 *   - the 30-a-day rate limit,
 *   - the monthly spend ceiling,
 *   - and simply having no network.
 *
 * Each of those refuses without ever sending the message. So someone typing
 * "I don't want to be here any more" could be answered with "You've reached
 * the daily limit for Dolly conversations. Try again tomorrow." — or with an
 * upgrade prompt. That is the worst thing this app could say to anyone, and
 * it was reachable from the ordinary free-tier path.
 *
 * So detection has to happen here, on the device, before any of it:
 *
 *   - No network. It works offline and when the API is down.
 *   - No model call. It works at zero quota and on the free tier.
 *   - No account state. Tier, limits and billing are irrelevant to it.
 *
 * A local matcher is blunter than a model, and that is the correct trade. The
 * two ways to be wrong are not equal: showing a crisis line to someone who was
 * being figurative is a small, brief intrusion they can scroll past, while
 * missing someone who was not is the failure this whole file exists to
 * prevent. It is tuned accordingly — but not so loosely that ordinary
 * astrology talk trips it, because a matcher that cries wolf gets ignored,
 * and an ignored crisis line is the same as no crisis line.
 *
 * This is not a safety system and must not be described as one. It is a
 * signpost that always works, especially when nothing else does.
 */

/**
 * Phrases that signal someone may be at risk.
 *
 * Whole phrases, not keywords. "die", "kill" and "end it" on their own are
 * everywhere in ordinary speech and in astrology writing especially — death,
 * endings, rebirth and Pluto are the vocabulary of the subject. Matching
 * phrases rather than words is what keeps this off "my Scorpio placements are
 * killing me".
 */
const CRISIS_PHRASES: readonly string[] = [
  // Suicidal intent
  "kill myself", "killing myself", "end my life", "ending my life",
  "take my own life", "taking my own life", "end it all",
  "want to die", "wanna die", "want to be dead", "wish i was dead",
  "wish i were dead", "better off dead", "better off without me",
  "don't want to be alive", "dont want to be alive",
  "don't want to live", "dont want to live", "do not want to live",
  "don't want to be here any more", "dont want to be here any more",
  "don't want to be here anymore", "dont want to be here anymore",
  "no reason to live", "nothing to live for", "no point in living",
  "can't go on", "cant go on", "can't keep going", "cant keep going",
  "suicidal", "suicide", "kms",
  // Self-harm
  "hurt myself", "hurting myself", "harm myself", "harming myself",
  "self harm", "self-harm", "cut myself", "cutting myself",
  "overdose", "od on",
  // Being harmed by someone else
  "hurting me", "hits me", "beats me", "abusing me", "being abused",
  "afraid of him", "afraid of her", "afraid of them", "scared to go home",
  "won't let me leave", "wont let me leave",
  // Disordered eating and substance crises, which the same prompt covers
  "starving myself", "make myself throw up", "making myself throw up",
  "purge after", "purging after", "haven't eaten in days", "havent eaten in days",
];

/**
 * Figures of speech that contain the same words and mean nothing of the kind.
 *
 * Checked first. "I'm dying to know what my Saturn return means" is an
 * ordinary thing to ask an astrology app, and answering it with a crisis
 * hotline would be both useless and faintly insulting.
 */
const FIGURES_OF_SPEECH: readonly RegExp[] = [
  /\bdying (?:to|for)\b/,          // dying to know, dying for a coffee
  /\bto die for\b/,
  /\bkill(?:ing)? (?:it|time|for a)\b/,
  /\bkill myself laughing\b/,
  /\bdead (?:tired|serious|set|wrong|right)\b/,
  /\bdrop dead gorgeous\b/,
  /\bdying of (?:laughter|boredom|embarrassment)\b/,
  /\bmy (?:feet|back|head|legs?|arms?) (?:is|are)? ?killing me\b/,
  /\bthis (?:heat|cold|weather|traffic|queue|line) is killing me\b/,
];

/** Normalise so punctuation and spacing can't hide a phrase. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    // Curly apostrophes are what phones actually produce, and "don’t" would
    // otherwise never match "don't".
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Does this message suggest the person may be in crisis?
 *
 * Deliberately cheap and synchronous: it runs on the send path, before any
 * gate, so it cannot be allowed to be slow or to fail.
 */
export function detectCrisis(text: unknown): boolean {
  if (typeof text !== "string" || !text.trim()) return false;
  const t = normalise(text);
  if (FIGURES_OF_SPEECH.some((re) => re.test(t))) return false;
  return CRISIS_PHRASES.some((phrase) => t.includes(phrase));
}

/** One place someone can reach a human. */
export interface CrisisResource {
  /** What it is. */
  label: string;
  /** How to reach it, in plain words. */
  detail: string;
  /** A tel:, sms: or https: link, where one helps. */
  href?: string;
}

/**
 * Where to send someone.
 *
 * 988 and 741741 are US numbers, and most of Mapped's readers are in the US,
 * but not all of them — so the list says so rather than presenting a US number
 * as though it were universal, and carries an international directory. Being
 * vague about which country a number works in is its own kind of failure.
 */
export const CRISIS_RESOURCES: readonly CrisisResource[] = [
  {
    label: "988 Suicide & Crisis Lifeline",
    detail: "US — call or text 988, any time of day.",
    href: "tel:988",
  },
  {
    label: "Crisis Text Line",
    detail: "US — text HOME to 741741.",
    href: "sms:741741",
  },
  {
    label: "Find a helpline",
    detail: "Outside the US — findahelpline.com lists free services by country.",
    href: "https://findahelpline.com",
  },
];

/**
 * What Dolly says when this fires.
 *
 * Not in her usual voice, and deliberately not astrological: the one thing the
 * model is told never to do here is explain it through a chart, so the
 * offline version must not either. Short, plain, and it does not diagnose,
 * promise or instruct — it says she noticed, that it matters, and where a
 * person is.
 */
export const CRISIS_MESSAGE =
  "I want to stop and say something properly. What you've written sounds heavy, and it's more than I'm able to help with — I'm not a person, and this isn't something to work through with astrology. Please talk to someone who can actually be there with you. If you're in immediate danger, contact your local emergency services.";

/** For the screen-reader live region, which cannot read a card's layout. */
export function crisisAnnouncement(): string {
  return `${CRISIS_MESSAGE} ${CRISIS_RESOURCES.map((r) => `${r.label}: ${r.detail}`).join(" ")}`;
}
