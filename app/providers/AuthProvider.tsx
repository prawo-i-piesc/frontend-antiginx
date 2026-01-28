"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from '@/app/lib/api';
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  token: string | null | undefined; // undefined = not initialized yet
  initialized: boolean;
  user: UserProfile | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('auth.token');
      if (stored) {
        setToken(stored);
        // validate and fetch user
        try {
          getMe(stored).then((u) => setUser(u)).catch(() => {
            setToken(null);
            setUser(null);
            try { localStorage.removeItem('auth.token'); } catch (e) {}
          });
        } catch (e) {
          setToken(null);
          setUser(null);
        }
      } else setToken(null);
    } catch (e) {
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = async (t: string) => {
    setToken(t);
    try { localStorage.setItem('auth.token', t); } catch (e) {}
    try {
      const u = await getMe(t);
      setUser(u);
    } catch (e) {
      // invalid token -> clear
      setToken(null);
      setUser(null);
      try { localStorage.removeItem('auth.token'); } catch (err) {}
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try { localStorage.removeItem('auth.token'); } catch (e) {}
    // redirect to login
    try { router.replace('/login'); } catch (e) {}
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
