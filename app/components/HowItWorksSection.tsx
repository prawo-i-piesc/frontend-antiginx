"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

import { REDUCED_MOTION_QUERY, useMediaQuery } from '@/app/hooks/useMediaQuery';
import { useI18n } from '@/app/i18n/I18nProvider';

export const HOW_SECTION_ID = 'how-it-works';
export const HOW_HEADING_ID = 'how-it-works-heading';

const STEPS = ['submit', 'run', 'result'] as const;

/**
 * The engine's three phases as tracks (docs/App/SiteTests in engine-antiginx):
 * PreResponse tests need only the target URL, Response tests read the fetched
 * page, Structure tests open their own connection.
 */
type Lane = 'address' | 'response' | 'own';

const LANE_CLASS: Record<Lane, string> = {
  address: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
  response: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
  own: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300',
};
const LANE_DOT: Record<Lane, string> = {
  address: 'bg-cyan-400',
  response: 'bg-violet-400',
  own: 'bg-fuchsia-400',
};

const STATUS = {
  pass: 'ri-checkbox-circle-fill text-emerald-400',
  warn: 'ri-error-warning-fill text-amber-300',
  fail: 'ri-close-circle-fill text-red-400',
};

/**
 * A made-up scan of shop.example, matching the hero's X-ray. The address and
 * own-connection tracks report before the page answers; the page's tests
 * follow its response. `note` names a key of the hero's findings, or `cookie`.
 */
const COMMAND = 'antiginx scan shop.example';
const LINES = [
  { kind: 'info' },
  { kind: 'test', lane: 'address', test: 'phishing-url', status: 'pass' },
  { kind: 'test', lane: 'own', test: 'ssl-cert', status: 'pass', note: 'tls' },
  { kind: 'test', lane: 'address', test: 'dns-reputation', status: 'pass', note: 'domain' },
  { kind: 'fetch', lane: 'response' },
  { kind: 'test', lane: 'response', test: 'hsts', status: 'fail', note: 'hsts' },
  { kind: 'test', lane: 'response', test: 'serv-h-a', status: 'warn', note: 'server' },
  { kind: 'test', lane: 'response', test: 'cookie-sec', status: 'warn', note: 'cookie' },
  { kind: 'test', lane: 'response', test: 'csp', status: 'pass' },
  { kind: 'test', lane: 'own', test: 'sitemap', status: 'pass' },
  { kind: 'more' },
] as const;
const THREAT_LEVEL = 38;

/** Milliseconds: before typing, per character, after the command, per line, before the result. */
const TIMING = { start: 300, char: 28, afterCommand: 250, line: 260, result: 450 };

function LaneTag({ lane, label }: { lane: Lane; label: string }) {
  return (
    <>
      <span className={`hidden sm:inline-block w-24 shrink-0 rounded border px-1.5 text-center text-[11px] leading-5 ${LANE_CLASS[lane]}`}>
        {label}
      </span>
      <span className={`sm:hidden mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${LANE_DOT[lane]}`} />
    </>
  );
}

