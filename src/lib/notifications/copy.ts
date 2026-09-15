/**
 * Every line Mapped can send. All of them are Dolly.
 *
 * THE VOICE IS NOT A NEW ONE. Dolly already exists, and her persona is written
 * down in src/app/api/dolly/route.ts — that file is the source of truth and
 * this one follows it. The notifications had been coming from nobody in
 * particular, which is why they read like an app talking. She is:
 *
 *   - warm, direct, insightful; a wise friend, not a fortune teller
 *   - second person, always
 *   - real talk, not toxic positivity
 *   - conversational, like texting someone who knows you
 *   - funny, a little irreverent, occasionally blunt
 *   - never emoji
 *
 * THE RULE THAT MATTERS MOST is the one her prompt makes explicit: ground every
 * astrological point in real life. Not "your Moon in Scorpio means you feel
 * deeply" but "you probably have a hard time letting things go". The astrology
 * is the frame; their life is the content. Applied here, that is the difference
 * between "It goes backwards through your 7th house" and "conversations you
 * thought were finished aren't" — the first is about astrology, the second is
 * about a Tuesday.
 *
 * SHE CAN SAY "I". That is new, and it is the one place the evidence and the
 * persona agree loudly: a named narrator is what people screenshot, and the
 * largest headline dataset available found first-person SINGULAR strongly
 * positive while first-person plural was the one pronoun with a significant
 * negative effect. So "I left you a question" — never "we".
 *
 * TWO FAILURE MODES THIS WAS WRITTEN OUT OF, both caught by Taylor:
 *
 * HEDGING. The first draft cushioned nearly every line — "if you want one",
 * "worth knowing", "a good night to", "no pressure". Each is a small kindness;
 * thirty-seven of them read as timid. Dolly doesn't hedge. She says the thing.
 *
 * PROCEDURE. "Not a day for starting things. Wait 48 hours, then decide" is a
 * manual, not a person. She still tells you to sit tight — the difference is
 * whether she sounds like she's reading it off a card.
 *
 * Both are enforced by test, because a voice that lives only in a docstring
 * drifts by the third line somebody adds.
 *
 * SIX MECHANICAL RULES, which are not matters of taste:
 *
 * 1. THE SPECIFIC THING GOES IN THE TITLE. Apple Intelligence and Android 16
 *    both summarise and rank notifications before the person sees them, reading
 *    the opening. Say which planet, which moon, which house.
 * 2. TITLE <= 30 CHARACTERS, BODY <= 110. No OS enforces a limit; what exists is
 *    display truncation that varies by device, lock screen, app-name length and
 *    Android skin, so these sit at the conservative end of the vendor range.
 *    Enforced by test against the longest real substitutions.
 * 3. NO EMOJI. The largest study available — four billion notifications, 2025 —
 *    found the effect is category-dependent and NEGATIVE in the nearest category
 *    to this one. Enforced by test.
 * 4. SPECIFICITY COMES FROM THE CHART, NEVER FROM BEHAVIOUR. The line between
 *    personal and creepy is not how specific you are, it is whether the person
 *    can trace how you knew. A birth time they typed in is traceable. "You open
 *    this at 2am a lot" is equally accurate and reads as surveillance.
 * 5. NOTHING SENSITIVE ON THE LOCK SCREEN. Apple's own guidance: you cannot
 *    predict what someone is doing when a notification arrives. Assume a
 *    stranger is reading over their shoulder.
 * 6. NO URGENCY PRESSURE AND NO DOOM. "Hurry" and "don't miss" test well in
 *    retail and would poison a daily ritual. Enforced by test.
 *
 * Variants are chosen by what is TRUE, never at random — the old library picked
 * with pickRandom, which is how someone got told "tonight" on the wrong night.
 */

import type { NotificationCategory } from "./catalogue";

export const MAX_TITLE = 30;
export const MAX_BODY = 110;

export interface CopyTemplate {
  category: NotificationCategory;
  /** Named so the caller can ask for the variant that matches the facts. */
  variant: string;
  title: string;
  body: string;
}

/**
 * The angles written the way an astrologer says them.
 *
 * "Mercury opposes your Midheaven" is 30 characters and crowds the line;
 * "Mercury opposes your MC" is 23 and is also what people actually call it.
 */
