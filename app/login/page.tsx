"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import LoginForm from "@/app/components/LoginForm";
import { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.initialized && auth.authenticated) router.replace("/dashboard");
  }, [auth.initialized, auth.authenticated, router]);

  // Hold the blank backdrop until the session is resolved, so an already
  // signed-in visitor never sees the form flash before the redirect.
  if (!auth.initialized || auth.authenticated) return <AuthShellFallback />;

  return (
    <Suspense fallback={<AuthShellFallback />}>
      <LoginForm />
    </Suspense>
  );
}
