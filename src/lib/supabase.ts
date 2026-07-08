import { createClient } from '@supabase/supabase-js'

// These values come from your .env.local file.
// NEXT_PUBLIC_ prefix means they're safe to use in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This creates a single Supabase client that your whole app shares.
// You'll import this anywhere you need to talk to the database or auth.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Dev-only preview/E2E auth shim ──────────────────────────────────────────
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
      ;(supabase.auth as any).getSession = async () => ({ data: { session }, error: null })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase.auth as any).getUser = async () => ({ data: { user: session?.user ?? null }, error: null })
    }
  } catch {
    /* ignore malformed test-auth */
  }
}
