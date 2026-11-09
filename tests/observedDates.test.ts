/**
 * The almanac's religious and cultural festivals that can't be computed
 * (Hindu tithi festivals, Islamic expected dates, Losar) come from the
 * hand-maintained OBSERVED_DATES table in src/lib/celestialCalendar.ts, and a
 * year that isn't in the table shows none of them. This test makes the yearly
 * upkeep impossible to forget: from 1 October of year Y it fails until year
 * Y+1 has been added.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { observedDateYears, observedDateIdsFor } from "../src/lib/celestialCalendar";

/** True when `now` is on or after 1 October of its year, which is when next year's dates become due. */
function nextYearDue(now: Date): number | null {
  return now.getMonth() >= 9 ? now.getFullYear() + 1 : null;
}

const HOW_TO = (year: number) => `
OBSERVED_DATES in src/lib/celestialCalendar.ts has no entries for ${year}, so from
1 January ${year} the almanac will show no Maha Shivaratri, Holi, Navratri, Guru
Purnima, Diwali, Ramadan, Eid or Losar.

Add a ${year} entry to each festival, citing its source in a comment:
  - Hindu festivals: drikpanchang.com for New Delhi — add
    ?year=${year}&geoname-id=1261481 to each page listed in the comment above
    OBSERVED_DATES (Drik localises to your city otherwise).
  - Ramadan / Eid al-Fitr / Eid al-Adha: the Umm al-Qura expected date —
    new Intl.DateTimeFormat("en-u-ca-islamic-umalqura") gives 1 Ramadan,
    1 Shawwal and 10 Dhu al-Hijjah — cross-checked against a published notice.
  - Losar: the Tibetan Phugpa calendar (Men-Tsee-Khang, or the Tibetan Nuns
    Project's yearly holidays post at tnp.org).
If a date can't be verified, leave that one festival out (it stays hidden)
rather than guess. The full procedure is in the comment above OBSERVED_DATES.`;

test("OBSERVED_DATES has next year's festivals once October arrives", () => {
  const due = nextYearDue(new Date());
  if (due == null) return;
  assert.ok(observedDateYears().includes(due), HOW_TO(due));
});

test("the October rule itself", () => {
  assert.equal(nextYearDue(new Date(2027, 8, 30, 23, 59)), null);
  assert.equal(nextYearDue(new Date(2027, 9, 1, 0, 0)), 2028);
  assert.equal(nextYearDue(new Date(2027, 11, 31)), 2028);
  assert.equal(nextYearDue(new Date(2028, 0, 1)), null);
});

test("2027 has every festival, verified", () => {
  assert.deepEqual(observedDateIdsFor(2027).sort(), observedDateIdsFor(2026).sort());
});
