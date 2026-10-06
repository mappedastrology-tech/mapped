import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The Maps tab — the constellation.
 *
 * The shape it is meant to be: you at the centre, branching out to partner,
 * family, friends and the places you have lived, with a search that appears
 * only once there is more sky than you can read at a glance.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const sky = () => read("src/app/(tabs)/maps/NightSky.tsx");

/* ─── Your places is one star, and one door ─── */

test("places is not a group — the branches are for people", () => {
  // I built it as a fourth branch with a star per city. That is not what the
  // map is: the constellation is the people in your orbit, and places is the
  // single door out of it to the astrocartography map.
  const src = sky();
  assert.doesNotMatch(src, /PLACES_GROUP/, "places is a cluster again");
  assert.match(src, /GROUP_ORDER = \["circle", "origin", "friend"\]/);
  assert.doesNotMatch(src, /SkyPlace/, "the per-place type is back");
});

test("one Your places star, below You, that opens the map", () => {
  const src = sky();
  assert.match(src, /aria-label="Your places — open your astrocartography map"/);
  assert.match(src, /onClick=\{tap\(onOpenPlaces\)\}/);
  // Exactly one — two would drift apart the moment the layout changed.
  assert.equal((src.match(/>Your places</g) ?? []).length, 1);
});

test("the places star moves out as the people clusters grow", () => {
  // It sits straight below You at a fixed offset, so a deep Origin Family
  // used to land on top of it.
  const src = sky();
  assert.match(src, /const placesY = 132 \+ spread/);
  assert.match(src, /top: placesY/);
  // And the sky has to zoom to hold it, or it falls off the bottom edge.
  assert.match(src, /Math\.abs\(n\.y\)\), placesY\)/);
});

/* ─── The search earns its place by waiting ─── */

