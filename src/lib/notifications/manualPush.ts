/**
 * The rules for a push written by hand.
 *
 * Kept pure and separate from the route so the send page can check a draft as
 * it is typed, the server can refuse the same draft on arrival, and both are
 * testable. The client check is a courtesy; the server check is the one that
 * counts.
 *
 * A manual push follows the same SOP as the ones Mapped writes itself —
 * see copy.ts. Hand-written copy is where rules drift first, so the rules that
 * can be checked mechanically are checked here rather than trusted to memory.
 */

import { MAX_TITLE, MAX_BODY } from "./copy";

export type Audience = "me" | "everyone";

export interface ManualPush {
  title: string;
  body: string;
  /** An in-app path. Never an outside link. */
  url: string;
  audience: Audience;
}

/** Where a manual push can open. Anything else is refused. */
export const DESTINATIONS: { path: string; label: string }[] = [
  { path: "/home", label: "Home" },
  { path: "/journal", label: "Journal" },
  { path: "/you", label: "You" },
  { path: "/dolly", label: "Dolly" },
  { path: "/learn", label: "Learn" },
  { path: "/almanac", label: "Almanac" },
];

const EMOJI = /\p{Extended_Pictographic}/u;
const URGENCY = /\b(hurry|don'?t miss|last chance|act now|urgent|limited time)\b/i;

/**
 * Titles that name the app or a category instead of the thing. The phone
 * already prints "MAPPED" above every notification — a title that says it again
 * spends the most valuable line on the screen repeating the app's name.
 */
const LAZY_TITLES = new Set(["mapped", "mapped app", "notification", "reminder", "update", "hey", "hi"]);

export type Check = { ok: true; push: ManualPush } | { ok: false; field: "title" | "body" | "url" | "audience"; error: string };

export function validateManualPush(input: unknown): Check {
  const raw = (input ?? {}) as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const body = typeof raw.body === "string" ? raw.body.trim() : "";
  const url = typeof raw.url === "string" && raw.url ? raw.url : "/home";
  const audience = raw.audience;

  if (!title) return { ok: false, field: "title", error: "Needs a title." };
  if (title.length > MAX_TITLE) return { ok: false, field: "title", error: `Title is ${title.length} characters. The limit is ${MAX_TITLE} — past that, phones cut it off.` };
  if (LAZY_TITLES.has(title.toLowerCase().replace(/[^a-z ]/g, "").trim())) {
    return { ok: false, field: "title", error: "The phone already shows \"Mapped\" above the title. Use the title for the actual thing." };
  }
  if (!body) return { ok: false, field: "body", error: "Needs a message." };
  if (body.length > MAX_BODY) return { ok: false, field: "body", error: `Message is ${body.length} characters. The limit is ${MAX_BODY}.` };
  if (EMOJI.test(title) || EMOJI.test(body)) return { ok: false, field: EMOJI.test(title) ? "title" : "body", error: "No emoji — Dolly doesn't use them, and they test worse in this category." };
  if (URGENCY.test(title) || URGENCY.test(body)) return { ok: false, field: URGENCY.test(title) ? "title" : "body", error: "No urgency words. Nothing in the sky expires in an hour." };
  if (!DESTINATIONS.some((d) => d.path === url)) return { ok: false, field: "url", error: "Pick where it opens from the list." };
  if (audience !== "me" && audience !== "everyone") return { ok: false, field: "audience", error: "Choose who it goes to." };

  return { ok: true, push: { title, body, url, audience } };
}

/** The hour it is for this person right now, falling back to UTC when unknown. */
export function localHour(now: Date, timezone: string | null | undefined): number {
  try {
    const h = new Intl.DateTimeFormat("en-US", { timeZone: timezone || "UTC", hour: "2-digit", hour12: false })
      .formatToParts(now).find((p) => p.type === "hour")?.value;
    return Number(h) % 24;
  } catch {
    return now.getUTCHours();
  }
}
