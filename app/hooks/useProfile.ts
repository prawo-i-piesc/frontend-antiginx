"use client";

import { useEffect, useState } from 'react';
import { getMe } from '@/app/lib/api';

export function useProfile(token?: string | null | undefined) {
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setProfileName(null);
      return () => { mounted = false; };
    }

    (async () => {
      try {
        const me = await getMe(token as string);
        if (mounted) setProfileName(me.full_name);
      } catch (err) {
        if (mounted) setProfileName(null);
      }
    })();

    return () => { mounted = false; };
  }, [token]);

  return { profileName, setProfileName };
}

export default useProfile;
