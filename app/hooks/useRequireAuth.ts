"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export function useRequireAuth() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.initialized) return;
    if (!auth.token) {
      router.replace('/login');
    }
  }, [auth.initialized, auth.token, router]);

  return { token: auth.token, initialized: auth.initialized, auth };
}

export default useRequireAuth;
