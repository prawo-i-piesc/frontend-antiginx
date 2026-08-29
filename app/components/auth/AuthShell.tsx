"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

/**
 * Shared frame for every auth screen.
 *
 * Sign in, sign up, the second factor step and both password-reset screens are
 * the same page with a different form in the middle, so the backdrop, logo and
 * card live here instead of being copied into each route.
 */

const PARTICLES = [
  { left: "15%", delay: "-8s", duration: "18s" },
  { left: "35%", delay: "-12s", duration: "20s" },
  { left: "55%", delay: "-10s", duration: "18s" },
  { left: "75%", delay: "-9s", duration: "17s" },
  { left: "25%", delay: "-3s", duration: "16s" },
  { left: "85%", delay: "-6s", duration: "19s" },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#09090b" }}>
      <section className="relative flex min-h-screen flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)] opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px]" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {PARTICLES.map((particle) => (
            <div
              key={particle.left + particle.delay}
              className="animate-float-up absolute bottom-0 h-0.5 w-0.5 rounded-full bg-white opacity-0"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <Link href="/" className="relative mx-auto mb-0 inline-block h-16 w-48">
                <Image src="/logotype.png" alt="Antiginx" fill className="object-contain" priority />
              </Link>
              <h1 className="mt-2 text-lg font-semibold text-white">{title}</h1>
              <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
            </div>

            <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-6">{children}</div>

            {footer ? <div className="mt-4 text-center text-sm text-zinc-400">{footer}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Full-screen placeholder used while the session is still being resolved. */
export function AuthShellFallback() {
  return <div className="min-h-screen text-white" style={{ backgroundColor: "#09090b" }} />;
}

export default AuthShell;
