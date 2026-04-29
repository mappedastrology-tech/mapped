/**
 * Auth callback route — handles Supabase email link redirects.
 *
 * Supabase email links (password reset, email confirmation, email change)
 * include a token_hash and type parameter. We redirect to a client-side
 * page that can exchange these for a session using the browser's Supabase client.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Supabase may send either PKCE `code` or implicit `token_hash` + `type`
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type"); // "recovery", "signup", "email_change", etc.

  // For recovery, redirect to account page which will handle the session
  if (type === "recovery") {
    // Pass through the token params so the client-side can verify
    const params = new URLSearchParams();
    params.set("reset", "true");
    if (code) params.set("code", code);
    if (tokenHash) params.set("token_hash", tokenHash);
    params.set("type", "recovery");
    return NextResponse.redirect(`${origin}/account?${params.toString()}`);
  }

  if (type === "email_change") {
    const params = new URLSearchParams();
    params.set("emailChanged", "true");
    if (code) params.set("code", code);
    if (tokenHash) params.set("token_hash", tokenHash);
    params.set("type", "email_change");
    return NextResponse.redirect(`${origin}/account?${params.toString()}`);
  }

  // Default — email confirmation, signup, etc.
  const params = new URLSearchParams();
  if (code) params.set("code", code);
  if (tokenHash) params.set("token_hash", tokenHash);
  if (type) params.set("type", type);
  return NextResponse.redirect(`${origin}/auth/verify?${params.toString()}`);
}
