import type { Metadata } from "next";
import LibraryHome from "@/components/learn/LibraryHome";
import DesktopWebRoute from "@/components/web/DesktopWebRoute";
import WebLibrary from "@/components/web/WebLibrary";

export const metadata: Metadata = {
  title: "Learn — Mapped",
  description: "Self-paced courses on astrology, tarot, crystals, herbs, and more — taught evidence-first, with honest safety notes.",
};

export default function LibraryPage() {
  return <DesktopWebRoute web={<WebLibrary />} mobile={<LibraryHome />} />;
}
