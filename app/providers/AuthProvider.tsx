"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from '@/app/lib/api';
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  token: string | null | undefined; // undefined = not initialized yet
  initialized: boolean;
  user: UserProfile | null;
  login: (token: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const encoded = encodeURIComponent(name) + "=";
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const item of cookies) {
    const trimmed = item.trim();
    if (trimmed.startsWith(encoded)) {
      return decodeURIComponent(trimmed.slice(encoded.length));
    }
  }
  return null;
}

function writeAuthCookie(token: string | null, remember: boolean = true): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (!token) {
    document.cookie = `auth.token=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }

  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  document.cookie = `auth.token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Keep initial server/client render identical; hydrate token from storage after mount.
  const [token, setToken] = useState<string | null | undefined>(undefined);

  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('auth.token') || sessionStorage.getItem('auth.token') || readCookie('auth.token');
      setToken(stored ? stored : null);
    } catch {
      setToken(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      // ensure user is cleared when there's no token
      // schedule asynchronously to avoid synchronous setState inside effect
      Promise.resolve().then(() => {
        if (mounted) setUser(null);
      });
      return () => { mounted = false; };
    }

    // validate and fetch user asynchronously
    getMe(token)
      .then((u) => {
        if (!mounted) return;
        setUser(u);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setToken(null);
        try { localStorage.removeItem('auth.token'); } catch {}
        try { sessionStorage.removeItem('auth.token'); } catch {}
        writeAuthCookie(null);
      });

    return () => { mounted = false; };
  }, [token]);

  const login = async (t: string, remember: boolean = true) => {
    setToken(t);
    try {
      if (remember) {
        try { localStorage.setItem('auth.token', t); } catch {}
        try { sessionStorage.removeItem('auth.token'); } catch {}
      } else {
        try { sessionStorage.setItem('auth.token', t); } catch {}
        try { localStorage.removeItem('auth.token'); } catch {}
      }
      writeAuthCookie(t, remember);
    } catch (e) {
      // ignore storage errors
    }

    try {
      const u = await getMe(t);
      setUser(u);
    } catch (e) {
      // invalid token -> clear
      setToken(null);
      setUser(null);
      try { localStorage.removeItem('auth.token'); } catch {}
      try { sessionStorage.removeItem('auth.token'); } catch {}
      writeAuthCookie(null);
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try { localStorage.removeItem('auth.token'); } catch {}
    try { sessionStorage.removeItem('auth.token'); } catch {}
    writeAuthCookie(null);
    // redirect to login
    try { router.replace('/login'); } catch {}
  };

  return (
    <AuthContext.Provider value={{ token, initialized: token !== undefined, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthProvider;
