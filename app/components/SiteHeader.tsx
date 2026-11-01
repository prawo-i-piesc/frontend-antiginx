"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import DocsMenu from '@/app/components/DocsMenu';
import LanguageSwitcher from '@/app/components/ui/LanguageSwitcher';
import { prefersReducedMotion } from '@/app/hooks/useMediaQuery';
import { useI18n } from '@/app/i18n/I18nProvider';
import { useAuth } from '@/app/providers/AuthProvider';

export const FEATURES_SECTION_ID = 'features';
export const FEATURES_HEADING_ID = 'features-heading';

/**
 * Click handler for links to a section of the landing page: scrolls there and
 * moves keyboard focus to the first of `focusIds` that accepts it, instead of
 * leaving focus behind on the link. When the section is not on the current
 * page, or the click asks for a new tab, the link navigates as usual.
 */
export function jumpToSection(
  event: React.MouseEvent<HTMLAnchorElement>,
  sectionId: string,
  ...focusIds: string[]
) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const section = document.getElementById(sectionId);
  if (!section) return;

  event.preventDefault();
  section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  for (const id of focusIds) {
    const target = document.getElementById(id);
    // preventScroll: a focus jump would cut the smooth scroll short.
    target?.focus({ preventScroll: true });
    if (target && document.activeElement === target) break;
  }
}

const linkClass = 'text-shadow-white hover:text-cyan-300 transition-colors duration-300 font-normal text-sm';

/**
 * Whether the header has already slid in. Each marketing page renders its own
 * header, so moving between them remounts it; this module stays loaded across
 * those client-side navigations and resets only on a full load, so the header
 * slides in on the first visit or a refresh and simply stays put afterwards.
 */
let introPlayed = false;

export default function SiteHeader() {
  const auth = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const signedIn = Boolean(auth?.initialized && auth?.authenticated);
  const [slideIn] = useState(() => !introPlayed);
  useEffect(() => {
    introPlayed = true;
  }, []);

  return (
    <motion.header
      className="relative z-50 pt-2 lg:pt-6"
      initial={slideIn ? { opacity: 0, y: -10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-6xl mt-2 sm:mt-0 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logotype.png"
                alt={t.common.homeLink}
                width={100}
                height={40}
                className="h-7 sm:h-10 w-auto object-contain object-left hover:scale-101 transition-transform duration-200"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-5">
            <nav aria-label={t.landing.header.nav} className="hidden md:block">
              <ul className="flex items-center space-x-4 lg:space-x-6">
                <li>
                  <Link
                    href={`/#${FEATURES_SECTION_ID}`}
                    onClick={(event) => jumpToSection(event, FEATURES_SECTION_ID, FEATURES_HEADING_ID)}
                    className={linkClass}
                  >
                    {t.landing.header.features}
                  </Link>
                </li>
                <li>
                  <DocsMenu linkClass={linkClass} />
                </li>
                <li>
                  <Link
                    href="/pricing"
                    aria-current={pathname === '/pricing' ? 'page' : undefined}
                    className={linkClass}
                  >
                    {t.landing.header.pricing}
                  </Link>
                </li>
              </ul>
            </nav>
            <LanguageSwitcher tone="dark" />
            <Link
              href={signedIn ? '/dashboard' : '/login'}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 inline-block bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 whitespace-nowrap cursor-pointer font-medium text-sm border border-white/20 hover:border-white/40 backdrop-blur-sm"
            >
              {signedIn ? t.landing.header.dashboard : t.landing.header.signIn}
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