export default function HowItWorksSection() {
  const { t } = useI18n();
  const copy = t.landing.how;
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inView = useInView(terminalRef, { once: true, amount: 0.4 });
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);

  // Plays the scan once the terminal is in view (about four seconds), and again on "Replay".
  useEffect(() => {
    if (reduced || !inView) return;
    const timers: number[] = [];
    const at = (ms: number, step: () => void) => timers.push(window.setTimeout(step, ms));
    let time = TIMING.start;
    for (let i = 1; i <= COMMAND.length; i++) at((time += TIMING.char), () => setTyped(i));
    time += TIMING.afterCommand;
    for (let i = 1; i <= LINES.length; i++) at((time += TIMING.line), () => setShown(i));
    at((time += TIMING.result), () => setDone(true));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [inView, reduced, run]);

  const replay = () => {
    setTyped(0);
    setShown(0);
    setDone(false);
    setRun((count) => count + 1);
  };

  // With reduced motion the whole scan shows at once.
  const typedCount = reduced ? COMMAND.length : typed;
  const shownCount = reduced ? LINES.length : shown;
  const finished = reduced || done;
  /** -1 before the playback, then the step it is at. */
  const phase = finished ? 2 : typedCount === COMMAND.length ? 1 : typedCount > 0 ? 0 : -1;
  // The line from each step number to the next fills as the scan goes: the
  // first while the command is typed, the second while the tests come in.
  const links = [
    phase >= 1 ? 1 : typedCount / COMMAND.length,
    finished ? 1 : phase === 1 ? shownCount / LINES.length : 0,
  ];

  const findings = t.landing.hero.xray.findings;
  const noteText = (note: string) => (note === 'cookie' ? copy.terminal.cookie : findings[note as keyof typeof findings]);

  return (
    <section id={HOW_SECTION_ID} className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-160 h-160 bg-[radial-gradient(closest-side,rgba(139,92,246,0.22),transparent_70%)] rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 id={HOW_HEADING_ID} tabIndex={-1} className="text-3xl sm:text-4xl font-bold text-white mb-4 focus:outline-none">
            {copy.title}
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">{copy.body}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-12 items-start">
          {/* The steps, lit up in step with the terminal */}
          <ol>
            {STEPS.map((step, index) => {
              const state = phase > index || (finished && index === 2) ? 'done' : phase === index ? 'active' : 'next';
              return (
                <li key={step} className="relative flex gap-5 pb-10 last:pb-0">
                  {index < links.length && (
                    <span aria-hidden="true" className="absolute left-5 top-10 bottom-0 -translate-x-1/2 w-px bg-zinc-800">
                      <motion.span
                        className="absolute inset-x-0 top-0 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                        animate={{ height: `${links[index] * 100}%` }}
                        transition={{ duration: 0.3, ease: 'linear' }}
                      />
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-sm transition-all duration-300 ${
                      state === 'done'
                        ? 'border-cyan-400 bg-cyan-400 text-zinc-950'
                        : state === 'active'
                          ? 'border-cyan-400 bg-zinc-950 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.5)]'
                          : 'border-zinc-700 bg-zinc-950 text-zinc-400'
                    }`}
                  >
                    {state === 'done' ? <i className="ri-check-line text-base" /> : index + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${state === 'next' ? 'text-zinc-300' : 'text-white'}`}>
                      {copy.steps[step].title}
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">{copy.steps[step].body}</p>
                    {step === 'run' && (
                      <ul className="mt-3 space-y-2">
                        {(['address', 'response', 'own'] as const).map((lane) => (
                          <li key={lane} className="flex items-center gap-3 text-sm text-zinc-400">
                            <span className={`w-24 shrink-0 rounded border px-1.5 text-center font-mono text-[11px] leading-5 ${LANE_CLASS[lane]}`}>
                              {copy.lanes[lane].tag}
                            </span>
                            {copy.lanes[lane].note}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The terminal playing the scan back */}
          <div>
            <div
              ref={terminalRef}
              role="img"
              aria-label={copy.terminal.label}
              className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-[0_40px_120px_-40px_rgba(6,182,212,0.45)] backdrop-blur-xl"
            >
              <div className="relative flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="absolute inset-x-0 text-center font-mono text-xs text-zinc-500">{copy.terminal.title}</span>
              </div>

              <div className="min-h-104 p-4 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-6 text-zinc-300">
                <p>
                  <span className="text-cyan-400">$</span> {COMMAND.slice(0, typedCount)}
                  {phase === 0 && <span className="ml-px inline-block h-4 w-2 translate-y-0.5 bg-cyan-300" />}
                </p>

                {LINES.slice(0, shownCount).map((line, index) => (
                  <motion.div
                    key={index}
                    initial={reduced ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2 sm:gap-3"
                  >
                    {line.kind === 'info' && <p className="text-zinc-500">→ {copy.terminal.queued}</p>}
                    {line.kind === 'more' && <p className="text-zinc-500">{copy.terminal.more}</p>}
                    {line.kind === 'fetch' && (
                      <>
                        <LaneTag lane={line.lane} label={copy.lanes[line.lane].tag} />
                        <p className="text-zinc-400">{copy.terminal.fetch}</p>
                      </>
                    )}
                    {line.kind === 'test' && (
                      <>
                        <LaneTag lane={line.lane} label={copy.lanes[line.lane].tag} />
                        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                          <span className="shrink-0">{t.scan.testsShort[line.test] ?? line.test}</span>
                          <span className="mb-1 min-w-4 flex-1 border-b border-dotted border-zinc-700" />
                          <span className="flex shrink-0 items-center gap-1.5">
                            {'note' in line && (
                              <span className={line.status === 'pass' ? 'text-emerald-300/90' : line.status === 'warn' ? 'text-amber-200' : 'text-red-300'}>
                                {noteText(line.note)}
                              </span>
                            )}
                            <i className={STATUS[line.status]} />
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}

                {finished && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
                  >
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-emerald-400">✓ {copy.terminal.done}</span>
                      <span className="text-zinc-500">·</span>
                      <span>{copy.terminal.threat}</span>
                      <span className="font-semibold text-amber-200">
                        {THREAT_LEVEL}% · {t.landing.threatMeter.verdicts.caution}
                      </span>
                    </p>
                    <div className="relative mt-3 h-1.5 rounded-full bg-linear-to-r from-emerald-400 via-amber-300 to-red-500">
                      <motion.span
                        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-950 bg-white shadow"
                        initial={reduced ? false : { left: '0%' }}
                        animate={{ left: `${THREAT_LEVEL}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {!reduced && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={replay}
                  disabled={!finished}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-zinc-400 hover:text-cyan-300 disabled:invisible transition-colors"
                >
                  <i className="ri-restart-line" aria-hidden="true"></i>
                  {copy.terminal.replay}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
