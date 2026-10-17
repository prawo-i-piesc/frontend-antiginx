"use client";

import Image from 'next/image';
import Link from 'next/link';

import { useI18n } from '@/app/i18n/I18nProvider';
import { FEATURES_HEADING_ID, FEATURES_SECTION_ID, jumpToSection } from './SiteHeader';

const DOCS_URL = 'https://prawo-i-piesc.github.io/engine-antiginx/';

const linkClass = 'text-zinc-400 hover:text-cyan-400 transition-colors text-sm cursor-pointer';

/** Pages that do not exist yet; their links are placeholders. */
const PLACEHOLDER_COLUMNS = [
  { title: 'company', links: ['about', 'blog', 'careers'] },
  { title: 'support', links: ['help', 'contact', 'status'] },
  { title: 'legal', links: ['privacy', 'terms', 'cookies'] },
] as const;

const SOCIAL = [
  { network: 'X', icon: 'ri-twitter-x-line' },
  { network: 'LinkedIn', icon: 'ri-linkedin-line' },
  { network: 'GitHub', icon: 'ri-github-line' },
] as const;

export default function Footer() {
  const { t } = useI18n();
  const copy = t.landing.footer;

  return (
    <footer className="relative text-white py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto relative">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-8">
          {/* Brand Section */}
          <div className="flex-1 max-w-sm">
            <Image
              src="/logotype.png"
              alt={t.common.appName}
              width={150}
              height={32}
              className="h-8 w-auto mb-3"
            />
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              {copy.tagline}
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
            <div>
              <h2 className="font-semibold text-sm text-white/90 mb-3">{copy.columns.product}</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/#${FEATURES_SECTION_ID}`}
                    onClick={(event) => jumpToSection(event, FEATURES_SECTION_ID, FEATURES_HEADING_ID)}
                    className={linkClass}
                  >
                    {copy.links.features}
                  </Link>
                </li>
                <li><a href="#" className={linkClass}>{copy.links.api}</a></li>
                <li>
                  <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {copy.links.docs}
                    <span className="sr-only"> {t.common.opensInNewTab}</span>
                  </a>
                </li>
                <li><Link href="/pricing" className={linkClass}>{copy.links.pricing}</Link></li>
              </ul>
            </div>

            {PLACEHOLDER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="font-semibold text-sm text-white/90 mb-3">{copy.columns[column.title]}</h2>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}><a href="#" className={linkClass}>{copy.links[link]}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/*
            The landing page is prerendered, so this date is the build date in
            the static HTML and the real one after hydration. suppressHydration
            keeps React quiet about the two differing over New Year, until the
            next deploy bakes in the new year anyway.
          */}
          <p className="text-zinc-400 text-xs" suppressHydrationWarning>
            {copy.copyright(new Date().getFullYear())}
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ network, icon }) => (
              <a
                key={network}
                href="#"
                aria-label={copy.social(network)}
                className="text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <i className={`${icon} text-sm`} aria-hidden="true"></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
