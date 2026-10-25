"use client";

import { motion, useReducedMotion } from 'framer-motion';

import Footer from './Footer';
import { HeroBackdrop } from './HeroSection';
import SiteHeader from './SiteHeader';
import { MAIN_CONTENT_ID } from './ui/SkipLink';
import { entrance } from './ui/entrance';
import { CONTACT_EMAIL } from '@/app/config/constants';
import { LEGAL_UPDATED, OPERATOR } from '@/app/config/legal';
import { useI18n } from '@/app/i18n/I18nProvider';

type Page = 'privacy' | 'terms' | 'security';

/**
 * Fills a paragraph's {name}, {address}, {email} and {hosting} from the
 * operator config. A detail not filled in yet shows as a highlighted mark, so
 * the page cannot go out looking finished without it.
 */
function Filled({ text }: { text: string }) {
  const { t } = useI18n();
  return (
    <>
      {text.split(/(\{(?:name|address|email|hosting)\})/).map((part, index) => {
        const field = part.match(/^\{(\w+)\}$/)?.[1];
        if (!field) return part;
        if (field === 'email') {
          return (
            <a key={index} href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
              {CONTACT_EMAIL}
            </a>
          );
        }
        const key = field as 'name' | 'address' | 'hosting';
        return OPERATOR[key] || (
          <mark key={index} className="rounded bg-amber-400/15 px-1 text-amber-200">
            [{t.legal.toFill(t.legal.fields[key])}]
          </mark>
        );
      })}
    </>
  );
}

/** The privacy policy, the terms or the security page: headed sections of plain text. */
export default function LegalPage({ page }: { page: Page }) {
  const { t, format } = useI18n();
  const copy = t.legal[page];
  // The same entrance as the pricing page: the title block, then each section
  // as it scrolls into view.
  const { container, item } = entrance(useReducedMotion());

  return (
    <div className="marketing-surface min-h-screen overflow-x-clip text-white" style={{ backgroundColor: '#09090b' }}>
      <SiteHeader />

      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="focus:outline-none">
        <section className="relative">
          <HeroBackdrop gridSize="bg-size-[120px_120px]" />
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-16 sm:pb-10">
            <motion.div className="max-w-3xl mx-auto" variants={container} initial="hidden" animate="show">
              <motion.h1 variants={item} className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                {copy.title}
              </motion.h1>
              <motion.p variants={item} className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed">
                {copy.intro}
              </motion.p>
              <motion.p variants={item} className="mt-4 font-mono text-xs text-zinc-500">
                {t.legal.updated(format.date(LEGAL_UPDATED))}
              </motion.p>
            </motion.div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="max-w-3xl mx-auto">
            {copy.sections.map((section, index) => (
              <motion.section
                key={section.heading}
                className="border-t border-zinc-800 py-8"
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                <h2 className="flex items-baseline gap-3 text-xl font-semibold text-white">
                  <span className="font-mono text-sm text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-zinc-300 leading-relaxed">
                  {section.body.map((block, blockIndex) =>
                    typeof block === 'string' ? (
                      <p key={blockIndex}>
                        <Filled text={block} />
                      </p>
                    ) : (
                      <ul key={blockIndex} className="space-y-2">
                        {block.list.map((entry) => (
                          <li key={entry} className="relative pl-5">
                            <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-px w-2.5 bg-zinc-600" />
                            <Filled text={entry} />
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
