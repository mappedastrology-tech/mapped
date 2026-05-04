"use client";

/**
 * Journal Layout — provides TierProvider context that the journal page needs.
 * The journal lives outside the (tabs) route group, so it doesn't inherit
 * the TierProvider from there. We add it here.
 */

import { TierProvider } from "@/components/TierProvider";

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TierProvider>{children}</TierProvider>;
}