test("no search until the sky is actually crowded", () => {
  // Three stars do not need a search field, and one sitting there would be
  // furniture on top of the thing it is meant to help you look at.
  const src = sky();
  assert.match(src, /export const CROWDED_AT = \d+/);
  assert.match(src, /const crowded = nodes\.length > CROWDED_AT/);
  assert.match(src, /\{crowded && \(/, "the field is not gated on crowding");
});

test("searching moves the map rather than skipping to the reading", () => {
  // Jumping into the reading answers the question but teaches you nothing
  // about where the star sits, so next time you search again.
  const src = sky();
  assert.match(src, /const focusNode = /);
  assert.match(src, /onClick=\{\(\) => \{ focusNode\(n\); setQuery\(""\); \}\}/);
});

test("the search result count is announced", () => {
  const src = sky();
  assert.match(src, /aria-live="polite"/);
  assert.match(src, /htmlFor="sky-search"/, "the field has no label");
});

/* ─── A constellation that still reads when it fills up ─── */

test("branches push out as groups get deeper", () => {
  // Members stack three to a row, so a group of ten is four rows deep. At a
  // fixed radius those rows grew straight into the next group.
  const src = sky();
  assert.match(src, /const deepestRows = /);
  assert.match(src, /const R = 122 \+ spread/);
});

test("the sky zooms itself to fit what is in it", () => {
  // Spreading the branches keeps stars off each other but means a full map no
  // longer fits the screen at 1:1 — people arrived to a sky cropped at every
  // edge with their places off the bottom.
  const src = sky();
  assert.match(src, /const fitScale = /);
  assert.match(src, /Math\.min\(r\.width \/ 2 \/ maxX, r\.height \/ 2 \/ maxY\)/, "fit is not measured per axis");
  assert.match(src, /recenter = [\s\S]{0,120}fitScale\(\)/, "recenter still snaps to 1:1");
});

/* ─── Never invent somebody's relationships ─── */

test("desktop Maps shows an empty sky, not eight invented people", () => {
  // It fell back to a sample cast when the user had nobody on their map, so a
  // new account met "Maya — Partner", "Rosa — Mother", "Jonah — Brother", each
  // with a written synastry reading, laid out as its own constellation.
  const src = read("src/components/web/WebMaps.tsx");
  assert.doesNotMatch(strip(src), /SAMPLE_PEOPLE/, "the invented cast is back");
  assert.doesNotMatch(strip(src), /Maya|Priya|Jonah|Rosa|Nadia/, "invented people are still in the file");
  assert.match(src, /live\?\.people \?\? \[\]/);
  assert.match(src, /Your sky is still empty/, "there is no empty state");
});

/* ─── A link sent to a phone opens the app, not the website ─── */

test("a phone browser lands on the begin screen", () => {
  // Nearly every link to Mapped is opened on a phone, and what landed was the
  // desktop marketing site squeezed into 390px — a seven-item nav bar, a hero,
  // a pricing table — with "create a chart" several screens down behind it.
  const src = read("src/app/page.tsx");
  assert.match(src, /function onAPhone\(\)/);
  assert.match(src, /isInstalledApp\(\) \|\| onAPhone\(\)/);
  assert.match(src, /max-width: 1023px/, "the breakpoint does not match the app's desktop line");
  // Both branches — the happy path and the Supabase-unreachable catch.
  const hits = src.match(/isInstalledApp\(\) \|\| onAPhone\(\)/g) ?? [];
  assert.equal(hits.length, 2, "one of the two signed-out paths still shows the website");
});

/* ─── Typable fields must not make iOS zoom the page ─── */

test("no typable field is under 16px", () => {
  // Safari zooms the whole page in when a field under 16px takes focus, and
  // leaves it zoomed — which is what "I tap a spread and have to pinch back
  // out to see the page" is. Five fields were under it: the tarot question,
  // the journal entry, the ritual search, the almanac water search and the
  // promo code.
  const files: [string, RegExp[]][] = [
    ["src/app/(tabs)/tarot/TarotPageContent.tsx", [/fontSize: 16, lineHeight: 1\.5/]],
    ["src/app/(tabs)/journal/JournalClient.tsx", [/minHeight: 180, fontSize: 16/]],
    ["src/app/(tabs)/learn/RitualPageContent.tsx", [/rounded-2xl text-base/]],
    ["src/app/(tabs)/almanac/AlmanacPageContent.tsx", [/rounded-lg px-3 py-2 text-base/]],
    ["src/app/account/page.tsx", [/tracking-wider font-mono/]],
  ];
  for (const [file, patterns] of files) {
    const src = read(file);
    for (const re of patterns) assert.match(src, re, `${file} lost its 16px floor`);
  }
  // And the ones that were explicitly small must not come back.
  assert.doesNotMatch(read("src/app/(tabs)/learn/RitualPageContent.tsx"), /rounded-2xl text-\[13px\]/);
  assert.doesNotMatch(read("src/app/(tabs)/almanac/AlmanacPageContent.tsx"), /px-3 py-2 text-\[13px\]/);
});

/* ─── Chrome that does not disappear mid-lesson ─── */

test("every /library screen gets the app's top and bottom bars", () => {
  // The top bar was rendered by Library Home and the reference screen only, so
  // a course, a lesson and the final test each dropped it — you tapped into a
  // lesson and the app's own header vanished.
  const layout = read("src/app/library/layout.tsx");
  assert.match(layout, /<TopBar \/>/);
  assert.match(layout, /<BottomNav \/>/);
  // And the two pages that used to render their own must not double up.
  for (const f of ["src/app/library/reference/page.tsx", "src/components/learn/LibraryHome.tsx"]) {
    assert.doesNotMatch(read(f), /<TopBar \/>/, `${f} renders a second top bar`);
  }
});

/* ─── A sheet you can push away ─── */

test("the home reading sheets can be swiped down", () => {
  // They drew the grab handle every bottom sheet wears and listened to
  // nothing: the only ways out were a 10px "collapse" link and the backdrop.
  const src = read("src/app/(tabs)/home/page.tsx");
  assert.match(src, /useSheetDismiss/);
  assert.equal((src.match(/\{\.\.\.sheetSwipe\.handlers\}/g) ?? []).length, 2, "one of the two sheets is not swipeable");
});

test("a twitch does not throw the reading away", () => {
  // Velocity alone fires on a 25px wobble while somebody steadies their thumb.
  const src = read("src/lib/useSheetDismiss.ts");
  assert.match(src, /const FLICK_MIN = \d+/);
  assert.match(src, /travelled > DISTANCE \|\| \(travelled > FLICK_MIN && speed > VELOCITY\)/);
  // And a drag must not start mid-scroll, or it steals scrolling up.
  assert.match(src, /node\.scrollTop > 0\) return/);
});

/* ─── Rituals: a category is a place, and you can make your own ─── */

test("an intention tile opens its own screen", () => {
  // It set a filter on a list far below the fold, so from where the thumb
  // was, the tap did nothing.
  const src = read("src/app/(tabs)/learn/RitualPageContent.tsx");
  assert.match(src, /const \[browsingCategory, setBrowsingCategory\] = useState\(false\)/);
  assert.match(src, /if \(browsingCategory\) \{/);
  assert.match(src, /aria-label="Back to rituals"/);
  // The list is shared, not duplicated.
  assert.match(src, /const ritualResults = \(/);
  assert.equal((src.match(/\{ritualResults\}/g) ?? []).length, 2);
});

test("the ritual wizard is reachable, and renders as a dialog", () => {
  // RitualWizard existed and nothing in the app rendered it. It also lays
  // itself out as a flow element, so dropped in plain it appeared below the
  // whole page.
  const src = read("src/app/(tabs)/learn/RitualPageContent.tsx");
  assert.match(src, /import RitualWizard from "@\/components\/RitualWizard"/);
  assert.match(src, /Create your own/);
  assert.match(src, /showWizard && \(/);
  assert.match(src, /fixed inset-0 z-50 flex flex-col overflow-y-auto/);
  assert.doesNotMatch(strip(src), />\s*Something else\s*</, "the unlabelled link is back");
});

/* ─── The Dolly composer ─── */

test("the composer's focus ring follows the pill, not the field", () => {
  // Text fields match :focus-visible on every focus, including a tap. The
  // global ring is a square, the composer is a stadium, so focusing it drew a
  // hard rectangle through the middle of a round pill — and it grew with the
  // message.
  const css = read("src/app/globals.css");
  assert.match(css, /\.dl-composer:focus-within \{/);
  assert.match(css, /\.dl-composer :focus-visible \{\s*outline: none;/);
  // The global ring itself must survive — it is the keyboard indicator.
  assert.match(css, /:focus-visible \{\s*outline: 2px solid var\(--brass\)/);
  assert.match(read("src/app/(tabs)/dolly/page.tsx"), /className="dl-composer /);
});

test("the composer resizes from its value, not from typing", () => {
  // onInput never fires when the value is set in code, so sending a long
  // message left an empty box standing at its full height.
  const src = read("src/app/(tabs)/dolly/page.tsx");
  assert.doesNotMatch(src, /onInput=\{\(e\) => \{/, "still resizing from the input event");
  assert.match(src, /\}, \[input\]\);/);
  assert.match(src, /composerRef\.current\.style\.borderRadius/);
});

/* ─── Chart insights: the same words, in paragraphs ─── */

test("a long reading is broken up; a short one is left alone", async () => {
  // The interpretations arrive as one long string — six or seven sentences
  // with nothing between them — and were rendered as a single block. Ten
  // cards deep that is a wall. This changes where the breaks go and not one
  // word of the copy.
  const { toParagraphs } = await import("../src/components/ChartInsightsPanel");

  const short = "Moon is in the sign that Jupiter rules. They are in each other's home.";
  assert.deepEqual(toParagraphs(short), [short], "a two-sentence reading should stay whole");

  const long = "One sentence here. Two sentences here. Three sentences here. Four sentences here. Five sentences here. Six sentences here.";
  const out = toParagraphs(long);
  assert.ok(out.length > 1, "a six-sentence reading should break");
  assert.equal(out.join(" ").replace(/\s+/g, " "), long, "breaking must not change a word");
});

test("breaks the copy already carries are honoured", () => {
  // Some readings are authored with their own paragraphs; re-flowing those
  // would override a decision somebody made on purpose.
  return import("../src/components/ChartInsightsPanel").then(({ toParagraphs }) => {
    assert.deepEqual(toParagraphs("First para.\n\nSecond para."), ["First para.", "Second para."]);
  });
});

test("a lone trailing sentence is folded back", () => {
  // Pairs leave an orphan when the count is odd, and a one-line paragraph at
  // the end of a reading looks like an afterthought rather than a conclusion.
  return import("../src/components/ChartInsightsPanel").then(({ toParagraphs }) => {
    const five = "Alpha one. Beta two. Gamma three. Delta four. Epsilon five.";
    const out = toParagraphs(five);
    assert.ok(!/^Epsilon five\.$/.test(out[out.length - 1]), "the orphan was left standing alone");
  });
});
