"use client";

import { useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";

/** Profile details for the dashboard chrome, read from the active session. */
export function useProfile() {
  const { user } = useAuth();
  const [override, setProfileName] = useState<string | null>(null);

  return {
    profileName: override ?? user?.full_name ?? null,
    profileId: user?.id ?? null,
    profileEmail: user?.email ?? null,
    setProfileName,
  };
}

export default useProfile;
