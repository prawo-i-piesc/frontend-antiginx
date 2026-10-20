"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useI18n } from '@/app/i18n/I18nProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { PRIMARY_BUTTON } from './ui/buttonStyles';

const ACCOUNT_ITEMS = ['pick', 'schedule', 'history', 'charts', 'security'] as const;

const buttonClass =
  'inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border-2 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-200';

/** A domain's threat level across its scans, falling as the issues get fixed. */
const CHART = [68, 61, 64, 47, 39, 41, 26, 18, 12];
const CHART_POINTS = CHART.map((level, i) => [(i * 300) / (CHART.length - 1), 104 - level * 1.3] as const);
const CHART_LINE = CHART_POINTS.map(([x, y]) => `${x},${y}`).join(' ');
const CHART_AREA = `M0,110 ${CHART_POINTS.map(([x, y]) => `L${x},${y}`).join(' ')} L300,110 Z`;

/** Colour of a threat level, with the threat meter's thresholds. */
export function levelClass(level: number) {
  if (level < 30) return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300';
  if (level < 70) return 'border-amber-400/40 bg-amber-500/10 text-amber-200';
  return 'border-red-400/40 bg-red-500/10 text-red-300';
}

/** A made-up dashboard, on example domains, of what an account adds. */
function DashboardMock() {
  const { t } = useI18n();
  const mock = t.landing.account.mock;
  const recent = [
    { host: 'shop.example', when: mock.today, level: 12 },
    { host: 'blog.example', when: mock.yesterday, level: 41 },
    { host: 'api.example', when: mock.daysAgo(3), level: 7 },
  ];
  const [lastX, lastY] = CHART_POINTS[CHART_POINTS.length - 1];

  return (
    <div aria-hidden="true" className="lg:transform-[perspective(1400px)_rotateY(-10deg)_rotateX(4deg)]">
      <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4 sm:p-5 shadow-[0_40px_100px_-30px_rgba(6,182,212,0.4)] backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <span className="text-sm font-semibold text-white">{mock.dashboard}</span>
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
          </span>
        </div>

        {/* Threat level over time */}
        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
          <p className="font-mono text-[11px] text-zinc-400">{mock.chart}</p>
          <svg viewBox="0 0 300 110" className="mt-2 w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="account-chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" x2="300" y1={104 - 30 * 1.3} y2={104 - 30 * 1.3} stroke="rgb(63,63,70)" strokeDasharray="3 4" />
            <path d={CHART_AREA} fill="url(#account-chart-fill)" />
            <motion.polyline
              points={CHART_LINE}
              fill="none"
              stroke="rgb(34,211,238)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
            <circle cx={lastX} cy={lastY} r="4" fill="rgb(52,211,153)" stroke="rgb(9,9,11)" strokeWidth="2" />
          </svg>
        </div>

        {/* Recent scans */}
        <p className="mt-4 font-mono text-[11px] text-zinc-400">{mock.recent}</p>
        <ul className="mt-2 divide-y divide-zinc-800/80">
          {recent.map((scan) => (
            <li key={scan.host} className="flex items-center gap-3 py-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 font-mono text-xs uppercase text-zinc-300">
                {scan.host[0]}
              </span>
              <span className="font-mono text-xs text-zinc-200">{scan.host}</span>
              <span className="text-[11px] text-zinc-500">{scan.when}</span>
              <span className={`ml-auto rounded-full border px-2 py-0.5 font-mono text-[11px] ${levelClass(scan.level)}`}>
                {scan.level}%
              </span>
            </li>
          ))}
        </ul>

        {/* Schedule */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5">
          <i className="ri-calendar-schedule-line text-cyan-400" />
          <span className="text-xs font-semibold text-white">{mock.schedule}</span>
          <span className="min-w-0 truncate font-mono text-[11px] text-zinc-400">{mock.weekly}</span>
          <span className="relative ml-auto h-4 w-7 shrink-0 rounded-full bg-cyan-500/70">
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AccountSection() {
  const { t } = useI18n();
  const copy = t.landing.account;
  const auth = useAuth();
  const signedIn = Boolean(auth?.initialized && auth?.authenticated);

  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.4),rgba(6,182,212,0.2),transparent_50%)] rounded-full blur-4xl opacity-30" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{copy.title}</h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">{copy.body}</p>

          <ul className="mt-7 space-y-3">
            {ACCOUNT_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-200">
                <i className="ri-check-line mt-0.5 text-cyan-400" aria-hidden="true"></i>
                {copy.items[item]}
              </li>
            ))}
            <li>
              <Link href="/pricing" className="group inline-flex items-center gap-3 font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                <i className="ri-add-line text-cyan-400" aria-hidden="true"></i>
                {copy.more}
                <span className="sr-only">: {copy.moreContext}</span>
                <i className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"></i>
              </Link>
            </li>
          </ul>

          <div className="mt-8 sm:mt-10 flex items-center gap-4">
            {/* The mascot, pointing at the sign-up button */}
            <Image src="/logo404.png" alt="" width={525} height={254} className="hidden sm:block w-28 h-auto shrink-0" />
            <div className="flex min-w-0 flex-1 flex-wrap gap-3">
              <Link
                href={signedIn ? '/dashboard' : '/register'}
                className={`${buttonClass} ${PRIMARY_BUTTON}`}
              >
                {signedIn ? copy.dashboard : copy.register}
              </Link>
              <Link
                href="/pricing"
                className={`${buttonClass} border-white/30 text-white hover:bg-white/10 hover:border-white/50`}
              >
                {copy.pricing}
              </Link>
            </div>
          </div>
        </div>

        <DashboardMock />
      </div>
    </section>
  );
}
