/**
 * socialSignIn — Google or Apple, on all four platforms.
 *
 * On the web this is the ordinary Supabase redirect: the page navigates to the
 * provider and comes back to /auth/verify.
 *
 * Inside the native shell that redirect cannot work. Capacitor hands any
 * navigation to a foreign host to Safari, so the provider page opened there,
 * the person signed in *in Safari*, and Supabase — not recognising the app's
 * capacitor://localhost origin — sent them to the website. The app itself
 * stayed signed out.
 *
 * So in the app we ask Supabase for the provider URL without navigating, open
 * it in an in-app browser sheet, and have it return to the app's own URL
 * scheme. NativeAuthBridge catches that return and finishes the sign-in with
 * completeNativeSignIn below.
 *
 * The scheme is registered in ios/App/App/Info.plist (CFBundleURLTypes) and
 * android/app/src/main/AndroidManifest.xml, and NATIVE_AUTH_REDIRECT must be in
 * Supabase → Authentication → URL Configuration → Redirect URLs.
 */

import { supabase } from "@/lib/supabase";
import { isNativeApp } from "@/lib/isNativeApp";

export const NATIVE_AUTH_SCHEME = "com.mappedastrology.app";
export const NATIVE_AUTH_REDIRECT = `${NATIVE_AUTH_SCHEME}://auth/verify`;

export async function signInWithProvider(provider: "google" | "apple"): Promise<{ error: Error | null }> {
  if (!isNativeApp()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/verify` },
    });
    return { error };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true },
  });
  if (error) return { error };
  if (!data?.url) return { error: new Error("Couldn't start sign-in. Please try again.") };

  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url: data.url, presentationStyle: "popover" });
  return { error: null };
}

/**
 * Finish a sign-in from the URL the provider sent back to the app.
 *
 * Handles both shapes Supabase can return: a PKCE `?code=` to exchange, or
 * implicit-flow tokens in the `#fragment`. Returns true when a session was set.
 */
export async function completeNativeSignIn(url: string): Promise<boolean> {
  if (!url.startsWith(`${NATIVE_AUTH_SCHEME}://`)) return false;

  const parsed = new URL(url);
  const query = parsed.searchParams;
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ""));

  const code = query.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }

  const accessToken = fragment.get("access_token");
  const refreshToken = fragment.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }

  return false;
}
