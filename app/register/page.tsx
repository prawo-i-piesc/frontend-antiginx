"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import RegisterForm from "@/app/components/RegisterForm";
import { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { useAuth } from "@/app/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.initialized && auth.authenticated) router.replace("/dashboard");
  }, [auth.initialized, auth.authenticated, router]);

  if (!auth.initialized || auth.authenticated) return <AuthShellFallback />;

  return <RegisterForm />;
}
