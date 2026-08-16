/**
 * Persist a resonance assignment (spec §4/§6.3). Assignments are IMMUTABLE
 * snapshots: computed once and stored, stamped with engine + data version. If a
 * current row already exists for the same versions, we leave it untouched. When
 * the engine or data version changes we supersede the old row (is_current=false)
 * and insert a new snapshot — old rows are kept, never updated in place.
 *
 * Fire-and-forget: the profile always renders from the deterministic client-side
 * compute, so persistence failing never blocks the UI.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { ResonanceResult, ENGINE_VERSION, DATA_VERSION } from "./engine";

interface PersistOpts {
  chartVersion?: number | null;
  mode?: string;
  confidence?: number;
}

export async function persistAssignment(
  supabase: SupabaseClient,
  userId: string,
  result: ResonanceResult,
  opts: PersistOpts = {},
): Promise<void> {
  try {
    const { data: current } = await supabase
      .from("resonance_assignments")
      .select("id, engine_version, data_version, signature")
      .eq("user_id", userId)
      .eq("library", "archetype")
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
        .eq("library", "archetype")
        .eq("is_current", true);
    }

    await supabase.from("resonance_assignments").insert({
      user_id: userId,
      library: "archetype",
      primary_id: result.primary.id,
      secondary_id: result.secondary?.id ?? null,
      signature: result.signature,
      traits: result.traits,
      facets: result.facets,
      evidence: result.evidence,
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
