/**
 * Custom Rituals — storage layer for wizard-generated rituals.
 *
 * Manages: saved custom rituals, rotation toggle, wizard history (last 10).
 * Storage: localStorage is the fast, always-available source of truth;
 * Supabase (custom_rituals table) is the durable backup, synced
 * fire-and-forget on every mutation and merged on login/startup.
 */

import { supabase } from "./supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CustomRitual {
  id: string;
  title: string;
  duration: string;       // e.g. "15 minutes"
  materials: string;      // e.g. "candle, paper, water"
  whyThisForYou: string;  // the italic preamble
  steps: string[];
  affirmation: string;
  astroFootnote: string;
  // Metadata
  createdAt: string;      // ISO date
  intentionText: string;  // original user input
  bodyLevel: "mostly_body" | "mostly_mind" | "both";
  tools: string[];
  minutes: number;
  timing: string;
  // Rotation
  inRotation: boolean;
  // User-editable
  notes?: string;
  // Tags for rotation matching
  tags?: string[];
}

export interface WizardHistoryEntry {
  id: string;
  ritual: CustomRitual;
  createdAt: string;
  saved: boolean;
}

// ─── Storage keys ──────────────────────────────────────────────────────────────

const CUSTOM_RITUALS_KEY = "mapped:custom-rituals";
const WIZARD_HISTORY_KEY = "mapped:wizard-history";

// ─── Custom Rituals CRUD ───────────────────────────────────────────────────────

export function getCustomRituals(): CustomRitual[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CUSTOM_RITUALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomRitual(ritual: CustomRitual): void {
  const rituals = getCustomRituals();
  const existing = rituals.findIndex(r => r.id === ritual.id);
  if (existing >= 0) {
    rituals[existing] = ritual;
  } else {
    rituals.unshift(ritual);
  }
  localStorage.setItem(CUSTOM_RITUALS_KEY, JSON.stringify(rituals));
  pushCustomRitualToSupabase(ritual).catch(() => {});
}

export function updateCustomRitual(id: string, updates: Partial<Pick<CustomRitual, "title" | "notes">>): void {
  const rituals = getCustomRituals();
  const ritual = rituals.find(r => r.id === id);
  if (!ritual) return;
  if (updates.title !== undefined) ritual.title = updates.title;
  if (updates.notes !== undefined) ritual.notes = updates.notes;
  localStorage.setItem(CUSTOM_RITUALS_KEY, JSON.stringify(rituals));
  pushCustomRitualToSupabase(ritual).catch(() => {});
}

export function deleteCustomRitual(id: string): void {
  const rituals = getCustomRituals().filter(r => r.id !== id);
  localStorage.setItem(CUSTOM_RITUALS_KEY, JSON.stringify(rituals));
  deleteCustomRitualFromSupabase(id).catch(() => {});
}

export function toggleRitualRotation(id: string): boolean {
  const rituals = getCustomRituals();
  const ritual = rituals.find(r => r.id === id);
  if (!ritual) return false;
  ritual.inRotation = !ritual.inRotation;
  localStorage.setItem(CUSTOM_RITUALS_KEY, JSON.stringify(rituals));
  pushCustomRitualToSupabase(ritual).catch(() => {});
  return ritual.inRotation;
}

// ─── Supabase Sync (dual-write: localStorage primary, Supabase backup) ────────

const CUSTOM_RITUALS_TABLE = "custom_rituals";

/**
 * Push a single ritual to Supabase (fire-and-forget).
 * No-ops silently when signed out or offline.
 */
export async function pushCustomRitualToSupabase(ritual: CustomRitual): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // Not logged in — skip silently

    await supabase.from(CUSTOM_RITUALS_TABLE).upsert({
      id: ritual.id,
      user_id: session.user.id,
      data: ritual, // full payload as JSONB
      created_at: ritual.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  } catch {
    // Network error — local copy is fine, will sync later
  }
}

/** Delete the Supabase row for a ritual (fire-and-forget). */
export async function deleteCustomRitualFromSupabase(id: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase
      .from(CUSTOM_RITUALS_TABLE)
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);
  } catch {
    // Offline — nothing to do
  }
}

/**
 * Full sync on login or app startup.
 * 1. Pull remote-only rituals into localStorage (local wins on conflict,
 *    since every local mutation pushes immediately)
 * 2. Push any local-only rituals to Supabase
 */
