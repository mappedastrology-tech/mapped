/**
 * Notifications System — Preferences, scheduling, rate limiting, and copy.
 *
 * Core principle: "We text like a friend who actually has things to say."
 * Default to silence. Speak only when the message is specific, time-relevant,
 * on-brand, and either useful or beautiful.
 */

/* ─── Notification Categories ─── */

export type NotificationCategory =
  | "daily_content"
  | "full_moon"
  | "new_moon"
  | "quarter_moon"
  | "major_transits"
  | "retrograde_stations"
  | "birthday_week"
  | "solar_return"
  | "eclipses"
  | "mercury_retrograde"
  | "major_ingresses"
  | "practice_reminders"
  | "learning_reminder"
  | "re_engagement";

/* ─── Preferences interface (stored in Supabase profile) ─── */

export interface NotificationPreferences {
  // Category toggles (true = opted in)
  daily_content: boolean;
  full_moon: boolean;
  new_moon: boolean;
  quarter_moon: boolean;
  major_transits: boolean;
  retrograde_stations: boolean;
  birthday_week: boolean;
  solar_return: boolean;
  eclipses: boolean;
  mercury_retrograde: boolean;
  major_ingresses: boolean;
  practice_reminders: boolean;
  learning_reminder: boolean;
  re_engagement: boolean;

  // Delivery time preference (hour in user's local timezone, 0-23)
  preferred_hour: number;

  // Pause state
  paused_until: string | null; // ISO date string or null

  // Email opt-in
  email_marketing: boolean;
}

/* ─── Default preferences (per spec) ─── */

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  daily_content: false,        // OFF by default — user must opt in
  full_moon: true,             // ON
  new_moon: true,              // ON
  quarter_moon: false,         // OFF
  major_transits: true,        // ON
  retrograde_stations: true,   // ON
  birthday_week: true,         // ON
  solar_return: true,          // ON
  eclipses: true,              // ON
  mercury_retrograde: true,    // ON
  major_ingresses: true,       // ON
  practice_reminders: true,    // ON (only shown if user has a practice)
  learning_reminder: true,     // ON — nudges only when a learning streak is at risk
  re_engagement: true,         // ON

  preferred_hour: 19,          // 7 PM default
  paused_until: null,
  email_marketing: false,      // OFF — user must opt in
};

/* ─── Preferred time options (for UI) ─── */

export const TIME_OPTIONS = [
  { label: "Morning", hour: 8, description: "8 AM your time" },
  { label: "Late morning", hour: 10, description: "10 AM" },
  { label: "Lunchtime", hour: 12, description: "12 PM" },
  { label: "Late afternoon", hour: 17, description: "5 PM" },
  { label: "Evening", hour: 19, description: "7 PM" },
  { label: "Night", hour: 21, description: "9 PM" },
] as const;

/* ─── Priority ordering (high to low) ─── */

export const PRIORITY_ORDER: NotificationCategory[] = [
  // Critical/transactional is always sent (not in this list)
  "solar_return",
  "birthday_week",
  "eclipses",
  "major_transits",
  "full_moon",
  "new_moon",
  "retrograde_stations",
  "major_ingresses",
  "practice_reminders",
  "daily_content",
  "quarter_moon",
  "learning_reminder",
  "re_engagement",
];

/**
 * Get priority score for a notification category.
 * Lower number = higher priority.
 */
export function getPriority(category: NotificationCategory): number {
  const idx = PRIORITY_ORDER.indexOf(category);
  return idx === -1 ? 99 : idx;
}

/* ─── Natural-time override events ─── */

export type NaturalTimeEvent =
  | "full_moon"       // moonrise
  | "new_moon"        // sunset
  | "quarter_moon"    // sunrise
  | "solar_return"    // exact moment
  | "retrograde_stations" // station moment
  | "eclipses"        // exact eclipse moment
  | "major_ingresses"; // exact ingress moment

const NATURAL_TIME_EVENTS: Set<string> = new Set([
  "full_moon", "new_moon", "quarter_moon", "solar_return",
  "retrograde_stations", "eclipses", "major_ingresses",
]);

/**
 * Does this category deliver at its natural astronomical time
 * rather than the user's preferred time?
 */
export function usesNaturalTime(category: NotificationCategory): boolean {
  return NATURAL_TIME_EVENTS.has(category);
}

/* ─── Rate Limiting ─── */

const NOTIFICATION_LOG_KEY = "mapped:notification-log";

interface NotificationLogEntry {
  category: NotificationCategory;
  timestamp: number; // epoch ms
}

