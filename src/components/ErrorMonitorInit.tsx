"use client";

import { useEffect } from "react";
import { initErrorMonitor } from "@/lib/errorMonitor";

/** Mounts once at the app root to install global error handlers. Renders nothing. */
export default function ErrorMonitorInit() {
  useEffect(() => {
    initErrorMonitor();
  }, []);
  return null;
}
