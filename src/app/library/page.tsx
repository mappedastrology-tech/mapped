import type { Metadata } from "next";
import LibraryHome from "@/components/learn/LibraryHome";

export const metadata: Metadata = {
  title: "Learn — Mapped",
  description: "Self-paced courses on astrology, tarot, crystals, herbs, and more — taught evidence-first, with honest safety notes.",
};

export default function LibraryPage() {
  return <LibraryHome />;
}
