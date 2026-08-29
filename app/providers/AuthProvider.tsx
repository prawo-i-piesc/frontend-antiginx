"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

import { logout as apiLogout } from "@/app/lib/authApi";
import {
  getSession,
  purgeLegacyTokenStorage,
  refreshSession,
  subscribeToSession,
  type SessionUser,
} from "@/app/lib/session";

interface AuthContextType {
  /** undefined until the initial refresh settles, then the token or null. */
  token: string | null | undefined;
  initialized: boolean;
  user: SessionUser | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(subscribeToSession, getSession, () => null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    purgeLegacyTokenStorage();

    // A failed refresh is the normal signed-out case, not an error to surface.
    refreshSession().finally(() => {
      if (active) setInitialized(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({
      token: initialized ? (session?.accessToken ?? null) : undefined,
      initialized,
      user: session?.user ?? null,
      logout,
    }),
    [initialized, session, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default AuthProvider;
