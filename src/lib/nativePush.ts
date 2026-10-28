"use client";

/**
 * Push notifications inside the iOS app.
 *
 * Web push needs a service worker and PushManager, and WKWebView has neither —
 * which is why the app's settings said "This browser can't do notifications".
 * Inside the app, iOS hands us an APNs device token instead, and the server
 * sends through APNs directly (lib/push/send.ts).
 *
 * The token is stored in the same push_subscriptions table as web
 * subscriptions, with the endpoint "apns:<token>" and empty web-push keys, so
 * every sender, the per-user lookups and the stale-row clean-up work unchanged.
 *
 * iOS only for now. Android delivers through Firebase Cloud Messaging, which
 * needs a Firebase project and google-services.json before register() can run
 * without crashing, so Android reports "unsupported" until that exists.
 */

import { isNativeApp } from "@/lib/isNativeApp";

export const APNS_PREFIX = "apns:";
const TOKEN_KEY = "mapped:apns-token";

interface CapacitorGlobal { getPlatform?: () => string }

export function isNativeIOS(): boolean {
  if (!isNativeApp()) return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap?.getPlatform?.() === "ios";
}

export function isNativeWithoutPush(): boolean {
  return isNativeApp() && !isNativeIOS();
}

export type NativePermission = "default" | "granted" | "denied";

function mapPermission(receive: string): NativePermission {
  if (receive === "granted") return "granted";
  if (receive === "denied") return "denied";
  return "default";
}

export async function nativePermission(): Promise<NativePermission> {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  return mapPermission((await PushNotifications.checkPermissions()).receive);
}

export async function requestNativePermission(): Promise<NativePermission> {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  return mapPermission((await PushNotifications.requestPermissions()).receive);
}

/** Register with APNs and resolve with the device token. */
export async function registerForToken(timeoutMs = 15000): Promise<string> {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  return new Promise<string>((resolve, reject) => {
    const handles: Array<{ remove: () => Promise<void> }> = [];
    const done = (fn: () => void) => {
      clearTimeout(timer);
      handles.forEach((h) => h.remove());
      fn();
    };
    const timer = setTimeout(() => done(() => reject(new Error("APNs registration timed out"))), timeoutMs);

    Promise.all([
      PushNotifications.addListener("registration", ({ value }) => done(() => resolve(value))),
      PushNotifications.addListener("registrationError", ({ error }) => done(() => reject(new Error(error)))),
    ]).then((hs) => {
      handles.push(...hs);
      return PushNotifications.register();
    }).catch((err) => done(() => reject(err)));
  });
}

export function rememberToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
}

export function rememberedToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function forgetToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
}