export const SHORT_POINT: Record<string, string> = {
  Midheaven: "MC",
  Imum_Coeli: "IC",
  Ascendant: "Rising",
  Descendant: "Descendant",
  "North Node": "North Node",
  "South Node": "South Node",
};

export function shortPoint(name: string): string {
  return SHORT_POINT[name] ?? name;
}

/** Substitute [slot] placeholders. Unfilled slots are an error, not a blank. */
export function renderCopy(
  t: CopyTemplate,
  slots: Record<string, string | number> = {},
): { title: string; body: string } {
  const fill = (s: string) =>
    s.replace(/\[(\w+)\]/g, (whole, key: string) => {
      const v = slots[key];
      if (v === undefined || v === null || v === "") {
        throw new Error(`notification copy "${t.category}/${t.variant}" has no value for [${key}]`);
      }
      return String(v);
    });
  return { title: fill(t.title), body: fill(t.body) };
}

export const COPY: CopyTemplate[] = [
  /* ── Job 01 · the sky ───────────────────────────────────────────────── */

  { category: "new_moon", variant: "default",
    title: "New moon in [sign]",
    body: "Blank slate tonight. The thing you keep not starting — start it this week." },
  { category: "new_moon", variant: "plant",
    title: "New moon in [sign]",
    body: "Dark sky. You don't have to have it figured out. You just have to pick something." },
  // The tradition puts the potent window at the exact moment plus 48 hours, then
  // a second beat around four days later at the waxing sextile: the point where
  // an intention is supposed to be acted on rather than set.
  { category: "new_moon_act", variant: "default",
    title: "Four days in",
    body: "You decided something at the new moon. Today it wants one piece of evidence." },

  { category: "full_moon", variant: "named",
    title: "The [name] Moon",
    body: "Full in [sign] tonight. Whatever's been quietly building for two weeks gets obvious." },
  { category: "full_moon", variant: "default",
    title: "Full moon in [sign]",
    body: "Tonight. If something's been simmering, this is where it surfaces." },
  { category: "full_moon", variant: "release",
    title: "Full moon in [sign]",
    body: "Good night to stop carrying something. You know which thing." },

  { category: "quarter_moon", variant: "first",
    title: "First quarter",
    body: "Half lit. This is where what you started gets hard and you find out if you meant it." },
  { category: "quarter_moon", variant: "last",
    title: "Last quarter",
    body: "Half dark. Clear something out — you'll want the room in a week." },

  // Practitioners advise AGAINST initiating under an eclipse, which is the
  // opposite of the new-moon advice — so this must never reuse that language.
  { category: "eclipses", variant: "solar",
    title: "Solar eclipse in [sign]",
    body: "Everything will feel like it needs deciding today. It doesn't. Give it two days." },
  { category: "eclipses", variant: "lunar",
    title: "Lunar eclipse in [sign]",
    body: "Something's ending. You've probably known for a while." },
  { category: "eclipses", variant: "saros",
    title: "You've met this one",
    body: "Same eclipse family as [year]. Whatever was going on for you then, it rhymes." },

  // An eclipse season is 31-37 days of real astronomy, not an invented window.
  { category: "eclipse_season", variant: "default",
    title: "Eclipse season starts",
    body: "Five weeks, [count] eclipses, both on your [axis] axis. Things move fast now." },

  // The station, not the retrograde span, is what the tradition holds to carry
  // weight — a stationary planet is slow, and slowness intensifies. It is also
  // two moments a cycle rather than three weeks of nagging.
  { category: "retrograde_stations", variant: "retrograde",
    title: "[planet] stops today",
    body: "Backwards through your [house] house now. Old ground, and you'll be walking it again." },
  { category: "retrograde_stations", variant: "direct",
    title: "[planet] moves again",
    body: "Something's felt stuck since [month]. That's why. It just turned around." },
  { category: "retrograde_stations", variant: "direct-undated",
    title: "[planet] moves again",
    body: "Whatever's felt stuck for weeks isn't anymore. You should feel it within the week." },

  { category: "retrograde_shadow", variant: "clears",
    title: "Out of the shadow",
    body: "[planet]'s done with the ground it covered twice. You can stop bracing." },

  { category: "mercury_retrograde", variant: "default",
    title: "Mercury turns back",
    body: "Three weeks, your [house] house. Conversations you thought were finished aren't." },

  { category: "major_ingresses", variant: "default",
    title: "[planet] enters [sign]",
    body: "[years] years, all of it in your [house] house. That's a long chapter." },

  /* ── Job 02 · your chart ────────────────────────────────────────────── */

  { category: "transit_approaching", variant: "default",
    title: "[planet] is approaching",
    body: "Exact on your [natal] in four days. Telling you now so it's not a surprise." },

  { category: "major_transits", variant: "conjunction",
    title: "[planet] meets your [natal]",
    body: "Exact today. Something's beginning here. You'll recognise it later." },
  { category: "major_transits", variant: "opposition",
    title: "[planet] opposes your [natal]",
    body: "Exact today. Two parts of your life want opposite things. Both have a point." },
  { category: "major_transits", variant: "square",
    title: "[planet] squares your [natal]",
    body: "Exact today. Friction — the useful kind, if you don't spend it arguing." },
  { category: "major_transits", variant: "trine",
    title: "[planet] trines your [natal]",
    body: "Exact today. Things open up around now. Ask for something." },

  { category: "solar_return", variant: "default",
    title: "Your year turns at [time]",
    body: "Your Sun is back where it started. This is your actual new year. January's arbitrary." },
  { category: "birthday_week", variant: "default",
    title: "Your year is turning",
    body: "[days] days to your solar return. Good time to decide what this one's for." },

  /* ── Job 03 · something of yours is waiting ─────────────────────────── */

  // She speaks as herself here, and only here — this is the one job where
  // something is being handed over rather than reported. The question itself
  // stays behind the tap; see rule 5.
  { category: "journal_checkin", variant: "transit",
    title: "[title]",
    body: "I left you a question about this one." },
  { category: "journal_checkin", variant: "lunation",
    title: "A question for tonight",
    body: "I left one in your journal. It's about the new moon." },
  { category: "journal_checkin", variant: "quiet",
    title: "Your journal's quiet",
    body: "Been a minute. I saved you a question for when you're ready." },

  { category: "practice_reminders", variant: "saved",
    title: "Tonight's ritual",
    body: "The [occasion] one you saved. Two minutes and you're done." },

  { category: "learning_reminder", variant: "default",
    title: "Your streak is at [n]",
    body: "One lesson holds it. Skip it if you need to — nothing's lost either way." },

  /* ── Job 04 · nothing is happening ──────────────────────────────────── */

  // An app that finds something portentous to say every single day is one you
  // stop believing. Saying nothing is happening, on the days nothing is, is
  // what makes the rest of it land.
  { category: "daily_content", variant: "quiet",
    title: "Nothing much today",
    body: "Quiet chart. Take the afternoon." },
  { category: "daily_content", variant: "quiet-alt",
    title: "A slow one",
    body: "Nothing's asking anything of you today. That counts as good news." },
  { category: "daily_content", variant: "moon-sign",
    title: "Moon's in [sign]",
    body: "[flavour]" },
  { category: "daily_content", variant: "house",
    title: "[planet] in your [house]",
    body: "[flavour]" },

  /* ── Lifecycle ──────────────────────────────────────────────────────── */

  { category: "re_engagement", variant: "first",
    title: "The sky moved",
    body: "Your chart's been busy while you were gone. Want the short version?" },
  { category: "re_engagement", variant: "second",
    title: "Still here",
    body: "Your chart didn't go anywhere. Neither did I." },
  { category: "re_engagement", variant: "last",
    title: "Last one",
    body: "I'll stop after this. It's all still here whenever you come back." },
];

/** The copy for one category and variant. Throws rather than sending nothing. */
export function copyFor(category: NotificationCategory, variant: string): CopyTemplate {
  const t = COPY.find((c) => c.category === category && c.variant === variant);
  if (!t) throw new Error(`no notification copy for ${category}/${variant}`);
  return t;
}

export function variantsFor(category: NotificationCategory): CopyTemplate[] {
  return COPY.filter((c) => c.category === category);
}
