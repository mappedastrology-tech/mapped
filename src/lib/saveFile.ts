"use client";

/**
 * Hand a file to the person, on all four platforms.
 *
 * The web way — build a Blob, click a synthetic `<a download>` — does nothing
 * at all inside WKWebView: it has no download handling for a `blob:` URL. The
 * click resolves without throwing, so the caller's try/catch never fires, the
 * button returns to its resting state, and the person is left believing their
 * GDPR data export succeeded with no file anywhere on the device.
 *
 * So: offer the share sheet first, which is the native answer and is also
 * pleasant on mobile web, and only fall back to the anchor where the anchor
 * actually works. Where neither can work, throw — a visible error beats a
 * silent lie.
 */

import { isNativeApp } from "./isNativeApp";

export class FileSaveUnsupportedError extends Error {
  constructor() {
    super("This device can't save files directly. Try sharing it instead, or open Mapped in a browser.");
    this.name = "FileSaveUnsupportedError";
  }
}

export async function saveOrShareFile(
  blob: Blob,
  filename: string,
  options: { title?: string; text?: string } = {},
): Promise<void> {
  const file = new File([blob], filename, {
    type: blob.type || "application/octet-stream",
  });

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: options.title, text: options.text });
      return;
    } catch (err) {
      // Dismissing the share sheet is a choice, not a failure — do not then
      // shove a download at them.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Anything else: fall through and try the anchor.
    }
  }

  if (isNativeApp()) throw new FileSaveUnsupportedError();

  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
