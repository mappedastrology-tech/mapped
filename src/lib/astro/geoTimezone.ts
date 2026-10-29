/**
 * Coordinates → the real IANA zone, from geo-tz's boundary polygons.
 *
 * SERVER ONLY. geo-tz reads ~30MB of boundary data from node_modules at
 * runtime, so it can only run in the API routes (the native apps are a static
 * export with no server — they reach this through /api/timezone). Importing it
 * from client code is caught by tests/serverOnlyImports.test.ts.
 *
 * The "all" dataset is used deliberately, not geo-tz's default "1970" one: the
 * 1970 set merges zones that only agree AFTER 1970, so Amsterdam comes back as
 * Europe/Brussels and Reykjavik as Africa/Abidjan — right for today, wrong for
 * anyone born before. Birth charts need the zone the place really kept.
 */

import { find } from "geo-tz/all";

/** The IANA zone at a point, or null for invalid coordinates. */
export function lookupTimezone(lat: number, lng: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  try {
    // A point on a disputed border can match two zones; the first is the
    // polygon geo-tz ranks first. Open ocean comes back as Etc/GMT±N.
    return find(lat, lng)[0] ?? null;
  } catch {
    return null;
  }
}
