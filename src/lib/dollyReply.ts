/**
 * Dolly's structured reply format.
 *
 * The design calls for a reply to carry more than prose: the placements it
 * rests on (chips), a headline line, an optional link into the app, and a
 * couple of tappable follow-ups. Dolly supplies those by opening every reply
 * with ONE line of compact JSON, then a blank line, then the prose.
 *
 * Leading rather than trailing, deliberately: the chips and the headline are
 * painted at the TOP of the bubble, so they have to arrive before the prose or
 * the bubble reflows under the reader mid-answer.
 *
 * Everything here treats that line as UNTRUSTED text from a model:
 *
 *   - One character decides. If the reply doesn't open with "{", it is prose,
 *     immediately — no waiting, no guessing.
 *   - A line that never closes, or closes as invalid JSON, degrades to prose.
 *     Raw JSON must never reach the screen.
 *   - `action.href` is checked against a fixed allowlist of in-app routes. A
 *     model-authored link is exactly the thing you do not render blindly, so an
 *     unrecognised href drops the action rather than shipping the link.
 */

export type DollyTagKind = "chart" | "sky" | "card";

export interface DollyTag {
  label: string;
  kind: DollyTagKind;
}

export interface DollyAction {
  label: string;
  href: string;
}

export interface DollyMeta {
  tags: DollyTag[];
  lead: string | null;
  action: DollyAction | null;
  follow: string[];
}

export interface ParsedReply {
  meta: DollyMeta | null;
  /** The prose to render. Never contains the meta line. */
  body: string;
  /** True while the meta line is still streaming — show the typing dots. */
  metaPending: boolean;
}

/** The only hrefs an action chip may point at. */
export const DOLLY_ROUTES = [
  "/you", "/almanac", "/tarot", "/journal", "/maps",
  "/numerology", "/human-design", "/palmistry", "/learn", "/profile",
] as const;

const ROUTE_SET = new Set<string>(DOLLY_ROUTES);
const TAG_KINDS = new Set<string>(["chart", "sky", "card"]);

const MAX_TAGS = 3;
const MAX_TAG_LEN = 44;
const MAX_LEAD_LEN = 120;
const MAX_ACTION_LEN = 40;
const MAX_FOLLOW = 2;
const MAX_FOLLOW_LEN = 60;

const str = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s && s.length <= max ? s : null;
};

/** Coerce whatever the model produced into a DollyMeta, dropping the rest. */
function sanitize(raw: unknown): DollyMeta | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;

  const tags: DollyTag[] = [];
  if (Array.isArray(o.tags)) {
    for (const t of o.tags) {
      if (tags.length >= MAX_TAGS) break;
      if (!t || typeof t !== "object") continue;
      const tt = t as Record<string, unknown>;
      const label = str(tt.label, MAX_TAG_LEN);
      if (!label) continue;
      const kind = typeof tt.kind === "string" && TAG_KINDS.has(tt.kind)
        ? (tt.kind as DollyTagKind) : "chart";
      tags.push({ label, kind });
    }
  }

  let action: DollyAction | null = null;
  if (o.action && typeof o.action === "object") {
    const a = o.action as Record<string, unknown>;
    const label = str(a.label, MAX_ACTION_LEN);
    const href = typeof a.href === "string" ? a.href.trim() : "";
    if (label && ROUTE_SET.has(href)) action = { label, href };
  }

  const follow: string[] = [];
  if (Array.isArray(o.follow)) {
    for (const f of o.follow) {
      if (follow.length >= MAX_FOLLOW) break;
      const s = str(f, MAX_FOLLOW_LEN);
      if (s) follow.push(s);
    }
  }

  const meta: DollyMeta = { tags, lead: str(o.lead, MAX_LEAD_LEN), action, follow };
  // An empty shell is the same as no meta — don't render an empty chip row.
  if (!meta.tags.length && !meta.lead && !meta.action && !meta.follow.length) return null;
  return meta;
}

/**
 * Split a (possibly partial) reply into its meta and its prose.
 * Safe to call on every streamed token.
 */
export function parseDollyReply(raw: string): ParsedReply {
  const lead = raw.trimStart();

  // Not JSON: it's prose, and we know that from the first character.
  if (!lead.startsWith("{")) return { meta: null, body: raw, metaPending: false };

  const nl = lead.indexOf("\n");
  // The meta line hasn't closed yet. Withhold it — a half-written JSON object
  // must never flash on screen — and let the caller show the typing dots.
  if (nl === -1) return { meta: null, body: "", metaPending: true };

  const line = lead.slice(0, nl);
  const rest = lead.slice(nl + 1).replace(/^\s*\n/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    // Malformed after all — treat the whole thing as prose rather than
    // swallowing content the user was meant to read.
    return { meta: null, body: raw, metaPending: false };
  }

  return { meta: sanitize(parsed), body: rest, metaPending: false };
}

/**
 * The prose alone — for anything that consumes a reply as text rather than
 * rendering it (conversation previews, history, the memory digest, and the
 * history replayed to the model).
 */
export function dollyBody(raw: string): string {
  return parseDollyReply(raw).body || raw;
}
