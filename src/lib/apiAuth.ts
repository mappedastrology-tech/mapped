import { createClient } from "@supabase/supabase-js";

/**
 * Verify the Supabase session bearer token on an incoming API request.
 *
 * Returns the authenticated user's id, or null if the token is missing or
 * invalid. Use this to gate routes that should only run for a signed-in user
 * (and to derive the user id from the verified token rather than the request
 * body, which a client must never be trusted to set).
 */
export async function getAuthedUserId(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) return null;
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/**
 * Like getAuthedUserId, but also returns a Supabase client scoped to the user's
 * token so row-level security applies to any reads/writes (auth.uid() = the
 * user). Returns null if the token is missing or invalid.
 */
export async function getAuthedContext(req: Request) {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) return null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return { userId: data.user.id, supabase };
  } catch {
    return null;
  }
}
