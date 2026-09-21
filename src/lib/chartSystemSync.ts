/**
 * Keeping the user's zodiac setting and their stored charts in agreement.
 *
 * The setting lives on `profiles` (zodiac_system, ayanamsa, house_system,
 * node_type). Every chart row describes the system its positions were
 * calculated in, and everything downstream (home horoscope, Dolly, transits,
 * pushes, maps) reads the chart row. So when the setting changes we
 * RECALCULATE and RE-SAVE the user's own chart and their connections in the
 * new system — otherwise the preference would be a label nothing obeys.
 *
 * Runs in the browser with the signed-in user's session: RLS limits every
 * read and write here to the user's own rows. It needs the birth data to
 * recalculate, which it reads only from those rows.
 *
 * house_system / node_type / ascendant arrive with migration
 * 20260921_vedic_chart_system.sql. Until that is applied the writes below
 * retry without them, so the zodiac switch still works everywhere.
 */

import { supabase } from "./supabase";
import { calculateChart } from "./astro/calculateChart";
import { chartCalcParams, type ChartSystem } from "./astro/vedic/system";

interface PgError { code?: string; message?: string }

/** PostgREST's "that column isn't in the schema" errors (update/insert vs select). */
export function isMissingColumnError(err: PgError | null | undefined): boolean {
  if (!err) return false;
  return err.code === "PGRST204" || err.code === "42703" || /column .* does not exist|schema cache/i.test(err.message || "");
}

/**
 * Run a write with the optional (post-migration) columns; if the database
 * doesn't have them yet, run it again without them.
 */
export async function writeWithOptionalColumns(
  run: (payload: Record<string, unknown>) => PromiseLike<{ error: PgError | null }>,
  required: Record<string, unknown>,
  optional: Record<string, unknown>,
): Promise<PgError | null> {
  const first = await run({ ...required, ...optional });
  if (!first.error) return null;
  if (!isMissingColumnError(first.error)) return first.error;
  const second = await run(required);
  return second.error;
}

/** Columns every chart save writes for the system (the first two predate the migration). */
export function systemColumns(sys: ChartSystem) {
  return {
    required: { zodiac_system: sys.zodiacSystem, ayanamsa: sys.ayanamsa },
    optional: { house_system: sys.houseSystem, node_type: sys.nodeType },
  };
}

/** Read the saved preference. Missing optional columns just mean "defaults". */
export async function loadChartSystemPreference(userId: string): Promise<Partial<Record<"zodiac_system" | "ayanamsa" | "house_system" | "node_type", string | null>>> {
  const out: Partial<Record<"zodiac_system" | "ayanamsa" | "house_system" | "node_type", string | null>> = {};
  const { data } = await supabase.from("profiles").select("zodiac_system, ayanamsa").eq("id", userId).maybeSingle();
  if (data) Object.assign(out, data);
  const { data: extra, error } = await supabase.from("profiles").select("house_system, node_type").eq("id", userId).maybeSingle();
  if (extra && !error) Object.assign(out, extra);
  return out;
}

/** Save the preference on the profile (used by Account, onboarding and new-chart). */
export async function saveChartSystemPreference(userId: string, sys: ChartSystem): Promise<PgError | null> {
  const { required, optional } = systemColumns(sys);
  return writeWithOptionalColumns(
    (payload) => supabase.from("profiles").update(payload).eq("id", userId),
    required, optional,
  );
}

interface BirthRow {
  id: string;
  name?: string | null;
  birth_date?: string | null;
  birth_time?: string | null;
  unknown_time?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  city_name?: string | null;
  synastry?: Record<string, unknown> | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recalc(row: BirthRow, sys: ChartSystem): any | null {
  if (!row.birth_date || row.latitude == null || row.longitude == null) return null;
  try {
    return calculateChart({
      name: row.name || "",
      birthDate: row.birth_date,
      birthTime: row.birth_time || "12:00",
      unknownTime: row.unknown_time || !row.birth_time,
      latitude: row.latitude,
      longitude: row.longitude,
      cityName: row.city_name || undefined,
      ...chartCalcParams(sys),
    });
  } catch {
    return null;
  }
}

/** Stored chart columns for a freshly calculated chart. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function chartColumns(c: any) {
  return {
    big_three: c.bigThree,
    planets: c.planets,
    houses: c.houses,
    aspects: c.aspects,
    special_points: c.specialPoints || null,
    midheaven: c.midheaven || null,
  };
}

/** Drop the per-browser copies of the old chart so nothing reads stale positions. */
export function clearCachedChartCopies(userId: string) {
  try {
    for (const k of ["chartResult", "mapped:chartData", "mapped:transits"]) sessionStorage.removeItem(k);
  } catch { /* storage unavailable */ }
  try {
    // Today's horoscope was written for the old system; the home page refetches
    // (with forceRefresh, see FORCE_HOROSCOPE_KEY) when this is gone.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith("horoscope-v4-") && k.includes(userId)) localStorage.removeItem(k);
    }
    localStorage.setItem(FORCE_HOROSCOPE_KEY, "1");
  } catch { /* storage unavailable */ }
}

/** Set when the chart system changes; the home page bypasses the server's daily cache once. */
export const FORCE_HOROSCOPE_KEY = "mapped:horoscope-force-refresh";

export interface SyncResult {
  charts: number;
  connections: number;
  failed: number;
}

/**
 * Make `sys` the user's system: save the preference, then recalculate and
 * re-save their chart(s) and connections in it.
 */
export async function applyChartSystem(userId: string, sys: ChartSystem): Promise<SyncResult> {
  const result: SyncResult = { charts: 0, connections: 0, failed: 0 };
  const prefErr = await saveChartSystemPreference(userId, sys);
  if (prefErr) throw new Error(prefErr.message || "Couldn't save your setting.");

  const { required, optional } = systemColumns(sys);

  // Only the birth-data columns are needed to recalculate.
  const { data: charts } = await supabase
    .from("charts")
    .select("id, name, birth_date, birth_time, unknown_time, latitude, longitude, city_name")
    .eq("user_id", userId);
  for (const row of (charts || []) as BirthRow[]) {
    const c = recalc(row, sys);
    if (!c) { result.failed++; continue; }
    const err = await writeWithOptionalColumns(
      (payload) => supabase.from("charts").update(payload).eq("id", row.id),
      { ...chartColumns(c), ...required },
      { ...optional, ascendant: c.ascendant || null },
    );
    if (err) result.failed++; else result.charts++;
  }

  // Connections are compared against the user's chart (synastry, Dolly), so
  // they have to be in the same system.
  const { data: conns } = await supabase
    .from("connections")
    .select("id, name, birth_date, birth_time, unknown_time, latitude, longitude, city_name, synastry")
    .eq("user_id", userId);
  for (const row of (conns || []) as BirthRow[]) {
    const c = recalc(row, sys);
    if (!c) { result.failed++; continue; }
    // Stored synastry was computed from the old positions. Marking it version 0
    // reuses the Maps page's existing "stale synastry → recalculate on open" path.
    const synastry = row.synastry ? { ...row.synastry, version: 0 } : null;
    const err = await writeWithOptionalColumns(
      (payload) => supabase.from("connections").update(payload).eq("id", row.id),
      { ...chartColumns(c), synastry },
      { ...required, ...optional, ascendant: c.ascendant || null },
    );
    if (err) result.failed++; else result.connections++;
  }

  clearCachedChartCopies(userId);
  return result;
}
