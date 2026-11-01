"use client";

import { DOCS } from '@/app/config/constants';
import { useI18n } from '@/app/i18n/I18nProvider';
import { FEATURES_HEADING_ID, FEATURES_SECTION_ID } from './SiteHeader';

/**
 * The tests a scan runs, by area. Mirrors the list the backend sends to the
 * engine for every free scan (`CategorizedTests` in backend-antiginx), minus
 * tests the engine has not shipped yet; keep the two in step. The page never
 * shows how many there are: the number grows, so each list ends in a "more" chip.
 *
 * `span` lays the areas out as a mosaic of two rows on wide screens, 2+1+1
 * and 2+2: the wide tiles go to phishing and to the areas with long lists.
 */
const CHECK_GROUPS = [
  { key: 'phishing', icon: 'ri-spy-line', span: 'md:col-span-2', tests: ['phishing-url', 'dns-reputation', 'favicon-origin', 'js-obf'] },
  { key: 'encryption', icon: 'ri-lock-line', span: '', tests: ['https', 'hsts', 'ssl-cert'] },
  { key: 'cookies', icon: 'ri-key-2-line', span: '', tests: ['cookie-sec'] },
  {
    key: 'headers',
    icon: 'ri-shield-check-line',
    span: 'lg:col-span-2',
    tests: ['csp', 'xframe', 'permissions-policy', 'x-content-type-options', 'referrer-policy', 'cross-origin-x'],
  },
  { key: 'exposure', icon: 'ri-server-line', span: 'lg:col-span-2', tests: ['serv-h-a', 'sitemap', 'bot-protection'] },
] as const;

type GroupKey = (typeof CHECK_GROUPS)[number]['key'];

const pass = <i className="ri-checkbox-circle-fill text-emerald-400" />;
const fail = <i className="ri-close-circle-fill text-red-400" />;
const warn = <i className="ri-error-warning-fill text-amber-300" />;

/*
 * Small pictures of what each area looks like in a scan, on made-up domains.
 * They repeat what the text says, so they are hidden from assistive tech.
 */

function PhishingArt() {
  const { t } = useI18n();
  const art = t.landing.checks.art;
  const bar = 'flex items-center gap-2 rounded-full border bg-zinc-900/90 px-3.5 py-2 font-mono text-sm';

  return (
    <div className="flex h-full flex-col justify-center gap-3 px-5 sm:px-8">
      <div className={`${bar} max-w-sm border-zinc-700/60 text-zinc-200`}>
        <i className="ri-lock-fill text-xs text-zinc-500" />
        shop.example
        <span className="ml-auto">{pass}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className={`${bar} w-full max-w-sm border-red-400/40 text-zinc-200 shadow-[0_0_24px_rgba(248,113,113,0.12)]`}>
          <i className="ri-lock-fill text-xs text-zinc-500" />
          <span>
            shop.exa<span className="rounded-sm bg-red-500/25 px-px text-red-300 underline decoration-red-400 decoration-wavy underline-offset-4">rn</span>ple
          </span>
          <span className="ml-auto">{fail}</span>
        </div>
        <span className="font-mono text-xs text-red-300">
          <i className="ri-arrow-left-line mr-1" />
          {art.lookalike}
        </span>
      </div>
      <span className="self-start rounded-full border border-amber-400/40 bg-amber-950/60 px-2.5 py-1 font-mono text-[11px] text-amber-200">
        <i className="ri-time-line mr-1" />
        {art.registeredAgo(6)}
      </span>
    </div>
  );
}

function EncryptionArt() {
  const { t } = useI18n();
  const link = <span className="ml-5 block h-3 w-px bg-cyan-500/40" />;
  const cert = 'inline-flex self-start items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/90 px-3 py-1.5 font-mono text-xs text-zinc-300';

  return (
    <div className="flex h-full flex-col justify-center px-6">
      <span className={cert}><i className="ri-medal-line text-cyan-400" />Root CA</span>
      {link}
      <span className={cert}><i className="ri-medal-line text-cyan-400" />R11</span>
      {link}
      <span className={`${cert} border-emerald-400/40 text-zinc-100`}>
        <i className="ri-lock-fill text-emerald-400" />shop.example
        <span className="whitespace-nowrap rounded bg-emerald-500/15 px-1.5 text-[10px] text-emerald-300">TLS 1.3</span>
      </span>
      <span className="mt-2 ml-1 font-mono text-[11px] text-emerald-300/90">{t.landing.hero.xray.validFor(63)}</span>
    </div>
  );
}

