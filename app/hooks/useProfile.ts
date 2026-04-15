"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/app/lib/api";

export function useProfile(token?: string | null | undefined) {
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      // clear profile asynchronously to avoid sync setState inside effect
      Promise.resolve().then(() => {
        if (mounted) {
          setProfileName(null);
          setProfileId(null);
        }
      });
      return () => {
        mounted = false;
      };
    }

    (async () => {
      try {
        const me = await getMe(token as string);
        if (mounted) {
          setProfileName(me.full_name);
          setProfileId(me.id);
        }
      } catch (err) {
        if (mounted) {
          setProfileName(null);
          setProfileId(null);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  return { profileName, profileId, setProfileName };
}

export default useProfile;
