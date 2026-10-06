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
