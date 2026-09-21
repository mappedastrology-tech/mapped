/**
 * Who counts as an admin.
 *
 * Listed by Supabase user id rather than by email: an id is fixed at sign-up
 * and can't be changed by editing a profile, and it arrives already verified —
 * getAuthedUserId() reads it from the signed session token, never from anything
 * the client sends.
 *
 * These ids are not secrets. The repo is public, and knowing an id gets you
 * nothing without that account's session. The lock is the server-side check in
 * each admin route; hiding links in the UI is cosmetic.
 *
 * To add or remove someone, edit this list and deploy. There is deliberately no
 * way to become an admin from inside the app.
 */
export const ADMIN_USER_IDS: ReadonlySet<string> = new Set([
  "9239cff5-0089-4f9d-aa69-c9092e0512ff", // Taylor, personal account
  "616f8ba6-92dd-4aa0-a7ec-3505252084ac", // Mapped brand account
]);

export function isAdmin(userId: string | null | undefined): boolean {
  return !!userId && ADMIN_USER_IDS.has(userId);
}
