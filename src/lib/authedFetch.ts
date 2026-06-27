import { supabase } from "@/lib/supabase";

/**
 * fetch() that attaches the current Supabase session token as a Bearer header,
 * so authenticated API routes can verify the caller. Use this for every call to
 * an auth-gated endpoint (the AI routes). If there's no session, the request
 * goes out without a token and the route will return 401.
 */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  // getSession() can THROW (e.g. "Invalid Refresh Token") when the stored
  // session is stale/corrupt. Guard it so a bad token degrades to an
  // unauthenticated request (clean 401) instead of crashing the caller with a
  // confusing "network error".
  let token: string | undefined;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
  } catch {
    token = undefined;
  }
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
