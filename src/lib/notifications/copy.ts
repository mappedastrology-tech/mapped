/**
 * Every line Mapped can send, and the rules the lines have to hold to.
 *
 * Six rules, each derived from something rather than from taste:
 *
 * 1. THE SPECIFIC THING GOES IN THE TITLE. Apple Intelligence and Android 16
 *    both summarise and rank notifications before the person sees them, reading
 *    the opening. Every title here used to be a label — "Mapped", "Full Moon",
 *    "Your chart today" — which spent the only always-visible part of a push on
 *    nothing. Say which planet, which moon, which house.
 * 2. TITLE <= 30 CHARACTERS, BODY <= 110. There is no OS-enforced limit; what
 *    exists is display truncation that varies by device, lock screen, app-name
 *    length and Android skin, so these are the conservative end of the vendor
 *    range (iOS 25-35, Android 40-50). Both are enforced by test against the
 *    longest real substitutions, not against the templates.
 * 3. NO EMOJI. The largest study available (four billion notifications, 2025)
 *    found emoji lift is strongly category-dependent and NEGATIVE in the
 *    closest category to this one. Enforced by test.
 * 4. SPECIFICITY COMES FROM THE CHART, NOT A MERGE TAG. "Hi [name]" is worth
 *    about nine percent. "Mercury's retrograde in your 7th house" is the thing
 *    that actually works.
 * 5. ONE CONCRETE THING, PLAINLY. The best-performing lines in this category
 *    anywhere are three to nine words, imperative, one real action. Borrow the
 *    economy; leave the nihilism.
 * 6. NEVER ILLNESS, DEATH, DOOM, OR URGENCY PRESSURE. People delete astrology
 *    apps over exactly this. "Hurry" and "don't miss" test well in retail and
 *    would poison a daily ritual.
 *
 * Variants are chosen by what is TRUE, never at random. The old library picked
 * with pickRandom, which is how someone could be told "tonight" on the wrong
 * night.
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
    body: "A clean page, if you want one. The next two days are the ones to write on." },
  { category: "new_moon", variant: "plant",
    title: "New moon in [sign]",
    body: "The dark part of the month. Plant something you'll watch grow." },
  // The tradition puts the potent window at the exact moment plus 48 hours,
  // then a second beat about four days later at the waxing sextile — the point
  // at which an intention is supposed to be acted on rather than set.
  { category: "new_moon_act", variant: "default",
    title: "Four days in",
    body: "Whatever you set at the new moon wants one small action today. Just one." },

  { category: "full_moon", variant: "named",
    title: "The [name] Moon",
    body: "Full tonight, in [sign]. Whatever you started at the new moon — this is where you see it." },
  { category: "full_moon", variant: "default",
    title: "Full moon in [sign]",
    body: "Tonight. Whatever you started at the new moon — this is where you see it." },
  { category: "full_moon", variant: "release",
    title: "Full moon in [sign]",
    body: "A good night to put something down." },

  { category: "quarter_moon", variant: "first",
    title: "First quarter",
    body: "Half lit. The point where what you started meets its first real resistance." },
  { category: "quarter_moon", variant: "last",
    title: "Last quarter",
    body: "Half dark. A good few days to clear something out before the next cycle." },

  // Practitioners broadly advise AGAINST initiating under an eclipse, which is
  // the opposite of the new-moon advice — so this must never reuse the
  // "plant something" language.
  { category: "eclipses", variant: "solar",
    title: "Solar eclipse in [sign]",
    body: "Not a day for starting things. Wait 48 hours, then decide." },
  { category: "eclipses", variant: "lunar",
    title: "Lunar eclipse in [sign]",
    body: "The big release. Whatever it takes, it usually needed to go." },
  { category: "eclipses", variant: "saros",
    title: "You've met this one",
    body: "This eclipse family last crossed your chart in [year]. What happened then?" },

  // An eclipse season is 31-37 days of real astronomy, not an invented window.
  { category: "eclipse_season", variant: "default",
    title: "Eclipse season starts",
    body: "Five weeks, [count] eclipses, falling across [axis]." },

  // The station, not the retrograde span, is what the tradition holds to carry
  // weight — a stationary planet is slow, and slowness intensifies. It is also
  // two events per cycle rather than three weeks of nagging.
  { category: "retrograde_stations", variant: "retrograde",
    title: "[planet] stops today",
    body: "It turns retrograde in your [house] house. Read it as: review, don't restart." },
  { category: "retrograde_stations", variant: "direct",
    title: "[planet] moves again",
    body: "It's been retrograde since [month]. What stalled then starts moving." },
  // When the retrograde start can't be established, say the true thing without
  // the date rather than filling the slot with whatever month it is now.
  { category: "retrograde_stations", variant: "direct-undated",
    title: "[planet] moves again",
    body: "It turns direct today. What stalled while it was retrograde starts moving." },

  { category: "retrograde_shadow", variant: "clears",
    title: "Out of the shadow",
    body: "[planet] has cleared the degrees it went back over. That chapter's closed." },

  { category: "mercury_retrograde", variant: "default",
    title: "Mercury turns back",
    body: "Three weeks of it, in your [house] house. Review, don't restart." },

  { category: "major_ingresses", variant: "default",
    title: "[planet] enters [sign]",
    body: "[years] years there. It'll spend them in your [house] house." },

  /* ── Job 02 · your chart ────────────────────────────────────────────── */

  { category: "transit_approaching", variant: "default",
    title: "[planet] is approaching",
    body: "It meets your [natal] in four days. Worth knowing before it lands." },

  { category: "major_transits", variant: "conjunction",
    title: "[planet] meets your [natal]",
    body: "Exact today. A new cycle starts here." },
  { category: "major_transits", variant: "opposition",
    title: "[planet] opposes your [natal]",
    body: "Exact today. A push-pull kind of day — something's asking for balance." },
  { category: "major_transits", variant: "square",
    title: "[planet] squares your [natal]",
    body: "Exact today. Friction you can put to work." },
  { category: "major_transits", variant: "trine",
    title: "[planet] trines your [natal]",
    body: "Exact today. Things flow a little easier here, if you want to use it." },

  { category: "solar_return", variant: "default",
    title: "Your year turns at [time]",
    body: "The Sun is back where it was when you were born. New chart, new twelve months." },
  { category: "birthday_week", variant: "default",
    title: "Your year is turning",
    body: "Your solar return is [days] days out. Worth thinking about what you want from it." },

  /* ── Job 03 · something of yours is waiting ─────────────────────────── */

  // The sharpest thing in the catalogue: the app already holds 150+ journal
  // prompts keyed to specific transits, so this never has to say "time to
  // journal". It names the transit and asks the question written for it.
  // The title is borrowed from the transit copy rather than written again, so
  // "Mars squares your Moon" says the aspect instead of the earlier
  // "[planet]'s on your [natal]", which rendered as "Mars's on your Moon" and
  // implied a conjunction whatever the aspect actually was.
  { category: "journal_checkin", variant: "transit",
    title: "[title]",
    body: "[prompt]" },
  { category: "journal_checkin", variant: "lunation",
    title: "A question for tonight",
    body: "[prompt]" },
  { category: "journal_checkin", variant: "quiet",
    title: "Your journal's quiet",
    body: "No pressure. There's a question waiting whenever you want it." },

  { category: "practice_reminders", variant: "saved",
    title: "Tonight's ritual",
    body: "The one you saved for [occasion]. Two minutes." },

  { category: "learning_reminder", variant: "default",
    title: "Your streak is at [n]",
    body: "A lesson keeps it. No pressure — your progress is saved either way." },

  /* ── Job 04 · nothing is happening ──────────────────────────────────── */

  // The best lines here. A notification that admits nothing is happening is the
  // strongest signal that the rest are worth reading, and it is the thing an app
  // that must find something portentous to say every day structurally cannot do.
  { category: "daily_content", variant: "quiet",
    title: "Nothing much today",
    body: "Quiet skies. No cosmic homework — just catch your breath." },
  { category: "daily_content", variant: "quiet-alt",
    title: "A slow one",
    body: "Nothing in your chart is asking for anything today." },
  { category: "daily_content", variant: "moon-sign",
    title: "Moon's in [sign]",
    body: "[flavour]" },
  { category: "daily_content", variant: "house",
    title: "[planet] in your [house]",
    body: "[flavour]" },

  /* ── Lifecycle ──────────────────────────────────────────────────────── */

  { category: "re_engagement", variant: "first",
    title: "The sky moved",
    body: "A few things changed in your chart while you were away. Here's the short version." },
  { category: "re_engagement", variant: "second",
    title: "Still here",
    body: "Your chart didn't go anywhere. Whenever you're ready." },
  { category: "re_engagement", variant: "last",
    title: "Last one",
    body: "We won't keep checking in. Come back anytime — your data is here." },
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
