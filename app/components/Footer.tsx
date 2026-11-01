"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId } from 'react';

import { CONTACT_EMAIL, DOCS, DOCS_PARTS, GITHUB_URL } from '@/app/config/constants';
import { useI18n } from '@/app/i18n/I18nProvider';

const linkClass = 'inline-flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 transition-colors text-sm';
const legalLinkClass = 'text-zinc-500 hover:text-cyan-400 transition-colors';

export default function Footer() {
  const { t } = useI18n();
  const copy = t.landing.footer;
  const pathname = usePathname();

  const docsLabelId = useId();
  const legalLinks = [
    { href: '/terms', label: t.legal.links.terms },
    { href: '/privacy', label: t.legal.links.privacy },
    { href: '/security', label: t.legal.links.security },
  ];

  return (
    <footer className="relative text-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto py-10 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <Image
            src="/logotype.png"
            alt={t.common.appName}
            width={150}
            height={32}
            className="h-7 w-auto mb-2"
          />
          <p className="text-zinc-400 text-sm">{copy.tagline}</p>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <nav aria-label={copy.nav}>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <li>
                <Link
                  href="/pricing"
                  aria-current={pathname === '/pricing' ? 'page' : undefined}
                  className={linkClass}
                >
                  <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                  {copy.links.pricing}
                </Link>
              </li>
              {/* One documentation site per part of the project. */}
              <li className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
                <i className="ri-book-open-line" aria-hidden="true"></i>
                <span id={docsLabelId}>{copy.links.docs}:</span>
                <ul aria-labelledby={docsLabelId} className="inline-flex items-center gap-2">
                  {DOCS_PARTS.map((part, index) => (
                    <li key={part} className="inline-flex items-center gap-2">
                      {index > 0 ? <span aria-hidden="true">·</span> : null}
                      <a href={DOCS[part]} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {t.landing.header.docsParts[part].name}
                        <span className="sr-only"> {t.common.opensInNewTab}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <i className="ri-github-line" aria-hidden="true"></i>
                  {copy.links.github}
                  <span className="sr-only"> {t.common.opensInNewTab}</span>
                </a>
              </li>
            </ul>
          </nav>
          {/*
            The landing page is prerendered, so this date is the build date in
            the static HTML and the real one after hydration. suppressHydration
            keeps React quiet about the two differing over New Year, until the
            next deploy bakes in the new year anyway.
          */}
          <p className="text-zinc-400 text-xs" suppressHydrationWarning>
            {copy.copyright(new Date().getFullYear())} · {copy.license}
          </p>
          <ul aria-label={copy.legalNav} className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:justify-end">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className={legalLinkClass}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={legalLinkClass}>
                {t.legal.links.contact}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
