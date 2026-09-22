import test from "node:test";
import assert from "node:assert/strict";

// Must precede anything that reaches the database — see the helper.
import "./helpers/supabaseEnv";
import { getProfile, invalidateProfile, cachedProfileUserId } from "../src/lib/profileCache";
import { supabase } from "../src/lib/supabase";

/**
 * The profile cache is shared by every section of the account screen, and
 * entitlements resolve through it. It leaked across accounts for a while: it
 * recorded whose row it held and then never checked, and signing in is a
 * client-side navigation rather than a page load, so the cache outlived the
 * account it was read for.
 *
 * Nothing covered this module before — not because it could not be imported,
 * but because no test was ever written for it. These are that test.
 *
 * The module reaches the database through the shared supabase client, which is
 * a Proxy over a lazily-created real client. So the client is given dummy
 * credentials (createClient does not talk to anything when it is constructed)
 * and its two entry points are replaced with stubs. That keeps the code under
 * test entirely real — the guard, the TTL, the in-flight join are all the
 * shipped implementations.
 */

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

/** A minimal localStorage, so storedUserId() has a session to read. */
function fakeWindow() {
  const map = new Map<string, string>();
  const storage = {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
  };
  (globalThis as Record<string, unknown>).window = {
    localStorage: storage,
    sessionStorage: { clear: () => {} },
  };
  return storage;
}

// Before anything calls in: neither module touches window at import time (the
// supabase client is built lazily), but the session has to exist by first use.
const store = fakeWindow();

/** Who the session says is signed in, and how many rows have been fetched. */
let sessionUser: string | null = null;
let fetches = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(supabase.auth as any).getSession = async () => ({
  data: { session: sessionUser ? { user: { id: sessionUser } } : null },
  error: null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(supabase as any).from = () => ({
  select: () => ({
    eq: (_col: string, id: string) => ({
      maybeSingle: async () => {
        fetches++;
        // The row is stamped with whose it is, so a leak is unmistakable.
        return { data: { id, tier: id === A ? "max" : "free" }, error: null };
      },
    }),
  }),
});

/** Put both the session and the stored token on the same account. */
function signIn(id: string) {
  sessionUser = id;
  store.setItem("mapped:test-auth", JSON.stringify({ user: { id } }));
}

test("a switched account never receives the previous account's row", async () => {
  // THE REGRESSION. Before the guard, the second read joined the first — and
  // because the row carries the tier, the incoming user inherited "max".
  invalidateProfile();
  fetches = 0;

  signIn(A);
  const a = await getProfile();
  assert.equal(a?.id, A);
  assert.equal(a?.tier, "max");

  // Immediately afterwards, well inside the five-second window.
  signIn(B);
  const b = await getProfile();
  assert.equal(b?.id, B, "B was handed A's profile row");
  assert.equal(b?.tier, "free", "B inherited A's paid tier");
});

test("the same account within the window is still served from cache", async () => {
  // The guard must not defeat the thing this module exists for: one read
  // shared by the eight sections of the account screen.
  invalidateProfile();
  fetches = 0;

  signIn(A);
  await getProfile();
  await getProfile();
  await getProfile();
  assert.equal(fetches, 1, "the shared read fanned back out into several");
});

test("concurrent callers join one in-flight read", async () => {
  invalidateProfile();
  fetches = 0;

  signIn(A);
  const [x, y, z] = await Promise.all([getProfile(), getProfile(), getProfile()]);
  assert.equal(fetches, 1);
  assert.equal(x?.id, A);
  assert.equal(y?.id, A);
  assert.equal(z?.id, A);
});

test("signing out leaves nothing attributed to the last account", async () => {
  invalidateProfile();
  signIn(A);
  await getProfile();
  assert.equal(cachedProfileUserId(), A);

  // What the auth listener does on a sign-out event.
  invalidateProfile();
  assert.equal(cachedProfileUserId(), null);

  sessionUser = null;
  store.removeItem("mapped:test-auth");
  assert.equal(await getProfile(), null, "a signed-out read produced a row");
});

test("an unreadable session makes the guard abstain, not guess", async () => {
  // storedUserId() returns null when it cannot parse a session. The guard then
  // stands aside and the TTL applies as before — the auth listener is the
  // independent second mechanism that covers this case.
  invalidateProfile();
  fetches = 0;

  signIn(A);
  await getProfile();

  store.setItem("mapped:test-auth", "{ not json");
  const again = await getProfile();
  assert.equal(again?.id, A, "abstaining should reuse the cache, not clear it");
  assert.equal(fetches, 1);
});