function HeadersArt() {
  const rows = [
    ['content-security-policy', pass],
    ['x-frame-options', pass],
    ['strict-transport-security', fail],
    ['referrer-policy', warn],
    ['permissions-policy', pass],
  ] as const;

  return (
    <div className="flex h-full items-center px-6">
      <ul className="w-full max-w-sm space-y-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/70 p-3 font-mono text-[11px] text-cyan-300/90">
        {rows.map(([name, mark]) => (
          <li key={name} className="flex items-center justify-between gap-3">
            <span className="truncate">{name}:</span>
            {mark}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CookiesArt() {
  const flags = [
    ['HttpOnly', true],
    ['Secure', true],
    ['SameSite', false],
  ] as const;

  return (
    <div className="flex h-full flex-col justify-center gap-4 px-6">
      <p className="font-mono text-sm text-zinc-300">
        <span className="text-cyan-400">set-cookie:</span> sid=…
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {flags.map(([flag, on]) => (
          <li key={flag} className={`flex items-center gap-2 font-mono text-xs ${on ? 'text-zinc-200' : 'text-red-300'}`}>
            <span className={`relative h-4 w-7 rounded-full ${on ? 'bg-emerald-500/70' : 'bg-zinc-700'}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white ${on ? 'right-0.5' : 'left-0.5'}`} />
            </span>
            {flag}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExposureArt() {
  const { t } = useI18n();
  const art = t.landing.checks.art;

  return (
    <div className="flex h-full flex-col justify-center gap-3 px-6 font-mono text-[11px]">
      <div className="flex max-w-sm flex-wrap items-center gap-2">
        <span className="text-zinc-300"><span className="text-cyan-400">server:</span> nginx/1.18.0</span>
        <i className="ri-arrow-right-line text-zinc-500" />
        <span className="rounded-full border border-amber-400/40 bg-amber-950/60 px-2 py-0.5 text-amber-200">NVD · {art.cve}</span>
      </div>
      <div className="max-w-sm rounded-lg border border-zinc-800/80 bg-zinc-900/70 p-2.5 text-zinc-400">
        <p className="text-cyan-400">/sitemap.xml <span className="text-zinc-500">· {art.exposed}</span></p>
        <p className="pl-3">/products/</p>
        <p className="pl-3 text-amber-200">/admin/ {warn}</p>
        <p className="pl-3 text-amber-200">/backup.zip {warn}</p>
      </div>
    </div>
  );
}

const ART: Record<GroupKey, () => React.ReactElement> = {
  phishing: PhishingArt,
  encryption: EncryptionArt,
  headers: HeadersArt,
  cookies: CookiesArt,
  exposure: ExposureArt,
};

export default function ChecksSection() {
  const { t } = useI18n();
  const copy = t.landing.checks;

  return (
    <section id={FEATURES_SECTION_ID} className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="max-w-2xl mb-8 sm:mb-10">
          <h2
            id={FEATURES_HEADING_ID}
            tabIndex={-1}
            className="text-3xl sm:text-4xl font-bold text-white mb-4 focus:outline-none"
          >
            {copy.title}
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">{copy.body}</p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHECK_GROUPS.map((group) => {
            const area = copy.groups[group.key];
            const Art = ART[group.key];
            return (
              <li
                key={group.key}
                className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-500/30 ${group.span}`}
                style={{ backgroundColor: 'rgba(9, 9, 11, 0.6)' }}
              >
                {/* What the area looks like in a scan */}
                <div
                  aria-hidden="true"
                  className="relative h-36 sm:h-44 overflow-hidden border-b border-zinc-800/60 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-size-[22px_22px]"
                >
                  <Art />
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="flex items-center gap-2.5 text-lg font-semibold text-white">
                    <i className={`${group.icon} text-cyan-400`} aria-hidden="true"></i>
                    {area.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{area.body}</p>

                  <ul className="mt-auto flex flex-wrap gap-2 pt-5">
                    {group.tests.map((test) => (
                      <li
                        key={test}
                        className="px-2.5 py-1 rounded-md border border-zinc-700/60 bg-zinc-900/60 font-mono text-xs text-zinc-300"
                      >
                        {t.scan.testsShort[test] ?? test}
                      </li>
                    ))}
                    <li className="px-2.5 py-1 rounded-md border border-dashed border-zinc-700/60 text-xs text-zinc-400">
                      <i className="ri-more-line" aria-hidden="true"></i>
                      <span className="sr-only">{copy.more}</span>
                    </li>
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
          <span>{copy.growing}</span>
          <a
            href={DOCS.engine}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {copy.fullList}
            <i className="ri-arrow-right-up-line text-xs" aria-hidden="true"></i>
            <span className="sr-only"> {t.common.opensInNewTab}</span>
          </a>
        </p>
      </div>
    </section>
  );
}
