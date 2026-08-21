"use client";

/**
 * Installs the /api base rewrite for native builds. Runs at module load —
 * before any component effect fires a request — so the very first API call in
 * the app is already routed at the deployed origin. No-op on the web.
 */

import { installApiBase } from "@/lib/apiBase";

installApiBase();

export default function ApiBaseInit() {
  return null;
}
