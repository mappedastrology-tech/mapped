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

/* ─── Places are a branch, not a door to somewhere else ─── */

test("places is a group in the constellation, like partner and family", () => {
  // It was a single fixed dot wired straight to the astrocartography screen —
  // one door, not a branch. A place you lived for six years belongs on the map
  // on the same footing as a person.
  const src = sky();
  assert.match(src, /const PLACES_GROUP = "places"/);
  assert.match(src, /GROUP_ORDER = \["circle", "origin", "friend", PLACES_GROUP\]/);
  assert.match(src, /\[PLACES_GROUP\]: \{ label: "Places"/);
});

test("the old hand-placed places dot is gone", () => {
  // Two "Your places" affordances, one of them positioned by hand at a
  // hardcoded y, would drift apart the moment the layout changed.
  const src = strip(sky());
  assert.doesNotMatch(src, /Astrocartography — your places, as a star on the map/);
  assert.doesNotMatch(src, /x2=\{550\} y2=\{682\}/, "the hardcoded branch line is still drawn");
});

test("place stars are told apart from people, and birth from lived", () => {
  // An initial is ambiguous — "L" could be Lisbon or Logan — and on a map of
  // your life those are not the same kind of thing.
  const src = sky();
  assert.match(src, /person\.group === PLACES_GROUP \?/, "places render the same as people");
  assert.match(src, /kind === "born"/, "nothing distinguishes where the chart was cast");
});

test("the Places label opens the world map", () => {
  const src = sky();
  assert.match(src, /c\.group === "origin" \|\| c\.group === PLACES_GROUP/);
  assert.match(src, /onOpenPlaces\(\) : onSelectGroup\("origin"\)/);
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
  assert.match(src, /const R = \(meta\.r \?\? 122\) \+ spread/);
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
