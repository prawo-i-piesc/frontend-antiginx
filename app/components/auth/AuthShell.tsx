"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { useI18n } from "@/app/i18n/I18nProvider";
import LanguageSwitcher from "@/app/components/ui/LanguageSwitcher";
import { MAIN_CONTENT_ID } from "@/app/components/ui/SkipLink";

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
  /**
   * Names what the card is showing, for screens that swap it in place — the
   * form for a confirmation. When it changes, the control that had focus is
   * usually gone with the old view, so focus goes to the heading, which a
   * screen reader reads out. A view that takes focus itself (a field with
   * autoFocus) keeps it.
   */
  view,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  view?: string;
}) {
  const { t } = useI18n();
  const { container, item } = entrance(useReducedMotion());

  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownView = useRef(view);

  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;

    const active = document.activeElement;
    if (!active || active === document.body) headingRef.current?.focus();
  }, [view]);

  return (
    <div className="auth-surface min-h-screen text-white" style={{ backgroundColor: "#09090b" }}>
      <div className="relative flex min-h-screen flex-col">
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

        {/* In the flow on a phone, so it can never sit on top of the card;
            pinned to the corner once there is room beside the logo. */}
        <header className="relative z-20 flex justify-end px-4 pt-4 sm:absolute sm:right-0 sm:top-0">
          <LanguageSwitcher tone="dark" />
        </header>

        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 focus:outline-none"
        >
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
                  alt={t.common.homeLink}
                  fill
                  sizes="12rem"
                  className="object-contain"
                  priority
                />
              </Link>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="mt-1 text-base font-semibold text-white focus:outline-none"
              >
                {title}
              </h1>
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
        </main>
      </div>
    </div>
  );
}

/**
 * Full-screen placeholder used while the session is still being resolved.
 * Nothing to see, but a screen reader hears that the page is loading.
 */
export function AuthShellFallback() {
  const { t } = useI18n();

  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className="min-h-screen text-white focus:outline-none"
      style={{ backgroundColor: "#09090b" }}
    >
      <p role="status" className="sr-only">
        {t.common.loading}
      </p>
    </main>
  );
}

export default AuthShell;
