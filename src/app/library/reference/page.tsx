import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import ReferenceList from "@/components/learn/ReferenceList";

export const metadata: Metadata = {
  title: "Library — Mapped",
  description: "Look up any card, sign, crystal, herb, or oil — a searchable reference across every topic.",
};

export default function LibraryLookupPage() {
  return (
    <main className="min-h-screen lib-felt">
      <TopBar />
      <div className="max-w-lg mx-auto px-5 pb-24">
        <ReferenceList />
      </div>
    </main>
  );
}
