/**
 * Web push plumbing — permission, service worker, subscription.
 *
 * What Mapped is allowed to SAY, and how often, used to live here too. It now
 * lives in ./notifications/catalogue.ts and ./notifications/copy.ts, because
 * most of what was here could not run where it mattered: the rate limiter, the
 * quiet-hours check and the re-engagement ladder all kept their state in
 * localStorage, while the only thing that sends a notification is a cron on a
 * server. They had no callers anywhere.
 *
 * The catalogue's replacements are pure functions over a log the caller passes
 * in, so the cron can actually use them. This file re-exports them so existing
 * imports of "@/lib/notifications" keep working.
 */

export * from "./notifications/catalogue";
export {
  COPY, copyFor, variantsFor, renderCopy, shortPoint,
  MAX_TITLE, MAX_BODY, type CopyTemplate,
} from "./notifications/copy";

/* ═══════════════════════════════════════════════════════
   ═══  WEB PUSH — Service Worker + Subscription  ═══
   ═══════════════════════════════════════════════════════ */

import { supabase } from "@/lib/supabase";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

/**
 * Check if push notifications are supported in this browser.
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Why push can't be turned on right now — or "ok" if it can.
 *
 * isPushSupported() alone is not enough, and the gap it leaves is the single
 * biggest reason a phone never receives anything:
 *
 * On iOS, Safari EXPOSES serviceWorker, PushManager and Notification in an
 * ordinary tab, so every feature check passes — but permission can only
 * actually be granted once the app has been added to the Home Screen. Tapping
 * "turn on notifications" in a tab therefore does nothing at all: no prompt, no
 * error, no subscription. The person believes it is on. It never was.
 *
 * So we detect the installed (standalone) state explicitly and say what to do.
 */
export type PushBlocker =
  | "ok"
  | "unsupported"        // the browser has no push at all
  | "ios-needs-install"  // iOS Safari tab — must be added to the Home Screen first
  | "denied"             // the person declined the browser prompt
  | "not-configured";    // no VAPID public key shipped — a server-side gap

export function pushBlocker(): PushBlocker {
  if (typeof window === "undefined") return "unsupported";
  if (!isPushSupported()) return "unsupported";

  const isIOS =
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    // iPadOS 13+ reports itself as a Mac; the touch points give it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari's own flag, which predates and still outlives display-mode here.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  if (isIOS && !installed) return "ios-needs-install";
  if (Notification.permission === "denied") return "denied";
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return "not-configured";
  return "ok";
}

/**
 * Get the current notification permission state.
 */
export function getPermissionState(): PushPermissionState {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission as PushPermissionState;
}

/**
 * Request notification permission from the user.
 */
export async function requestPermission(): Promise<PushPermissionState> {
  if (!isPushSupported()) return "unsupported";
  const result = await Notification.requestPermission();
  return result as PushPermissionState;
}

/* ─── Service Worker Registration ─── */

let swRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    swRegistration = registration;
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error("[notifications] SW registration failed:", err);
    return null;
  }
}

export async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) return swRegistration;
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    swRegistration = registration || null;
    return swRegistration;
  } catch { return null; }
}

/* ─── Push Subscription ─── */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe this browser to push notifications.
 * Saves the subscription to Supabase for server-side sending.
 */
export interface SubscribeResult {
  ok: boolean;
  /** Machine-readable reason when ok is false, for the UI to explain. */
  reason?: "no-service-worker" | "not-configured" | "not-signed-in" | "save-failed" | "subscribe-failed";
  detail?: string;
}

/**
 * Subscribe this browser to push and record it server-side.
 *
 * Returns a RESULT, not a bare boolean, and every failure path is a failure.
 * The previous version returned true when no VAPID key was configured and
 * ignored whether the row actually saved — so the settings screen would report
 * notifications as on while the server had no endpoint to send to. That is a
 * silent lie in the one place a person checks, and it is the likely reason this
 * app has twenty accounts and one subscription.
 */
export async function subscribeToPush(): Promise<SubscribeResult> {
  let reg = await getRegistration();
  if (!reg) {
    reg = await registerServiceWorker();
    if (!reg) return { ok: false, reason: "no-service-worker" };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { ok: false, reason: "not-configured" };

  try {
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint) return { ok: false, reason: "subscribe-failed" };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { ok: false, reason: "not-signed-in" };

    const { error } = await supabase.from("push_subscriptions").upsert({
      user_id: session.user.id,
      endpoint: json.endpoint,
      keys_p256dh: json.keys?.p256dh || "",
      keys_auth: json.keys?.auth || "",
      created_at: new Date().toISOString(),
    }, { onConflict: "endpoint" });

    // A subscription the server never stored is not a subscription.
    if (error) return { ok: false, reason: "save-failed", detail: error.message };

    // Record where this person is, so "send at 7 PM" can mean their 7 PM.
    // The browser knows; nothing else does. Best-effort — a stored subscription
    // with an unknown timezone still works, it just falls back to UTC.
    await saveTimezone();

    return { ok: true };
  } catch (err) {
    console.error("[notifications] Push subscription failed:", err);
    return { ok: false, reason: "subscribe-failed", detail: (err as Error)?.message };
  }
}

/**
 * Unsubscribe from push and remove from Supabase.
 */
/**
 * Store the browser's IANA timezone on the profile.
 *
 * The delivery-time setting is meaningless without it: the cron runs hourly and
 * has to know whose 7 PM it is. Safe to call often — it is one small write, and
 * it keeps up with someone who moves.
 */
export async function saveTimezone(): Promise<void> {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from("profiles").update({ timezone: tz }).eq("id", session.user.id);
  } catch {
    /* a missing timezone is a fallback, not a failure */
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  const reg = await getRegistration();
  if (!reg) return;

  try {
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
    }
  } catch (err) {
    console.error("[notifications] Unsubscribe failed:", err);
  }
}

/* ─── Local Notifications (when app is open) ─── */

/**
 * Show a notification immediately via the service worker.
 */
export function showLocalNotification(title: string, body: string, url?: string): void {
  if (getPermissionState() !== "granted") return;

  const reg = swRegistration;
  if (reg) {
    reg.showNotification(title, {
      body,
      icon: "/logo-terracotta-cropped.png",
      badge: "/logo-terracotta-cropped.png",
      tag: "mapped-local-" + Date.now(),
      data: { url: url || "/home" },
    });
  }
}

/* ─── Initialization ─── */

/**
 * Call on app load. If permission already granted, register SW and subscribe.
 */
export async function initPushNotifications(): Promise<SubscribeResult> {
  if (!isPushSupported()) return { ok: false, reason: "no-service-worker" };
  if (Notification.permission !== "granted") return { ok: false, reason: "no-service-worker" };
  await registerServiceWorker();
  // Returns the result rather than swallowing it. Someone who granted
  // permission on an earlier build has a granted permission and NO stored
  // subscription — this is the call that repairs that, and if it fails again
  // the screen needs to be able to say so.
  return subscribeToPush();
}

/* ─── Test Notification ─── */

/**
 * Send a test notification to verify the system works.
 */
export function sendTestNotification(): void {
  showLocalNotification(
    "Mapped",
    "Notifications are working. You’ll hear from us when the sky has something to say."
  );
}
