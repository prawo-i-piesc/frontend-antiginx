"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Shared frame for every auth screen.
 *
 * Sign in, sign up, the second factor step and both password-reset screens are
 * the same page with a different form in the middle, so the backdrop, logo and
 * card live here instead of being copied into each route.
 */

/**
 * Same fade-and-rise the landing page opens with, toned down: the auth card is
 * a couple of hundred pixels tall, so it does not need the travel a hero does.
 * The three blocks come in one after another rather than as one slab.
 */
function entrance(reduced: boolean | null): { container: Variants; item: Variants } {
  return {
    container: {
      hidden: {},
      show: { transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: reduced ? 0 : 0.04 } },
    },
    item: {
      hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduced ? 0.15 : 0.35, ease: "easeOut" },
      },
    },
  };
}

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
  /** Sign-up needs the extra room for two fields per row. */
  wide,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const { container, item } = entrance(useReducedMotion());

  return (
    <div className="auth-surface min-h-screen text-white" style={{ backgroundColor: "#09090b" }}>
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

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
          <motion.div
            className={`w-full ${wide ? "max-w-lg" : "max-w-md"}`}
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="mb-5 text-center">
              <Link href="/" className="relative mx-auto mb-0 inline-block h-12 w-36">
                <Image
                  src="/logotype.png"
                  alt="Antiginx"
                  fill
                  sizes="12rem"
                  className="object-contain"
                  priority
                />
              </Link>
              <h1 className="mt-1 text-base font-semibold text-white">{title}</h1>
              <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>
            </motion.div>

            <motion.div
              variants={item}
              className="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-5"
            >
              {children}
            </motion.div>

            {footer ? (
              <motion.div variants={item} className="mt-3 text-center text-sm text-zinc-400">
                {footer}
              </motion.div>
            ) : null}
          </motion.div>
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
