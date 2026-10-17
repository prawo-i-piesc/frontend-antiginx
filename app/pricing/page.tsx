"use client";

import { useId } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import Footer from '../components/Footer';
import { HeroBackdrop } from '../components/HeroSection';
import { SCANNER_SECTION_ID } from '../components/ScannerSection';
import SiteHeader from '../components/SiteHeader';
import { MAIN_CONTENT_ID } from '../components/ui/SkipLink';
import { useI18n } from '../i18n/I18nProvider';

export default function PricingPage() {
  const { t } = useI18n();
  const copy = t.pricing;
  const plansHeadingId = useId();

  const plans = [
    { id: 'free', ...copy.plans.free, price: '$0', period: copy.perMonth, href: '/register', popular: false },
    { id: 'pro', ...copy.plans.pro, price: '$29', period: copy.perMonth, href: '/register', popular: true },
    // There is no sales contact yet, so "Contact sales" has nowhere to go.
    { id: 'enterprise', ...copy.plans.enterprise, href: null, popular: false },
  ];

  return (
    <div className="marketing-surface min-h-screen text-white" style={{ backgroundColor: '#09090b' }}>
      <SiteHeader />

      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="focus:outline-none">
        {/* Hero Section; with the site header above it, at least 45% of the screen (header: 4.5rem, 5.5rem from lg) */}
        <section className="relative min-h-[calc(45vh-4.5rem)] lg:min-h-[calc(45vh-5.5rem)] flex flex-col">
          <HeroBackdrop gridSize="bg-size-[120px_120px]" />

          {/* Hero Content */}
          <div className="relative z-10 pb-20 mt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center pt-10">
            <div className="mb-0">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-linear-to-r from-zinc-200 to-zinc-300 bg-clip-text text-transparent mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {copy.title.lead} <span className="bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">{copy.title.highlight}</span> {copy.title.tail}
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              >
                {copy.intro}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section
          aria-labelledby={plansHeadingId}
          className="relative py-4 pb-8 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: '#09090b' }}
        >
          <h2 id={plansHeadingId} className="sr-only">{copy.plansHeading}</h2>

          <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
            <ul className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan, index) => {
                const actionClass = `block w-full text-center py-3 px-6 rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                  plan.popular
                    ? 'bg-cyan-700 text-white hover:bg-cyan-800 shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_0_rgba(6,182,212,0.35)]'
                    : 'bg-zinc-800/80 text-white hover:bg-zinc-700/80 border border-zinc-700/50'
                }`;

                return (
                  <motion.li
                    key={plan.id}
                    className={`relative rounded-2xl p-8 lg:p-10 ${
                      plan.popular
                        ? 'bg-zinc-900/60 border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-sm scale-105 hover:scale-108'
                        : 'bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm hover:scale-102'
                    } hover:shadow-[0_0_50px_rgba(6,182,212,0.2)]`}
                    style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      {/* After the name in reading order; drawn on the card's top edge. */}
                      {plan.popular && (
                        <p className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-cyan-700 to-cyan-800 text-white text-xs font-bold uppercase whitespace-nowrap rounded-full shadow-lg">
                          {copy.mostPopular}
                        </p>
                      )}
                      <p className="text-zinc-400 text-sm">{plan.description}</p>
                    </div>

                    <div className="mb-8">
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-5xl font-bold text-white">{plan.price}</span>
                        {plan.period && (
                          <span className="text-zinc-400">{plan.period}</span>
                        )}
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-cyan-500 mr-3 mt-0.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-zinc-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.href ? (
                      <Link href={plan.href} className={actionClass}>
                        {plan.cta}
                      </Link>
                    ) : (
                      <button type="button" className={actionClass}>
                        {plan.cta}
                      </button>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/30" style={{ backgroundColor: '#09090b' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-zinc-200">
              {copy.faq.title.lead} <span className="bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">{copy.faq.title.highlight}</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {copy.faq.items.map((item) => (
                <div
                  key={item.question}
                  className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{item.question}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#09090b' }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(6,182,212,0.1),transparent)]" style={{ zIndex: 0 }}></div>

          <div className="max-w-4xl mx-auto text-center relative" style={{ zIndex: 1 }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-200 mb-4 sm:mb-6">
              {copy.cta.title.lead} <span className="bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">{copy.cta.title.highlight}</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
              {copy.cta.body}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-cyan-700 text-white rounded-full hover:bg-cyan-800 transition-all duration-200 font-semibold shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_0_rgba(6,182,212,0.35)] whitespace-nowrap cursor-pointer text-sm sm:text-base"
              >
                {copy.cta.trial}
              </Link>
              <Link
                href={`/#${SCANNER_SECTION_ID}`}
                className="px-8 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 font-semibold border border-white/20 hover:border-white/40 backdrop-blur-sm whitespace-nowrap cursor-pointer text-sm sm:text-base"
              >
                {copy.cta.scanner}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
