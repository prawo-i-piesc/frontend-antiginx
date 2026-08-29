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

import { getMe, logout as apiLogout } from "@/app/lib/authApi";
import {
  bootstrapSession,
  getSession,
  purgeLegacyTokenStorage,
  setSessionUser,
  subscribeToSession,
  type SessionUser,
} from "@/app/lib/session";

interface AuthContextType {
  /** undefined until the initial refresh settles, then the token or null. */
  token: string | null | undefined;
  initialized: boolean;
  user: SessionUser | null;
  logout: () => Promise<void>;
  /** Re-reads the profile, for screens that change it server-side. */
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(subscribeToSession, getSession, () => null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    purgeLegacyTokenStorage();

    // A failed bootstrap is the normal signed-out case, not an error to surface.
    bootstrapSession().finally(() => {
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

  const reloadUser = useCallback(async () => {
    setSessionUser(await getMe());
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      token: initialized ? (session?.accessToken ?? null) : undefined,
      initialized,
      user: session?.user ?? null,
      logout,
      reloadUser,
    }),
    [initialized, session, logout, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default AuthProvider;
