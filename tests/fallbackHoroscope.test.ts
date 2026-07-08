import { test } from "node:test";
import assert from "node:assert/strict";

import { buildFallbackHoroscope } from "@/lib/fallbackHoroscope";

const SKY = {
  moonPhase: "Waxing Gibbous",
  zodiacSeason: "Scorpio",
  seasonElement: "water",
  planetaryDay: "Tuesday",
  planetaryDayPlanet: "Mars",
};

test("same day, different charts → different readings", () => {
  const a = buildFallbackHoroscope(SKY, { sun: "Leo", moon: "Aries", rising: "Gemini" });
  const b = buildFallbackHoroscope(SKY, { sun: "Pisces", moon: "Cancer", rising: "Virgo" });
  assert.notEqual(a.horoscope, b.horoscope, "readings differ by chart");
  assert.ok(a.horoscope.includes("Leo"), "mentions the user's Sun sign");
  assert.ok(b.horoscope.includes("Pisces"));
  // Sun-sign vibe is personalized too.
  assert.notDeepEqual(a.vibes, b.vibes);
});

test("Sun–season relationship changes the copy", () => {
  // Sun in Scorpio while it's Scorpio season = 'your own sign'.
  const own = buildFallbackHoroscope(SKY, { sun: "Scorpio", moon: "Taurus", rising: "Leo" });
  assert.ok(own.horoscope.includes("your own sign of Scorpio"));
  // Sun in Taurus (opposite Scorpio) = opposition framing.
  const opp = buildFallbackHoroscope(SKY, { sun: "Taurus", moon: "Leo", rising: "Aries" });
  assert.ok(opp.horoscope.includes("opposite your Taurus Sun"));
  assert.notEqual(own.horoscope, opp.horoscope);
});

test("degrades to a generic reading when no chart is supplied", () => {
  const generic = buildFallbackHoroscope(SKY);
  assert.ok(generic.horoscope.length > 0);
  assert.ok(generic.headline.length > 0);
  // Generic reading does not name a personal Sun sign relationship.
  assert.ok(!/your .* Sun/.test(generic.horoscope));
});
