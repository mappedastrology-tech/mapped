/**
 * Service Worker — Push notifications for Mapped.
 *
 * Handles:
 * - Push event reception and notification display
 * - Notification click to open the app
 * - Background sync (future)
 */

/* eslint-disable no-restricted-globals */

const APP_URL = self.location.origin;

// Install — activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate — claim all clients
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push — show notification
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Mapped", body: event.data.text() };
  }

  const options = {
    body: data.body || "",
    icon: "/logo-terracotta-cropped.png",
    badge: "/logo-terracotta-cropped.png",
    tag: data.tag || "mapped-notification",
    data: {
      url: data.url || "/home",
    },
    // Subtle vibration pattern
    vibrate: [100, 50, 100],
    // Actions if supported
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Mapped", options)
  );
});

// Notification click — open/focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url
    ? new URL(event.notification.data.url, APP_URL).href
    : APP_URL + "/home";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // If app is already open, focus it
      for (const client of clients) {
        if (client.url.startsWith(APP_URL) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});
