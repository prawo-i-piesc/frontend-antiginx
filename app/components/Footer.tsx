"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DOCS_URL, GITHUB_URL } from '@/app/config/constants';
import { useI18n } from '@/app/i18n/I18nProvider';

const linkClass = 'inline-flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 transition-colors text-sm';

export default function Footer() {
  const { t } = useI18n();
  const copy = t.landing.footer;
  const pathname = usePathname();

  const links = [
    { href: DOCS_URL, label: copy.links.docs, icon: 'ri-book-open-line' },
    { href: GITHUB_URL, label: copy.links.github, icon: 'ri-github-line' },
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
            <ul className="flex items-center gap-5">
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
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <i className={link.icon} aria-hidden="true"></i>
                    {link.label}
                    <span className="sr-only"> {t.common.opensInNewTab}</span>
                  </a>
                </li>
              ))}
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
        </div>
      </div>
    </footer>
  );
}
