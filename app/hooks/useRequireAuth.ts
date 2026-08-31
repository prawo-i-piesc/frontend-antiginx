"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export function useRequireAuth() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.initialized) return;
    if (!auth.authenticated) {
      router.replace('/login');
    }
  }, [auth.initialized, auth.authenticated, router]);

  return { authenticated: auth.authenticated, initialized: auth.initialized, auth };
}

export default useRequireAuth;
