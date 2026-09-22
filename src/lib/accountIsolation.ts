/**
 * Keeping one account's data out of the next account's app.
 *
 * Most of what the app caches in localStorage is not keyed by user id —
 * mapped:journal-entries, mapped:chart-bigthree, mapped:profile-photo,
 * mapped:numerology-fullname and about fifty more are plain global keys. That
 * is fine while one person uses a device and wrong the moment two do.
 *
 * Sign-out used to delete an ALLOWLIST of around a dozen known-personal keys.
 * An allowlist is the wrong shape for this: every feature added since has
 * quietly opted out of being cleaned up, and the failure is silent and only
 * visible to the person who ends up reading someone else's journal. So it is
 * inverted here. Everything the app stores is treated as personal, and a short
 * named set of genuinely device-level preferences is kept.
 *
 * The other half is sign-IN. Clearing on sign-out only helps people who sign
 * out; someone who closes the tab leaves everything behind. So the current
 * user id is remembered, and if a different one appears the slate is wiped
 * before the new session renders anything.
 */

/**
 * Keys that describe the DEVICE rather than the person, and survive a switch.
 *
 * Only appearance qualifies. It says nothing about who you are, and having the
 * app flip to a different colour scheme when someone else signs in would be a
 * strange thing to do to a shared laptop.
 *
 * Note what is NOT here: mapped:theme-coords holds coordinates, which are
 * personal, and the automatic theme falls back to the device's timezone
 * without them.
 */
export const DEVICE_ONLY_KEYS: ReadonlySet<string> = new Set(["mapped:theme"]);

/** Prefixes covering everything this app writes. Both spellings are in use. */
const OWNED_PREFIXES = ["mapped:", "mapped_"];

/**
 * Keys written by the app that are not device-level — i.e. everything to clear.
 *
 * Kept pure and passed the key list so it can be tested without a browser.
 */
export function personalKeys(allKeys: readonly string[]): string[] {
  return allKeys.filter((key) => {
    if (DEVICE_ONLY_KEYS.has(key)) return false;
    if (OWNED_PREFIXES.some((p) => key.startsWith(p))) return true;
    // Two older keys predate the prefix convention.
    if (key.startsWith("horoscope-v")) return true;
    // Anything carrying a user id in its name is per-account by construction.
    if (/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(key)) return true;
    return false;
  });
}

/** Wipe every personal key from localStorage, and all of sessionStorage. */
export function clearPersonalData(): void {
  if (typeof window === "undefined") return;
  try {
    const all: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k) all.push(k);
    }
    for (const key of personalKeys(all)) window.localStorage.removeItem(key);
  } catch {
    // storage unavailable — nothing cached, so nothing to leak
  }
  try {
    // sessionStorage holds the working chart and other in-flight state, none of
    // which should outlive the account it belongs to.
    window.sessionStorage.clear();
  } catch {
    // ignore
  }
}

const LAST_USER_KEY = "mapped:last-user";

/**
 * Called once the signed-in user is known.
 *
 * Wipes cached data when the account has changed since this device last saw
 * one, and returns whether it did — callers that have already read something
 * into memory may want to re-read it.
 *
 * The stored id is not sensitive on its own: it is the same id already sitting
 * in the session token in this browser, and it buys nothing without that
 * session.
 */
export function ensureAccountIsolation(userId: string | null | undefined): boolean {
  if (typeof window === "undefined" || !userId) return false;
  let previous: string | null = null;
  try {
    previous = window.localStorage.getItem(LAST_USER_KEY);
  } catch {
    return false;
  }

  if (previous === userId) return false;

  // A first run on a fresh device has no previous id and nothing to clear —
  // wiping there would throw away the work of anyone who signed up, used the
  // app, and only then had this run for the first time.
  const switched = previous !== null && previous !== userId;
  if (switched) clearPersonalData();

  try {
    window.localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // if it cannot be recorded, the next load simply checks again
  }
  return switched;
}

/**
 * The signed-in user id, read straight out of stored session, synchronously.
 *
 * Supabase keeps the session in localStorage under sb-<projectRef>-auth-token.
 * Going to the client library for it means awaiting a promise, and by the time
 * that resolves React has already mounted the page and the page has already
 * read whatever was cached — which is precisely how the previous attempt at
 * this leaked. Reading the key directly lets the check happen before anything
 * renders.
 *
 * The key is matched by shape rather than by constructing the project ref, so
 * it keeps working if the Supabase URL changes. It is this browser's own
 * session; there is only ever one.
 */
export function storedUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // The dev-only preview shim, when present, is the session in use.
    const shim = window.localStorage.getItem("mapped:test-auth");
    if (shim) {
      const id = JSON.parse(shim)?.user?.id;
      if (typeof id === "string") return id;
    }

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !/^sb-.+-auth-token(-user)?$/.test(key)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }
      const obj = parsed as Record<string, never> | null;
      const fromShape =
        (obj?.["user"] as { id?: string } | undefined)?.id ??
        (obj?.["currentSession"] as { user?: { id?: string } } | undefined)?.user?.id;
      if (typeof fromShape === "string") return fromShape;

      // Shape-independent fallback. supabase-js moves the user between the
      // session key and a companion "-user" key depending on how storage is
      // configured, and has changed that layout across versions — but the
      // access token is a JWT whose `sub` is the user id, whatever the
      // wrapper looks like. Resting account separation on the wrapper's shape
      // is how this would quietly stop working after a dependency bump.
      const token = obj?.["access_token"] as string | undefined;
      const fromToken = subjectOf(token);
      if (fromToken) return fromToken;
    }
  } catch {
    // unreadable or unparseable — fall through to no opinion
  }
  return null;
}

/**
 * The `sub` claim of a JWT, without verifying it.
 *
 * Verification is beside the point here: this decides whether to clear caches
 * on THIS device, never whether to grant access. A forged token would at worst
 * make someone's own cache be discarded. Every real authorisation decision is
 * made server-side against a verified token.
 */
function subjectOf(jwt: string | undefined): string | null {
  if (!jwt) return null;
  const payload = jwt.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const sub = JSON.parse(json)?.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

/**
 * Run the check from whatever session is already in storage.
 *
 * Safe to call repeatedly: once the id has been recorded it is a no-op.
 */
export function isolateFromStoredSession(): boolean {
  return ensureAccountIsolation(storedUserId());
}

/** Sign-out: clear everything personal and forget who was here. */
export function clearOnSignOut(): void {
  clearPersonalData();
  try {
    window.localStorage.removeItem(LAST_USER_KEY);
  } catch {
    // ignore
  }
}
