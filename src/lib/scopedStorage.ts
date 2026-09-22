/**
 * Per-account namespacing for everything this app puts in localStorage.
 *
 * Until now separation relied on WIPING one account's cache when a different
 * one appeared. That works, and it is tested, but it is a rule that has to
 * fire correctly every time — and the first two attempts at it did not, in
 * ways nobody would have noticed until someone read another person's journal.
 * Namespacing removes the class instead of policing it: two accounts on one
 * device simply never write to the same key.
 *
 * WHY THIS IS DONE AT THE STORAGE LAYER rather than at the call sites. There
 * are just over two hundred localStorage calls across forty-odd files, and
 * three quarters of them pass a variable rather than a literal, so no
 * mechanical rewrite can tell which are ours. Migrating by hand would miss
 * some, silently, which is precisely the failure being designed out. One
 * wrapper covers all of them, and covers whatever gets written next year
 * without anyone remembering this file exists.
 *
 * WHAT IS AND IS NOT NAMESPACED. Only keys this app owns. Supabase's own
 * session keys pass through untouched — the session is how the user is
 * identified in the first place, so namespacing it would be circular. Three of
 * our own keys are also exempt: the appearance preference, which belongs to
 * the device; the record of who was last here, which exists to answer "which
 * namespace"; and the dev preview shim.
 *
 * Reads and writes are mapped. Enumeration (length, key(i)) is deliberately
 * NOT mapped, and still reports physical keys — the sign-out wipe walks the
 * whole store to clear other namespaces too, and hiding them from it would
 * defeat that.
 */

const OWNED_PREFIXES = ["mapped:", "mapped_", "horoscope-v"];

/**
 * Keys that stay global even though we own them.
 *
 * mapped:theme describes the device. mapped:last-user is the bookkeeping that
 * decides the namespace, so it cannot live inside one. mapped:test-auth is the
 * dev-only session shim, read to work out who is signed in.
 */
const UNSCOPED = new Set(["mapped:theme", "mapped:last-user", "mapped:test-auth"]);

/** Marks a physical key as belonging to one account's namespace. */
const NS = "mapped:u:";
const SEP = "::";

function owned(key: string): boolean {
  if (UNSCOPED.has(key)) return false;
  if (key.startsWith(NS)) return false; // already physical
  return OWNED_PREFIXES.some((p) => key.startsWith(p));
}

/** Physical key for a logical one, inside a given account's namespace. */
export function physicalKey(userId: string, logicalKey: string): string {
  return `${NS}${userId}${SEP}${logicalKey}`;
}

/** The logical key a physical one came from, or null if it isn't namespaced. */
export function logicalKey(physical: string): { userId: string; key: string } | null {
  if (!physical.startsWith(NS)) return null;
  const rest = physical.slice(NS.length);
  const at = rest.indexOf(SEP);
  if (at < 0) return null;
  return { userId: rest.slice(0, at), key: rest.slice(at + SEP.length) };
}

let installed = false;
/**
 * The genuine Storage object, kept because migration has to read RAW keys.
 * Going through window.localStorage after the shim is installed would map
 * those keys into the namespace and find nothing — the migration would
 * silently move zero keys and everyone's cache would look empty.
 */
let real: Storage | null = null;

/**
 * Swap window.localStorage for a wrapper that maps our keys into the signed-in
 * account's namespace.
 *
 * The user id is resolved on every call rather than captured once, because a
 * sign-in can happen without a reload and the very next write has to land in
 * the right place.
 *
 * Signed out, nothing is mapped: onboarding writes before there is an account
 * to attribute them to, and those get adopted on sign-in by migrateLegacyKeys.
 */
