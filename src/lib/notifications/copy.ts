/**
 * Every line Mapped can send.
 *
 * THE VOICE. Someone you actually know, who happens to know this stuff, telling
 * you a thing. Not a practitioner, not a manual, not a wellness brand. She says
 * what's happening and one true thing about it, and then she stops, because she
 * assumes you can take it from there.
 *
 * The failure mode this was rewritten out of is HEDGING. The first draft was
 * full of "if you want one", "worth knowing", "worth thinking about", "a good
 * night to", "whenever you want it", "no pressure" — every one of them a little
 * cushion placed under the sentence in case it landed too hard. Stacked up they
 * don't read as gentle, they read as timid, and nobody talks to their friends
 * that way. Say the thing. They can decide what to do with it.
 *
 * The other failure mode is PROCEDURE. "Not a day for starting things. Wait 48
 * hours, then decide" is a manual, not a person. A friend still tells you to sit
 * tight — the difference isn't whether she gives you advice, it's whether she
 * sounds like she's reading it off a card.
 *
 * So: no hedges, no numbered steps, no explaining the astrology, no "consider",
 * no "may want to". Second sentence is an aside, not an instruction. Dry is
 * allowed. Mean is not — the point is warmth with a spine, and an app that finds
 * something ominous to say every day is one people delete.
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
    body: "The month starts over tonight. Nobody's watching what you do with it." },
  { category: "new_moon", variant: "plant",
    title: "New moon in [sign]",
    body: "Nothing in the sky tonight. Good — you've been needing a blank one." },
  // The tradition puts the potent window at the exact moment plus 48 hours, then
  // a second beat around four days later at the waxing sextile: the point where
  // an intention is supposed to be acted on rather than set.
  { category: "new_moon_act", variant: "default",
    title: "Four days in",
    body: "You told yourself something at the new moon. Today's when it wants proof." },

  { category: "full_moon", variant: "named",
    title: "The [name] Moon",
    body: "Full in [sign] tonight. This is where you find out what the last two weeks were about." },
  { category: "full_moon", variant: "default",
    title: "Full moon in [sign]",
    body: "Tonight. Whatever's been building since the new moon just came due." },
  { category: "full_moon", variant: "release",
    title: "Full moon in [sign]",
    body: "Classic night for putting something down. Your call what." },

  { category: "quarter_moon", variant: "first",
    title: "First quarter",
    body: "Half lit. This is the part where it gets annoying and you keep going anyway." },
  { category: "quarter_moon", variant: "last",
    title: "Last quarter",
    body: "Half dark. The clearing-out part. Nobody enjoys it." },

  // Practitioners advise AGAINST initiating under an eclipse, which is the
  // opposite of the new-moon advice — so this must never reuse that language.
  { category: "eclipses", variant: "solar",
    title: "Solar eclipse in [sign]",
    body: "Everything will feel like it can't wait today. Most of it can." },
  { category: "eclipses", variant: "lunar",
    title: "Lunar eclipse in [sign]",
    body: "Something ends around now. You'll probably be relieved." },
  { category: "eclipses", variant: "saros",
    title: "You've met this one",
    body: "Same eclipse family as [year]. Think about where you were then." },

  // An eclipse season is 31-37 days of real astronomy, not an invented window.
  { category: "eclipse_season", variant: "default",
    title: "Eclipse season starts",
    body: "Five weeks, [count] eclipses, both across [axis]. It's a lot. It always is." },

  // The station, not the retrograde span, is what the tradition holds to carry
  // weight — a stationary planet is slow, and slowness intensifies. It is also
  // two moments a cycle rather than three weeks of nagging.
  { category: "retrograde_stations", variant: "retrograde",
    title: "[planet] stops today",
    body: "Going backwards through your [house] house now. You know how this one goes." },
  { category: "retrograde_stations", variant: "direct",
    title: "[planet] moves again",
    body: "Retrograde since [month]. Whatever stalled then is about to come unstuck." },
  { category: "retrograde_stations", variant: "direct-undated",
    title: "[planet] moves again",
    body: "It's been going backwards a while. That's over as of today." },

  { category: "retrograde_shadow", variant: "clears",
    title: "Out of the shadow",
    body: "[planet]'s finally past the ground it covered twice. You can stop bracing." },

  { category: "mercury_retrograde", variant: "default",
    title: "Mercury turns back",
    body: "Three weeks, your [house] house. Yes, back your things up." },

  { category: "major_ingresses", variant: "default",
    title: "[planet] enters [sign]",
    body: "[years] years there, all of it in your [house] house. Long game." },

  /* ── Job 02 · your chart ────────────────────────────────────────────── */

  { category: "transit_approaching", variant: "default",
    title: "[planet] is approaching",
    body: "Hits your [natal] in four days. Just so it's not a surprise." },

  { category: "major_transits", variant: "conjunction",
    title: "[planet] meets your [natal]",
    body: "Exact today. Something starts here whether you clock it or not." },
  { category: "major_transits", variant: "opposition",
    title: "[planet] opposes your [natal]",
    body: "Exact today. Two things want opposite things from you." },
  { category: "major_transits", variant: "square",
    title: "[planet] squares your [natal]",
    body: "Exact today. The friction kind — use it or it uses you." },
  { category: "major_transits", variant: "trine",
    title: "[planet] trines your [natal]",
    body: "Exact today. This is the easy one. Don't waste it." },

  { category: "solar_return", variant: "default",
    title: "Your year turns at [time]",
    body: "Sun's back where it was when you were born. That's your new year, not January." },
  { category: "birthday_week", variant: "default",
    title: "Your year is turning",
    body: "[days] days to your solar return. Start deciding what you want out of it." },

  /* ── Job 03 · something of yours is waiting ─────────────────────────── */

  // The question stays behind the tap. The prompts are good because they are
  // intimate, which is exactly what makes them wrong for a screen anyone
  // standing nearby can read — see rule 5.
  { category: "journal_checkin", variant: "transit",
    title: "[title]",
    body: "There's a question waiting on this one." },
  { category: "journal_checkin", variant: "lunation",
    title: "A question for tonight",
    body: "The new moon left you one. It's in your journal." },
  { category: "journal_checkin", variant: "quiet",
    title: "Your journal's quiet",
    body: "Been a minute. There's a question with your name on it." },

  { category: "practice_reminders", variant: "saved",
    title: "Tonight's ritual",
    body: "The [occasion] one you saved. Two minutes." },

  { category: "learning_reminder", variant: "default",
    title: "Your streak is at [n]",
    body: "One lesson keeps it. Or don't — it's all saved either way." },

  /* ── Job 04 · nothing is happening ──────────────────────────────────── */

  // The best lines here. An app that finds something portentous to say every
  // single day is one you stop believing; saying nothing is happening, on the
  // days nothing is, is what makes the rest of it land.
  { category: "daily_content", variant: "quiet",
    title: "Nothing much today",
    body: "Quiet skies. No homework." },
  { category: "daily_content", variant: "quiet-alt",
    title: "A slow one",
    body: "Your chart isn't asking for anything today. Enjoy it." },
  { category: "daily_content", variant: "moon-sign",
    title: "Moon's in [sign]",
    body: "[flavour]" },
  { category: "daily_content", variant: "house",
    title: "[planet] in your [house]",
    body: "[flavour]" },

  /* ── Lifecycle ──────────────────────────────────────────────────────── */

  { category: "re_engagement", variant: "first",
    title: "The sky moved",
    body: "A few things shifted in your chart while you were gone. Want the short version?" },
  { category: "re_engagement", variant: "second",
    title: "Still here",
    body: "Your chart didn't go anywhere." },
  // No "we" — Apple's style guidance says avoid it, and the largest headline
  // dataset found first-person plural was the one pronoun with a significant
  // negative effect.
  { category: "re_engagement", variant: "last",
    title: "Last one",
    body: "No more check-ins after this. It's all still here if you come back." },
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