function getNotificationLog(): NotificationLogEntry[] {
  try {
    const raw = localStorage.getItem(NOTIFICATION_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotificationLog(log: NotificationLogEntry[]): void {
  try {
    // Keep only last 30 days
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = log.filter(e => e.timestamp > cutoff);
    localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

/**
 * Record that a notification was sent.
 */
export function recordNotificationSent(category: NotificationCategory): void {
  const log = getNotificationLog();
  log.push({ category, timestamp: Date.now() });
  saveNotificationLog(log);
}

/**
 * Check if sending a notification would violate rate limits.
 * Rules:
 *   - Max 1 notification per 4-hour window
 *   - Max 4 notifications in any 7-day rolling window
 */
export function isRateLimited(): boolean {
  const log = getNotificationLog();
  const now = Date.now();

  // Check 4-hour window
  const fourHoursAgo = now - 4 * 60 * 60 * 1000;
  const recentCount = log.filter(e => e.timestamp > fourHoursAgo).length;
  if (recentCount >= 1) return true;

  // Check 7-day window
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weekCount = log.filter(e => e.timestamp > sevenDaysAgo).length;
  if (weekCount >= 4) return true;

  return false;
}

/**
 * Get count of notifications sent in the last 7 days.
 */
export function getWeeklyNotificationCount(): number {
  const log = getNotificationLog();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return log.filter(e => e.timestamp > sevenDaysAgo).length;
}

/**
 * Should this notification be consolidated into a weekly digest?
 * True if we'd exceed 4 in a 7-day window AND this isn't top-3 priority.
 */
export function shouldConsolidate(category: NotificationCategory): boolean {
  if (getPriority(category) <= 2) return false; // top 3 always send individually
  return getWeeklyNotificationCount() >= 3; // if already at 3, next one consolidates
}

/* ─── Quiet Hours ─── */

/**
 * Check if current time is in quiet hours (10 PM - 7 AM local).
 * Override events (solar return, eclipses, natural-time) bypass this.
 */
export function isQuietHours(): boolean {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
}

/**
 * Check if notifications are paused.
 */
export function isPaused(prefs: NotificationPreferences): boolean {
  if (!prefs.paused_until) return false;
  return new Date(prefs.paused_until) > new Date();
}

/* ─── Re-engagement tracking ─── */

const REENGAGEMENT_KEY = "mapped:reengagement";

interface ReengagementState {
  pushCount: number;     // 0, 1, 2, or 3 (capped)
  lastPushDate: string;  // ISO date
  retired: boolean;      // true after 3rd push — never send again
}

export function getReengagementState(): ReengagementState {
  try {
    const raw = localStorage.getItem(REENGAGEMENT_KEY);
    return raw ? JSON.parse(raw) : { pushCount: 0, lastPushDate: "", retired: false };
  } catch { return { pushCount: 0, lastPushDate: "", retired: false }; }
}

export function recordReengagementPush(): void {
  try {
    const state = getReengagementState();
    state.pushCount += 1;
    state.lastPushDate = new Date().toISOString().slice(0, 10);
    if (state.pushCount >= 3) state.retired = true;
    localStorage.setItem(REENGAGEMENT_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/**
 * Should we send a re-engagement push based on days inactive?
 * Rules: Day 7, Day 21, Day 60 — then never again.
 */
export function shouldSendReengagement(daysInactive: number): boolean {
  const state = getReengagementState();
  if (state.retired) return false;

  if (state.pushCount === 0 && daysInactive >= 7) return true;
  if (state.pushCount === 1 && daysInactive >= 21) return true;
  if (state.pushCount === 2 && daysInactive >= 60) return true;

  return false;
}

/* ─── Sample Copy Library ─── */

export interface NotificationCopy {
  category: NotificationCategory;
  body: string;
  /** If true, this copy has [variable] slots that need to be filled */
  hasVariables: boolean;
}

export const SAMPLE_COPY: NotificationCopy[] = [
  // Daily content
  { category: "daily_content", body: "Today's notes: guard your own time a little. The overtime can wait.", hasVariables: false },
  { category: "daily_content", body: "Quiet skies today. No cosmic homework — just catch your breath.", hasVariables: false },
  { category: "daily_content", body: "The moon's in a tender sign tonight. Be a little gentler with yourself.", hasVariables: false },
  { category: "daily_content", body: "Venus is up to something today. Your chart has notes — worth a look.", hasVariables: false },

  // Full moon
  { category: "full_moon", body: "Full moon in [sign] tonight — the month's culmination point. A good night to finish something or let it go. Ritual inside.", hasVariables: true },
  { category: "full_moon", body: "Full moon in [sign] tomorrow. The one that lets you cry.", hasVariables: true },
  { category: "full_moon", body: "Full moon in [sign] tonight. A good night to put something down. Two-minute ritual inside.", hasVariables: true },

  // New moon
  { category: "new_moon", body: "New moon in [sign] tonight. The slow start. Plant something you'll watch grow.", hasVariables: true },
  { category: "new_moon", body: "New moon in [sign] tomorrow. The kindling. What do you want to set on fire?", hasVariables: true },
  { category: "new_moon", body: "New moon in [sign]. A clean page, if you want one.", hasVariables: true },

  // Personal chart events
  { category: "major_transits", body: "Saturn squares your Sun [timing]. The lesson kind of week.", hasVariables: true },
  { category: "major_transits", body: "Jupiter just trined your [planet]. Two-month window of openings. Ask for things.", hasVariables: true },
  { category: "major_transits", body: "Mars enters your [house] house tomorrow. [Theme] gets active for the next 6 weeks.", hasVariables: true },
  { category: "major_transits", body: "Pluto meets your natal [planet] today, exact — the biggest transit you'll have for a decade. Here's what it's actually about.", hasVariables: true },

  // Retrograde
  { category: "retrograde_stations", body: "Mercury's retrograde in your [house] house for three weeks. Read it as: review, don't restart.", hasVariables: true },
  { category: "retrograde_stations", body: "Mars just stationed direct. The thing that was stuck is moving again.", hasVariables: false },
  { category: "retrograde_stations", body: "Venus goes retrograde tomorrow — six weeks to revisit what (and who) matters. Here's the read.", hasVariables: false },

  // Birthday
  { category: "birthday_week", body: "Your year is about to change. [current lord] hands off to [next lord] on your birthday.", hasVariables: true },
  { category: "birthday_week", body: "Happy birthday, [name]. [Lord] is your year. Here's what to watch for.", hasVariables: true },
  { category: "birthday_week", body: "You're settling into the new year. [Lord] is moving you toward [theme].", hasVariables: true },

  // Solar return
  { category: "solar_return", body: "Your Sun returns at [time] today. The new year begins. Pay attention to the next 90 minutes.", hasVariables: true },

  // Eclipses
  { category: "eclipses", body: "Solar eclipse in [sign] tomorrow at [time]. The first one in this sign in 19 years.", hasVariables: true },
  { category: "eclipses", body: "Lunar eclipse in [sign] tonight. The big release.", hasVariables: true },

  // Major ingresses
  { category: "major_ingresses", body: "Pluto enters Aquarius for good next week. The 20-year shift.", hasVariables: false },
  { category: "major_ingresses", body: "Saturn enters [sign] tomorrow. Three years there.", hasVariables: true },

  // Practice reminders
  { category: "practice_reminders", body: "Tonight is your full moon practice. [ritual name] is waiting.", hasVariables: true },
  { category: "practice_reminders", body: "Your new moon practice happens at [time] tonight.", hasVariables: true },

  // Mercury retrograde
  { category: "mercury_retrograde", body: "Mercury's retrograde Friday, for three weeks. Here's what's actually worth adjusting.", hasVariables: false },

  // Learning streak (sent only when a streak is about to lapse)
  { category: "learning_reminder", body: "A two-minute lesson's waiting whenever you want it. No pressure — your progress is saved.", hasVariables: false },
  { category: "learning_reminder", body: "Got two minutes? There's a quick review in Learn. If not, it'll keep.", hasVariables: false },
  { category: "learning_reminder", body: "One short lesson's ready when you are. A rest day is on us.", hasVariables: false },

  // Re-engagement (Day 7, 21, 60)
  { category: "re_engagement", body: "Mercury changes signs today. Want to see what it touches in your chart?", hasVariables: false },
  { category: "re_engagement", body: "Your chart didn't go anywhere. Whenever you're ready.", hasVariables: false },
  { category: "re_engagement", body: "We won't keep checking in. You can come back anytime — your data is here.", hasVariables: false },
];

/**
 * Get sample copy for a specific category.
 */
export function getCopyForCategory(category: NotificationCategory): NotificationCopy[] {
  return SAMPLE_COPY.filter(c => c.category === category);
}

/**
 * Get the re-engagement copy for the current push count.
 */
export function getReengagementCopy(): string {
  const state = getReengagementState();
  const copies = getCopyForCategory("re_engagement");
  return copies[Math.min(state.pushCount, copies.length - 1)]?.body || "";
}

/* ─── Notification Scheduler (determines what to send) ─── */

export interface PendingNotification {
  category: NotificationCategory;
  body: string;
  priority: number;
  deliverAt: Date;            // when to deliver
  naturalTime: boolean;       // uses natural astronomical time
}

/**
 * Given a list of pending notifications, resolve which ones actually fire
 * based on rate limiting, priority, and stacking rules.
 */
export function resolveNotifications(
  pending: PendingNotification[],
  prefs: NotificationPreferences
): PendingNotification[] {
  // Filter by user preferences
  const enabled = pending.filter(n => {
    const key = n.category as keyof NotificationPreferences;
    return prefs[key] === true;
  });

  // Check paused state
  if (isPaused(prefs)) return [];

  // Sort by priority (lower = higher priority)
  const sorted = [...enabled].sort((a, b) => a.priority - b.priority);

  // Apply 4-per-week limit: take top 4 by priority
  const weekly = sorted.slice(0, 4);

  // Check if we should consolidate (3+ events this week already)
  if (getWeeklyNotificationCount() >= 3 && weekly.length > 1) {
    // Return only the highest-priority one
    return weekly.slice(0, 1);
  }

  return weekly;
}

/* ─── Category metadata for UI ─── */

export interface CategoryMeta {
  key: NotificationCategory;
  label: string;
  description: string;
  group: string;
  defaultOn: boolean;
}

export const CATEGORY_META: CategoryMeta[] = [
  // Group: Today's content
  { key: "daily_content", label: "One daily note from us", description: "A phrase, transit, or recommendation each morning", group: "Today's content", defaultOn: false },

  // Group: Moon phases
  { key: "full_moon", label: "Full moons", description: "2 per month", group: "Moon phases", defaultOn: true },
  { key: "new_moon", label: "New moons", description: "2 per month", group: "Moon phases", defaultOn: true },
  { key: "quarter_moon", label: "Quarter moons", description: "The quieter lunar phases", group: "Moon phases", defaultOn: false },

  // Group: Your chart
  { key: "major_transits", label: "Major transits hitting your chart", description: "When planets make exact aspects to your placements", group: "Your chart", defaultOn: true },
  { key: "retrograde_stations", label: "Retrograde stations on your placements", description: "When planets change direction over your chart", group: "Your chart", defaultOn: true },
  { key: "birthday_week", label: "Birthday week (your year ruler change)", description: "3 notifications across your birthday week", group: "Your chart", defaultOn: true },
  { key: "solar_return", label: "Your Solar Return moment", description: "The exact time your Sun returns, once per year", group: "Your chart", defaultOn: true },

  // Group: The collective sky
  { key: "eclipses", label: "Eclipses", description: "4-6 per year", group: "The collective sky", defaultOn: true },
  { key: "mercury_retrograde", label: "Mercury retrograde starts", description: "3-4 per year", group: "The collective sky", defaultOn: true },
  { key: "major_ingresses", label: "Major planet ingresses", description: "When Saturn, Jupiter, or Pluto changes signs", group: "The collective sky", defaultOn: true },

  // Group: Your practice
  { key: "practice_reminders", label: "Moon practice phase reminders", description: "Before each phase you have a ritual for", group: "Your practice", defaultOn: true },
  { key: "learning_reminder", label: "Keep my learning streak alive", description: "A gentle nudge only when your streak is about to lapse", group: "Your practice", defaultOn: true },

  // Group: Quiet check-ins
  { key: "re_engagement", label: "If I haven't opened in a while, let me know", description: "Max 3 total, then we stop", group: "Quiet check-ins", defaultOn: true },
];

/**
 * Get categories grouped by their group label.
 */
export function getCategoriesByGroup(): { group: string; categories: CategoryMeta[] }[] {
  const groups: Map<string, CategoryMeta[]> = new Map();
  for (const cat of CATEGORY_META) {
    if (!groups.has(cat.group)) groups.set(cat.group, []);
    groups.get(cat.group)!.push(cat);
  }
  return Array.from(groups.entries()).map(([group, categories]) => ({ group, categories }));
}

/* ─── Pause durations ─── */

export const PAUSE_OPTIONS = [
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
  { label: "2 weeks", hours: 336 },
] as const;

/**
 * Get the ISO date string for a pause duration.
 */
export function getPauseUntil(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

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

    return { ok: true };
  } catch (err) {
    console.error("[notifications] Push subscription failed:", err);
    return { ok: false, reason: "subscribe-failed", detail: (err as Error)?.message };
  }
}

/**
 * Unsubscribe from push and remove from Supabase.
 */
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
export async function initPushNotifications(): Promise<void> {
  if (!isPushSupported()) return;
  if (Notification.permission === "granted") {
    await registerServiceWorker();
    await subscribeToPush();
  }
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