export function installScopedStorage(resolveUserId: () => string | null): void {
  if (installed || typeof window === "undefined") return;

  let store: Storage;
  try {
    store = window.localStorage;
    // Touch it: in a private window or with site data blocked this throws, and
    // there is nothing to namespace.
    store.getItem("mapped:__probe");
  } catch {
    return;
  }
  real = store;

  /**
   * map() runs on every single storage call, and resolving the id means
   * scanning the store and decoding a token. Memoised briefly so a loop over a
   * hundred keys does not repeat that a hundred times; the window is short
   * enough that a sign-in is picked up effectively at once, and the auth
   * listener re-runs the isolation check regardless.
   */
  let cachedId: string | null = null;
  let cachedAt = 0;
  const currentUser = (): string | null => {
    const now = Date.now();
    if (now - cachedAt > 1000) {
      cachedId = resolveUserId();
      cachedAt = now;
    }
    return cachedId;
  };

  const map = (key: string): string => {
    if (!owned(key)) return key;
    const uid = currentUser();
    return uid ? physicalKey(uid, key) : key;
  };

  /**
   * The keys this account can see, under their LOGICAL names.
   *
   * Enumeration has to be mapped as well as reads. Four places in the app walk
   * localStorage by index looking for a prefix — the daily ritual, the saved
   * quotes, the revealed-card markers — and if key(i) handed back physical
   * names their startsWith checks would all quietly stop matching, and those
   * features would break with no error anywhere.
   *
   * Raw keys we own are visible only while signed out, which is where writes
   * go then. Once signed in they have either been migrated or belong to
   * somebody else, and either way this account should not see them.
   */
  const visibleKeys = (): string[] => {
    const uid = currentUser();
    const out: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k === null) continue;
      const parsed = logicalKey(k);
      if (parsed) {
        if (uid && parsed.userId === uid) out.push(parsed.key);
      } else if (!owned(k) || !uid) {
        out.push(k);
      }
    }
    return out;
  };

  const api: Record<string, unknown> = {
    getItem: (k: string) => store.getItem(map(String(k))),
    setItem: (k: string, v: string) => store.setItem(map(String(k)), String(v)),
    removeItem: (k: string) => store.removeItem(map(String(k))),
    clear: () => store.clear(),
    key: (i: number) => visibleKeys()[i] ?? null,
  };

  // A Proxy rather than a plain object, so the shim behaves like real Storage
  // for the things that are not method calls: Object.keys, for...in, `in`, and
  // bracket access. A plain object silently reports its own method names as
  // the stored keys, which is worse than not shimming at all.
  const shim = new Proxy(api, {
    get(target, prop) {
      if (prop === "length") return visibleKeys().length;
      if (typeof prop === "string" && prop in target) return target[prop];
      if (typeof prop !== "string") return undefined;
      return store.getItem(map(prop)) ?? undefined;
    },
    set(_target, prop, value) {
      if (typeof prop === "string") store.setItem(map(prop), String(value));
      return true;
    },
    deleteProperty(_target, prop) {
      if (typeof prop === "string") store.removeItem(map(prop));
      return true;
    },
    has(target, prop) {
      if (typeof prop === "string" && prop in target) return true;
      return typeof prop === "string" && store.getItem(map(prop)) !== null;
    },
    ownKeys: () => visibleKeys(),
    getOwnPropertyDescriptor: (_target, prop) => {
      if (typeof prop !== "string") return undefined;
      const value = store.getItem(map(prop));
      if (value === null) return undefined;
      return { value, writable: true, enumerable: true, configurable: true };
    },
  }) as unknown as Storage;

  try {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => shim,
    });
    installed = true;
  } catch {
    // Some environments make localStorage non-configurable. Namespacing is then
    // unavailable, and separation falls back to the wipe-on-switch path, which
    // is still in place.
  }
}

/**
 * The genuine Storage, bypassing the per-account view.
 *
 * Used for whole-device work — the sign-out wipe has to reach every account's
 * namespace, and the shim deliberately shows only one.
 */
export function rawStorage(): Storage | null {
  if (real) return real;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Move keys written before namespacing existed into their owner's namespace.
 *
 * Two cases arrive here. Everyone already using the app has their cache under
 * raw keys, and would otherwise open it to find their rituals and drafts
 * apparently gone. And anyone who used the app signed out — onboarding writes
 * a fair amount — has keys that should follow them into their new account.
 *
 * It only adopts raw keys when they can be shown to belong to this account:
 * either nobody has been recorded on this device yet, or the recorded id is
 * this one. A raw key sitting next to a DIFFERENT recorded id belongs to
 * someone else and is left for the wipe to clear.
 */
export function migrateLegacyKeys(userId: string, lastUserId: string | null): number {
  if (typeof window === "undefined" || !userId) return 0;
  if (lastUserId !== null && lastUserId !== userId) return 0;

  const store = real;
  if (!store) return 0;

  let moved = 0;
  try {
    const raw: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k && owned(k)) raw.push(k);
    }
    for (const key of raw) {
      const target = physicalKey(userId, key);
      if (store.getItem(target) !== null) continue; // namespaced value wins
      const value = store.getItem(key);
      if (value === null) continue;
      store.setItem(target, value);
      store.removeItem(key);
      moved++;
    }
  } catch {
    // partial migration is survivable: what did not move stays readable until
    // the next attempt
  }
  return moved;
}

/** Test seam — lets the suite install a fresh shim against a fake window. */
export function __resetForTests(): void {
  installed = false;
}
