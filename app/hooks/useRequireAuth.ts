"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

/**
 * Gate for everything behind sign-in.
 *
 * An account whose address is still unverified is held on the confirmation
 * screen rather than let into the app: until the address works we have no way
 * to reach its owner, including for a password reset.
 */
export function useRequireAuth() {
  const router = useRouter();
  const auth = useAuth();

  const emailVerified = auth.user?.auth?.email_verified ?? true;

  useEffect(() => {
    if (!auth.initialized) return;
    if (!auth.authenticated) {
      router.replace('/login');
      return;
    }
    if (!emailVerified) {
      router.replace('/confirm-email');
    }
  }, [auth.initialized, auth.authenticated, emailVerified, router]);

  return {
    authenticated: auth.authenticated && emailVerified,
    initialized: auth.initialized,
    auth,
  };
}

export default useRequireAuth;
