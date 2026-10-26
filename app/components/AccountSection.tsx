"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useI18n } from '@/app/i18n/I18nProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { PRIMARY_BUTTON } from './ui/buttonStyles';

const ACCOUNT_ITEMS = ['pick', 'schedule', 'history', 'charts', 'security'] as const;

const buttonClass =
  'inline-flex items-center justify-center px-5 sm:px-8 py-2.5 sm:py-3 rounded-full border-2 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-200';

/** A domain's threat level across its scans, falling as the issues get fixed. */
const CHART = [68, 61, 64, 47, 39, 41, 26, 18, 12];
const CHART_POINTS = CHART.map((level, i) => [(i * 300) / (CHART.length - 1), 104 - level * 1.3] as const);
const CHART_LINE = CHART_POINTS.map(([x, y]) => `${x},${y}`).join(' ');

/** Text colour of a threat level, with the threat meter's thresholds. */
export function levelClass(level: number) {
  if (level < 30) return 'text-emerald-400';
  if (level < 70) return 'text-amber-300';
  return 'text-red-400';
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
    <div aria-hidden="true">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
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
            <line x1="0" x2="300" y1={104 - 30 * 1.3} y2={104 - 30 * 1.3} stroke="rgb(63,63,70)" strokeDasharray="3 4" />
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
              <span className={`ml-auto font-mono text-xs ${levelClass(scan.level)}`}>
                {scan.level}%
              </span>
            </li>
          ))}
        </ul>

        {/* Schedule */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 px-3 py-2.5">
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
      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{copy.title}</h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">{copy.body}</p>

          <ul className="mt-7 border-b border-zinc-800">
            {ACCOUNT_ITEMS.map((item) => (
              <li key={item} className="border-t border-zinc-800 py-3 text-zinc-200">
                {copy.items[item]}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            {copy.more}
            <span className="sr-only">: {copy.moreContext}</span>
            <i className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"></i>
          </Link>

          {/* The mascot, pointing at the sign-up button, on one row with it and the pricing link */}
          <div className="mt-8 sm:mt-10 flex items-center gap-2.5 sm:gap-5">
            <Image src="/logo404.png" alt="" width={525} height={254} className="w-12 sm:w-28 h-auto shrink-0" />
            <Link
              href={signedIn ? '/dashboard' : '/register'}
              className={`${buttonClass} shrink-0 ${PRIMARY_BUTTON}`}
            >
              {signedIn ? copy.dashboard : copy.register}
            </Link>
            <Link
              href="/pricing"
              className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-semibold text-sm sm:text-base text-zinc-300 hover:text-cyan-300 transition-colors duration-200"
            >
              {copy.pricing}
              <i
                className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              ></i>
            </Link>
          </div>
        </div>

        <DashboardMock />
      </div>
    </section>
  );
}
