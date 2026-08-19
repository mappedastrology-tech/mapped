/**
 * Persist resonance assignments (spec §4/§6.3) for ALL four libraries —
 * archetype, animal, deity, character. Assignments are IMMUTABLE snapshots:
 * computed once and stored, stamped with engine + data version. If a current row
 * already exists for the same library at the same versions, we leave it
 * untouched. When the engine or data version changes we supersede the old row
 * (is_current=false) and insert a new snapshot — old rows are kept, never updated
 * in place, so a user who was "The Gate / Hecate" is never silently rewritten
 * (the table's unique index enforces one current row per user per library).
 *
 * Fire-and-forget: the profile always renders from the deterministic client-side
 * compute, so persistence failing never blocks the UI.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { ResonanceResult, ENGINE_VERSION, DATA_VERSION } from "./engine";
import type { TraitVec, FacetId } from "./traits";

type LibraryName = "archetype" | "animal" | "deity" | "character";

/** Minimal shape shared by AnimalMatch / DeityMatch / CharacterMatch. */
interface GuideMatch {
  guide: { id: string; name: string; tagline: string };
  alt: { id: string } | null;
}

interface PersistOpts {
  chartVersion?: number | null;
  mode?: string;
  confidence?: number;
}

interface AssignmentRow {
  library: LibraryName;
  primary_id: string;
  secondary_id: string | null;
  signature: string;
  traits: TraitVec;
  facets: Record<FacetId, number>;
  evidence: unknown[];
}

/** One library's immutable upsert: no-op if unchanged, else supersede + insert. */
async function persistRow(
  supabase: SupabaseClient,
  userId: string,
  row: AssignmentRow,
  opts: PersistOpts,
): Promise<void> {
  try {
    const { data: current } = await supabase
      .from("resonance_assignments")
      .select("id, engine_version, data_version")
      .eq("user_id", userId)
      .eq("library", row.library)
      .eq("is_current", true)
      .maybeSingle();

    // Already stored for this exact engine + data version — immutable, leave it.
    if (current && current.engine_version === ENGINE_VERSION && current.data_version === DATA_VERSION) {
      return;
    }

    // Supersede any prior current row (kept for history), then insert the new one.
    if (current) {
      await supabase
        .from("resonance_assignments")
        .update({ is_current: false })
        .eq("user_id", userId)
        .eq("library", row.library)
        .eq("is_current", true);
    }

    await supabase.from("resonance_assignments").insert({
      user_id: userId,
      library: row.library,
      primary_id: row.primary_id,
      secondary_id: row.secondary_id,
      signature: row.signature,
      traits: row.traits,
      facets: row.facets,
      evidence: row.evidence,
      mode: opts.mode ?? "full",
      confidence: opts.confidence ?? 1.0,
      engine_version: ENGINE_VERSION,
      data_version: DATA_VERSION,
      chart_version: opts.chartVersion ?? null,
      is_current: true,
    });
  } catch {
    // Non-fatal — client-side compute already drives the display.
  }
}

/** Small evidence payload for a secondary-library row (the "why", for history/debugging). */
function guideEvidence(m: GuideMatch): unknown[] {
  return [{ feature: m.guide.name, copy: m.guide.tagline }];
}

/**
 * Persist the archetype result plus the animal / deity / character matches, each
 * as its own immutable current row. All share the user's trait vector, facets,
 * and signature (it's the same fingerprint matched against four libraries).
 */
export async function persistAllAssignments(
  supabase: SupabaseClient,
  userId: string,
  result: ResonanceResult,
  matches: { animal?: GuideMatch | null; deity?: GuideMatch | null; character?: GuideMatch | null },
  opts: PersistOpts = {},
): Promise<void> {
  const { traits, facets, signature } = result;

  const rows: AssignmentRow[] = [
    {
      library: "archetype",
      primary_id: result.primary.id,
      secondary_id: result.secondary?.id ?? null,
      signature,
      traits,
      facets,
      evidence: result.evidence,
    },
  ];

  const secondary: [LibraryName, GuideMatch | null | undefined][] = [
    ["animal", matches.animal],
    ["deity", matches.deity],
    ["character", matches.character],
  ];
  for (const [library, m] of secondary) {
    if (!m) continue;
    rows.push({
      library,
      primary_id: m.guide.id,
      secondary_id: m.alt?.id ?? null,
      signature,
      traits,
      facets,
      evidence: guideEvidence(m),
    });
  }

  // Sequential (not Promise.all): each row's read-check-supersede-insert must not
  // race another, and this is a fire-and-forget background write anyway.
  for (const row of rows) {
    await persistRow(supabase, userId, row, opts);
  }
}

/** @deprecated Use persistAllAssignments. Thin archetype-only wrapper, kept for callers. */
export async function persistAssignment(
  supabase: SupabaseClient,
  userId: string,
  result: ResonanceResult,
  opts: PersistOpts = {},
): Promise<void> {
  await persistAllAssignments(supabase, userId, result, {}, opts);
}
