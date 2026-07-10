"use client";
import WebEmbed from "./WebEmbed";
import ProfilePageContent from "@/app/(tabs)/profile/ProfilePageContent";

export default function WebProfile() {
  return (
    <WebEmbed maxWidth={820} footerTagline="Your account & preferences.">
      <ProfilePageContent />
    </WebEmbed>
  );
}
