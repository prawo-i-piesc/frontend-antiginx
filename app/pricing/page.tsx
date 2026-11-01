"use client";

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

import Footer from '../components/Footer';
import { HeroBackdrop } from '../components/HeroSection';
import { SCANNER_SECTION_ID } from '../components/ScannerSection';
import SiteHeader from '../components/SiteHeader';
import { MAIN_CONTENT_ID } from '../components/ui/SkipLink';
import { PRIMARY_BUTTON } from '../components/ui/buttonStyles';
import { entrance } from '../components/ui/entrance';
import { CONTACT_EMAIL, DOCS_URL } from '../config/constants';
import { levelClass } from '../components/AccountSection';
import { useI18n } from '../i18n/I18nProvider';
import { ApiError } from '../lib/authErrors';
import { checkoutUrl, getBilling } from '../lib/billingApi';
import useApiQuery from '../hooks/useApiQuery';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../providers/ToastProvider';

const PLANS = ['free', 'pro', 'enterprise'] as const;
type Plan = (typeof PLANS)[number];

/** A small piece of the app above each plan, showing what the plan adds. */
type ArtProps = { delay: number; reduced: boolean | null };

const panel = 'w-full max-w-68 rounded-lg border border-white/10 bg-zinc-900/90 p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)]';

/** Appears a moment after the card, one piece after another. */
function staggered(reduced: boolean | null, delay: number) {
  return (index: number, gap = 0.12) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 4 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay: delay + index * gap },
        };
}

