/**
 * Turning an auth failure into something a person can act on.
 *
 * Signup and sign-in used to print whatever Supabase (or the browser) said,
 * verbatim, into the error line above the submit button. Only two cases were
 * ever humanised. Everything else arrived raw, including:
 *
 *   "Failed to fetch"                                  — a flaky phone connection,
 *                                                        which is the single most
 *                                                        likely error of all
 *   "Password is known to be weak and easy to guess"
 *   "For security purposes, you can only request this after 21 seconds."
 *   "Signups not allowed for this instance"
 *   "Error sending confirmation email"
 *
 * The first one is the worst: a browser internal, shown to someone on a train,
 * at the exact moment they are deciding whether this app is worth trusting
 * with their birth details.
 *
 * Matching is on substrings rather than codes because supabase-js does not
 * expose stable codes for most of these, and the messages are stable enough in
 * practice. Anything unrecognised falls through to a line that at least
 * reassures them their typing is safe.
 */

export function friendlyAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const m = raw.toLowerCase();

  // Network first — it is the most common and the least self-explanatory.
  if (
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("network request failed") ||
    m.includes("load failed")
  ) {
    return "We couldn't reach Mapped just then. Check your connection and try again — nothing you've typed is lost.";
  }

  if (m.includes("already registered") || m.includes("already been registered")) {
    return "You already have an account with this email — we've switched to signing in. Enter your password and we'll pick up your chart.";
  }

  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "That email and password don't match. Try again, or reset your password below.";
  }

  if (m.includes("email not confirmed")) {
    return "Almost there — open the confirmation link we emailed you, then sign in.";
  }

  if (m.includes("weak") || m.includes("at least 6") || m.includes("at least 8") || m.includes("password should be")) {
    return "That password is a bit easy to guess. Try something longer, or a few unrelated words.";
  }

  // Supabase phrases rate limits as "after N seconds", which is useful — but
  // the rest of the sentence reads like a security incident.
  if (m.includes("for security purposes") || m.includes("rate limit") || m.includes("too many requests")) {
    return "That's a few attempts in quick succession. Give it a minute and try again.";
  }

  if (m.includes("signups not allowed") || m.includes("signup is disabled")) {
    return "New accounts are paused right now. Please try again a little later.";
  }

  if (m.includes("sending confirmation") || m.includes("error sending")) {
    return "Your account is made, but the confirmation email didn't go out. Try resending in a moment.";
  }

  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "That email address doesn't look right — check it for a typo.";
  }

  return "Something went wrong on our end — everything you've typed is still here. Try again, and if it keeps happening, write to us.";
}