export async function syncCustomRituals(): Promise<{ pushed: number; pulled: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { pushed: 0, pulled: 0 };

    const userId = session.user.id;
    const local = getCustomRituals();
    const localIds = new Set(local.map((r) => r.id));

    const { data: remoteRows, error } = await supabase
      .from(CUSTOM_RITUALS_TABLE)
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;

    const remoteRecords = (remoteRows || []) as { id: string; data: CustomRitual }[];
    const remoteIds = new Set(remoteRecords.map((r) => r.id));

    // Pull remote-only rituals into localStorage
    const toPull = remoteRecords
      .filter((r) => !localIds.has(r.id) && r.data)
      .map((r) => ({ ...r.data, id: r.id }));
    if (toPull.length > 0) {
      const merged = [...local, ...toPull];
      merged.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      try {
        localStorage.setItem(CUSTOM_RITUALS_KEY, JSON.stringify(merged));
      } catch {}
    }

    // Push local-only rituals to Supabase
    const toPush = local.filter((r) => !remoteIds.has(r.id));
    if (toPush.length > 0) {
      await supabase.from(CUSTOM_RITUALS_TABLE).upsert(
        toPush.map((r) => ({
          id: r.id,
          user_id: userId,
          data: r,
          created_at: r.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" }
      );
    }

    return { pushed: toPush.length, pulled: toPull.length };
  } catch {
    return { pushed: 0, pulled: 0 };
  }
}

export function getRotationRituals(): CustomRitual[] {
  return getCustomRituals().filter(r => r.inRotation);
}

// ─── Wizard History ────────────────────────────────────────────────────────────

export function getWizardHistory(): WizardHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WIZARD_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToWizardHistory(ritual: CustomRitual, saved: boolean): void {
  const history = getWizardHistory();
  // Remove if already exists (re-spin)
  const filtered = history.filter(h => h.id !== ritual.id);
  filtered.unshift({
    id: ritual.id,
    ritual,
    createdAt: new Date().toISOString(),
    saved,
  });
  // Keep last 10
  const trimmed = filtered.slice(0, 10);
  localStorage.setItem(WIZARD_HISTORY_KEY, JSON.stringify(trimmed));
}

export function markHistoryAsSaved(id: string): void {
  const history = getWizardHistory();
  const entry = history.find(h => h.id === id);
  if (entry) {
    entry.saved = true;
    localStorage.setItem(WIZARD_HISTORY_KEY, JSON.stringify(history));
  }
}

// ─── Parse wizard output into CustomRitual ─────────────────────────────────────

export function parseWizardOutput(
  rawText: string,
  inputs: {
    intentionText: string;
    bodyLevel: "mostly_body" | "mostly_mind" | "both";
    tools: string[];
    minutes: number;
    timing: string;
  },
): CustomRitual | null {
  try {
    // Check for crisis response
    if (rawText.startsWith("CRISIS:")) {
      return null; // Signal to show crisis response instead
    }

    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

    let title = "";
    let duration = "";
    let materials = "";
    let whyThisForYou = "";
    const steps: string[] = [];
    let affirmation = "";
    let astroFootnote = "";

    let section = "";

    for (const line of lines) {
      if (line.startsWith("TITLE:")) {
        title = line.replace("TITLE:", "").trim();
        section = "title";
      } else if (line.startsWith("TIME:")) {
        const timeLine = line.replace("TIME:", "").trim();
        const parts = timeLine.split("·").map(p => p.trim());
        duration = parts[0] || timeLine;
        materials = parts.slice(1).join(", ") || "";
        section = "time";
      } else if (line.startsWith("WHY:")) {
        whyThisForYou = line.replace("WHY:", "").trim();
        section = "why";
      } else if (line.startsWith("STEPS:")) {
        section = "steps";
      } else if (line.startsWith("AFFIRMATION:")) {
        affirmation = line.replace("AFFIRMATION:", "").trim().replace(/^[""]|[""]$/g, "");
        section = "affirmation";
      } else if (line.startsWith("ASTRO:")) {
        astroFootnote = line.replace("ASTRO:", "").trim();
        section = "astro";
      } else {
        // Continuation of current section
        if (section === "why") {
          whyThisForYou += " " + line;
        } else if (section === "steps") {
          // Parse numbered steps
          const stepMatch = line.match(/^\d+\.\s*(.+)/);
          if (stepMatch) {
            steps.push(stepMatch[1]);
          } else if (steps.length > 0) {
            // Continuation of previous step
            steps[steps.length - 1] += " " + line;
          }
        } else if (section === "affirmation") {
          affirmation += " " + line;
          affirmation = affirmation.replace(/^[""]|[""]$/g, "");
        } else if (section === "astro") {
          astroFootnote += " " + line;
        }
      }
    }

    // Fallback: if parsing didn't find structured output, treat whole text as a single ritual
    if (!title && lines.length > 0) {
      title = "Custom Ritual";
      whyThisForYou = "Generated for you based on your intention and the current sky.";
      // Try to extract steps from numbered lines anywhere in the text
      for (const line of lines) {
        const stepMatch = line.match(/^\d+\.\s*(.+)/);
        if (stepMatch) steps.push(stepMatch[1]);
      }
    }

    return {
      id: `wizard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      duration,
      materials,
      whyThisForYou,
      steps,
      affirmation,
      astroFootnote,
      createdAt: new Date().toISOString(),
      intentionText: inputs.intentionText,
      bodyLevel: inputs.bodyLevel,
      tools: inputs.tools,
      minutes: inputs.minutes,
      timing: inputs.timing,
      inRotation: false,
    };
  } catch {
    return null;
  }
}
