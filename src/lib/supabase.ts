import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// These values come from your .env.local file (Vercel → Environment Variables in
// production). NEXT_PUBLIC_ prefix means they're inlined into the client bundle
// at build time and are safe to use in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// The single Supabase client the whole app shares — created lazily on first use.
//
// Why lazy: `createClient` throws synchronously if the URL is missing. Creating
// it at module load meant that importing this file (even transitively, e.g. an
// API route → lib/notifications → here) executed during Next's build "collecting
// page data" step, so one unset env var failed the entire build. Deferring
// creation until the first real call keeps imports side-effect-free: the build
// no longer crashes, and a genuinely missing var surfaces as a clear runtime
// error at the point of use instead.
let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (Vercel → Settings → " +
      "Environment Variables, enabled for this deployment's environment)."
    )
  }
  client = createClient(supabaseUrl, supabaseAnonKey)

  // ── Dev-only preview/E2E auth shim ────────────────────────────────────────
  // On the local dev server, a fake `sb-…-auth-token` can make supabase-js's
  // getSession() hang (it never resolves against a real auth backend), which
  // wedges every signed-in page behind the (tabs) onboarding gate. When a
  // `mapped:test-auth` JSON session is present in localStorage during dev, we
  // resolve getSession() instantly with that stub so preview verification works.
  // Guarded on NODE_ENV so it is stripped from production builds and never ships.
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    try {
      const raw = window.localStorage.getItem("mapped:test-auth")
      if (raw) {
        const session = JSON.parse(raw)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(client.auth as any).getSession = async () => ({ data: { session }, error: null })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(client.auth as any).getUser = async () => ({ data: { user: session?.user ?? null }, error: null })
      }
    } catch {
      /* ignore malformed test-auth */
    }
  }

  return client
}

// Preserve the original `import { supabase } from "@/lib/supabase"` ergonomics:
// a Proxy that forwards every access to the lazily-created client. Property
// access is what triggers creation, so simply importing this module (as the
// build's page-data step does) never constructs the client.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = getClient()
    const value = Reflect.get(c as object, prop, receiver)
    return typeof value === "function" ? value.bind(c) : value
  },
  set(_target, prop, value) {
    const c = getClient()
    return Reflect.set(c as object, prop, value)
  },
})
