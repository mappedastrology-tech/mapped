"use client";

import dynamic from "next/dynamic";

const ProfilePageContent = dynamic(() => import("./ProfilePageContent"), { ssr: false });

export default function ProfilePage() {
  return <ProfilePageContent />;
}