/** Free: your scans in one place. */
function FreeArt({ delay, reduced }: ArtProps) {
  const { t } = useI18n();
  const mock = t.landing.account.mock;
  const step = staggered(reduced, delay);
  const scans = [
    { host: 'shop.example', when: mock.today, level: 12 },
    { host: 'blog.example', when: mock.yesterday, level: 41 },
    { host: 'api.example', when: mock.daysAgo(3), level: 7 },
  ];

  return (
    <div className={panel}>
      <p className="font-mono text-[10px] text-zinc-500">{mock.recent}</p>
      <ul className="mt-2 space-y-1.5">
        {scans.map((scan, index) => (
          <motion.li key={scan.host} {...step(index)} className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 font-mono text-[10px] uppercase text-zinc-300">
              {scan.host[0]}
            </span>
            <span className="font-mono text-[11px] text-zinc-200">{scan.host}</span>
            <span className="text-[10px] text-zinc-500">{scan.when}</span>
            <span className={`ml-auto font-mono text-[11px] ${levelClass(scan.level)}`}>{scan.level}%</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Pro: scans on a schedule, and the premium tests. */
const SCHEDULED_DAYS = [0, 2, 4];

function ProArt({ delay, reduced }: ArtProps) {
  const { t } = useI18n();
  const art = t.pricing.art;
  const step = staggered(reduced, delay);

  return (
    <div className={panel}>
      <p className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
        <i className="ri-calendar-schedule-line text-cyan-400" />
        {art.schedule} · shop.example
      </p>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {art.days.map((day, index) => (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-zinc-500">{day}</span>
            {SCHEDULED_DAYS.includes(index) ? (
              <motion.span {...step(index, 0.08)} className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full border border-zinc-700" />
            )}
          </div>
        ))}
      </div>
      <motion.div
        {...step(7, 0.08)}
        className="mt-3 flex items-center gap-1.5 rounded-md border border-cyan-500/25 bg-cyan-500/5 px-2 py-1.5"
      >
        <i className="ri-vip-diamond-line text-xs text-cyan-300" />
        <span className="text-[11px] text-white">{art.premium}</span>
        <span className="ml-auto font-mono text-[10px] text-emerald-300">{art.unlocked}</span>
      </motion.div>
    </div>
  );
}

/** Enterprise: a private instance, and how long it keeps results. */
function EnterpriseArt({ delay, reduced }: ArtProps) {
  const { t } = useI18n();
  const art = t.pricing.art;
  const step = staggered(reduced, delay);

  return (
    <div className={panel}>
      <motion.div {...step(0)} className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-500/25 bg-cyan-500/10">
          <i className="ri-lock-2-line text-sm text-cyan-300" />
        </span>
        <span>
          <span className="block text-[11px] text-white">{art.instance}</span>
          <span className="block font-mono text-[10px] text-zinc-500">{art.org}</span>
        </span>
      </motion.div>
      <div className="mt-3 space-y-1.5 border-t border-white/5 pt-2.5 font-mono text-[10.5px]">
        <motion.p {...step(1)} className="flex items-center justify-between gap-2">
          <span className="text-zinc-400">{art.retention}</span>
          <span className="inline-flex items-center gap-1 rounded border border-zinc-700 px-1.5 text-zinc-200">
            {art.retentionValue}
            <i className="ri-arrow-down-s-line text-zinc-500" />
          </span>
        </motion.p>
        <motion.p {...step(2)} className="flex items-center justify-between gap-2">
          <span className="text-zinc-400">{art.limits}</span>
          <span className="text-zinc-200">{art.limitsValue}</span>
        </motion.p>
      </div>
    </div>
  );
}

const ART: Record<Plan, (props: ArtProps) => React.ReactElement> = {
  free: FreeArt,
  pro: ProArt,
  enterprise: EnterpriseArt,
};

const buttonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors duration-200';

export default function PricingPage() {
  const { t } = useI18n();
  const copy = t.pricing;
  const auth = useAuth();
  const signedIn = Boolean(auth?.initialized && auth?.authenticated);
  const onPro = signedIn && auth?.user?.plan === 'pro';
  const router = useRouter();
  const toast = useToast();
  const [upgrading, setUpgrading] = useState(false);
  // A server that sells nothing (no Stripe keys) says so here rather than
  // after a click, in an error toast.
  const billing = useApiQuery(signedIn && !onPro ? 'pricing:billing' : null, () => getBilling());
  const billingDisabled = billing.data?.enabled === false;

  // Signed in, Pro goes straight to Stripe; the plan section in the profile is
  // only where someone who already pays ends up.
  const upgrade = async () => {
    if (upgrading) return;
    setUpgrading(true);
    try {
      window.location.href = await checkoutUrl();
    } catch (error) {
      setUpgrading(false);
      if (error instanceof ApiError && error.code === 'ALREADY_SUBSCRIBED') {
        router.push('/dashboard/profile#plan');
        return;
      }
      toast.error(error instanceof ApiError ? error.message : t.common.networkError);
    }
  };
  const plansHeadingId = useId();
  const faqHeadingId = useId();
  // The same entrance as the sign-in card: the title and intro, then the plans,
  // then, as they scroll into view, the questions.
  const reduced = useReducedMotion();
  const intro = entrance(reduced);
  const cards = entrance(reduced, 0.18);
  const below = entrance(reduced);

  return (
    <div className="marketing-surface min-h-screen overflow-x-clip text-white" style={{ backgroundColor: '#09090b' }}>
      <SiteHeader />

      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="focus:outline-none">
        <section className="relative">
          <HeroBackdrop gridSize="bg-size-[120px_120px]" />
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-10 pb-10 sm:pt-16 sm:pb-12">
            <motion.div className="max-w-5xl mx-auto" variants={intro.container} initial="hidden" animate="show">
              <motion.h1 variants={intro.item} className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                {copy.title}
              </motion.h1>
              <motion.p variants={intro.item} className="mt-4 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
                {copy.intro}
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section aria-labelledby={plansHeadingId} className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <h2 id={plansHeadingId} className="sr-only">{copy.plansHeading}</h2>

          <motion.ul
            className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4"
            variants={cards.container}
            initial="hidden"
            animate="show"
          >
            {PLANS.map((planKey, index) => {
              const plan = copy.plans[planKey];
              const pro = planKey === 'pro';
              const previous = index > 0 ? copy.plans[PLANS[index - 1]].name : null;
              const Art = ART[planKey];
              const actionClass = `${buttonClass} ${
                pro
                  ? PRIMARY_BUTTON
                  : 'border-zinc-700 text-white hover:border-zinc-500 hover:bg-white/5'
              }`;

              return (
                <motion.li
                  key={planKey}
                  variants={cards.item}
                  className={`flex flex-col overflow-hidden rounded-2xl border bg-zinc-950/80 ${pro ? 'border-cyan-400/50' : 'border-zinc-800'}`}
                >
                  {/* What the plan adds, as a small piece of the app */}
                  <div
                    aria-hidden="true"
                    className="flex h-44 items-center justify-center border-b border-zinc-800 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-size-[22px_22px] px-6"
                  >
                    <Art delay={0.18 + index * 0.07 + 0.3} reduced={reduced} />
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h3 className={`font-mono text-sm uppercase tracking-[0.2em] ${pro ? 'text-cyan-300' : 'text-zinc-400'}`}>
                      {plan.name}
                    </h3>
                    <p className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {planKey !== 'enterprise' && <span className="font-mono text-sm text-zinc-500">{copy.perMonth}</span>}
                    </p>
                    {/* Two lines tall beside the others, so the buttons below line up */}
                    <p className="mt-2 text-sm leading-5 text-zinc-400 lg:min-h-10">{plan.description}</p>

                    <div className="mt-6">
                      {planKey === 'enterprise' ? (
                        <a
                          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.plans.enterprise.subject)}`}
                          className={actionClass}
                        >
                          <i className="ri-mail-line" aria-hidden="true"></i>
                          {plan.cta}
                        </a>
                      ) : pro && onPro ? (
                        <Link href="/dashboard/profile#plan" className={actionClass}>
                          {copy.yourPlan}
                        </Link>
                      ) : pro && signedIn && billingDisabled ? (
                        <p className={`${actionClass} cursor-default opacity-60`}>{copy.unavailable}</p>
                      ) : pro && signedIn ? (
                        <button
                          type="button"
                          onClick={() => void upgrade()}
                          aria-disabled={upgrading || undefined}
                          className={`${actionClass} aria-disabled:cursor-wait`}
                        >
                          {upgrading && <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>}
                          {plan.cta}
                        </button>
                      ) : (
                        <Link href={planKey === 'free' && signedIn ? '/dashboard' : '/register'} className={actionClass}>
                          {planKey === 'free' && signedIn ? t.landing.account.dashboard : plan.cta}
                        </Link>
                      )}
                    </div>

                    <div className="mt-6 border-t border-zinc-800 pt-6">
                      {previous && <p className="mb-3 text-sm font-medium text-zinc-300">{copy.plus(previous)}</p>}
                      <ul className="space-y-2.5">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-300">
                            <i className="ri-check-line mt-0.5 text-cyan-400" aria-hidden="true"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </section>

        <section aria-labelledby={faqHeadingId} className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
              <h2 id={faqHeadingId} className="text-3xl sm:text-4xl font-bold text-white">{copy.faq.title}</h2>
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-sm text-zinc-400 hover:text-cyan-300 transition-colors"
              >
                {copy.faq.docs}
                <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                <span className="sr-only"> {t.common.opensInNewTab}</span>
              </a>
            </div>

            <motion.dl
              className="grid grid-cols-1 md:grid-cols-2 gap-x-12"
              variants={below.container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {copy.faq.items.map((item) => (
                <motion.div key={item.question} variants={below.item} className="border-t border-zinc-800 py-6">
                  <dt className="font-medium text-white">{item.question}</dt>
                  <dd className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.answer}</dd>
                </motion.div>
              ))}
            </motion.dl>

            <motion.div
              className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-8"
              variants={below.item}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="text-zinc-400">{copy.cta.note}</p>
              <Link
                href={`/#${SCANNER_SECTION_ID}`}
                className="group inline-flex items-center gap-2 font-semibold text-white hover:text-cyan-300 transition-colors"
              >
                {copy.cta.scanner}
                <i className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true"></i>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
