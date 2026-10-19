"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'framer-motion';

import { REDUCED_MOTION_QUERY, useMediaQuery } from '@/app/hooks/useMediaQuery';
import { useI18n } from '@/app/i18n/I18nProvider';

/*
 * An illustration of a scan: a made-up shop at shop.example (a domain reserved
 * for examples, RFC 2606) seen in a browser window tilted in 3D. A scanner beam
 * keeps crossing the page from left to right, and the band around it shows the
 * page X-rayed: the HTTP headers, TLS and DNS the scan reads. Findings float in
 * front of the window at different depths and light up as the beam reaches
 * them. While a real scan runs, the beam goes faster. The window is tilted in
 * 3D only beside the text (lg); on narrower screens it faces the viewer, so it
 * can take the full width.
 *
 * The sweep never ends, so it can be paused (WCAG 2.2.2); it also stops while
 * off screen, and with "reduce motion" the beam just stands over the headers.
 * Sizes are in cqw, so the drawing scales with the width it gets.
 *
 * Three quick clicks on the window send the mascot flying in across the screen.
 * It hits the window, which spins, and for a moment the whole page shows X-rayed.
 */

/** Half the width of the X-rayed band, and of the soft edge around it. */
const BAND = 19;
const EDGE = 6;
/**
 * Beam positions, in percent of the window's width. A pass starts and ends
 * with the whole band off the window, so the jump back to the start is unseen.
 */
const BEAM_START = -(BAND + EDGE + 5);
const BEAM_REST = 23;
const BEAM_END = 100 + BAND + EDGE + 5;
/** Seconds per pass, and between passes, normally and while a scan runs. */
const PASS = { idle: 5.7, scanning: 1.9 };
const PASS_GAP = { idle: 0.4, scanning: 0 };

/** How long the whole page stays X-rayed after the mascot hits it, in seconds. */
const REVEAL_HOLD = 2.6;
const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

type Tone = 'dim' | 'key' | 'val' | 'pass' | 'warn' | 'fail';

const TONE_CLASS: Record<Tone, string> = {
  dim: 'text-cyan-200/40',
  key: 'text-cyan-400',
  val: 'text-zinc-300',
  pass: 'text-emerald-400',
  warn: 'text-amber-300',
  fail: 'text-red-400',
};

type Severity = 'pass' | 'warn' | 'fail';

const SEVERITY = {
  pass: { icon: 'ri-checkbox-circle-fill', box: 'border-emerald-400/50 bg-emerald-950/85 text-emerald-50', mark: 'text-emerald-400', glow: 'bg-emerald-400/40' },
  warn: { icon: 'ri-error-warning-fill', box: 'border-amber-400/50 bg-amber-950/85 text-amber-50', mark: 'text-amber-300', glow: 'bg-amber-400/40' },
  fail: { icon: 'ri-close-circle-fill', box: 'border-red-400/50 bg-red-950/85 text-red-50', mark: 'text-red-400', glow: 'bg-red-500/40' },
} satisfies Record<Severity, { icon: string; box: string; mark: string; glow: string }>;

/**
 * Findings in front of the window, to the right of the rows they are about:
 * `x` in percent of its width (where the beam lights them up), `row` in cqw
 * (level with their row), `z` in px. The tilt lifts whatever stands out of the
 * window, so where the window is tilted each finding sits a little lower, by
 * TILT_LIFT cqw per px it floats out.
 */
const FINDINGS = [
  { key: 'server', severity: 'warn', x: 50, row: 16.8, z: 70 },
  { key: 'hsts', severity: 'fail', x: 58, row: 27, z: 120 },
  { key: 'tls', severity: 'pass', x: 72, row: 39.4, z: 90 },
  { key: 'domain', severity: 'pass', x: 54, row: 58.6, z: 60 },
] as const;
const TILT_LIFT = 0.025;

/** Classes for one block of the shop page, as drawn or as its X-rayed outline. */
const WIRE = 'border border-dashed border-cyan-400/30';

function ShopPage({ wire = false }: { wire?: boolean }) {
  const block = (surface: string) => (wire ? WIRE : surface);

  return (
    <>
      {/* Navigation */}
      <div className={`absolute left-[4cqw] top-[2.4cqw] w-[9cqw] h-[2.4cqw] rounded-[0.6cqw] ${block('bg-zinc-800')}`} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`absolute top-[3cqw] h-[1.2cqw] w-[6cqw] rounded-full ${block('bg-zinc-300')}`}
          style={{ left: `${38 + i * 9}cqw` }}
        />
      ))}
      <div className={`absolute right-[4cqw] top-[2.3cqw] w-[9cqw] h-[2.6cqw] rounded-full ${block('bg-zinc-900')}`} />

      {/* Hero */}
      <div className={`absolute left-[4cqw] top-[9.5cqw] w-[10cqw] h-[1.1cqw] rounded-full ${block('bg-orange-400/70')}`} />
      <div className={`absolute left-[4cqw] top-[12.4cqw] w-[36cqw] h-[3.2cqw] rounded-[0.5cqw] ${block('bg-zinc-800')}`} />
      <div className={`absolute left-[4cqw] top-[16.6cqw] w-[27cqw] h-[3.2cqw] rounded-[0.5cqw] ${block('bg-zinc-800')}`} />
      {[36, 33, 21].map((width, i) => (
        <div
          key={width}
          className={`absolute left-[4cqw] h-[1.2cqw] rounded-full ${block('bg-zinc-300')}`}
          style={{ top: `${22 + i * 2.3}cqw`, width: `${width}cqw` }}
        />
      ))}
      <div className={`absolute left-[4cqw] top-[30.5cqw] w-[13cqw] h-[3.6cqw] rounded-full ${block('bg-orange-500')}`} />
      <div className={`absolute left-[19cqw] top-[30.5cqw] w-[11cqw] h-[3.6cqw] rounded-full ${block('border border-zinc-400')}`} />
      <div className={`absolute left-[48cqw] top-[8.5cqw] w-[48cqw] h-[26cqw] rounded-[1.2cqw] overflow-hidden ${block('bg-linear-to-br from-orange-200 via-rose-200 to-amber-100')}`}>
        <div className={`absolute left-[16cqw] top-[4cqw] w-[16cqw] h-[16cqw] rounded-full ${block('bg-linear-to-br from-orange-400 to-rose-400 shadow-[0_2cqw_4cqw_rgba(0,0,0,0.15)]')}`} />
      </div>

      {/* Products */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="absolute top-[39cqw] w-[21cqw]" style={{ left: `${4 + i * 23}cqw` }}>
          <div className={`h-[12cqw] rounded-[0.8cqw] ${block('bg-zinc-200')}`} />
          <div className={`mt-[1.2cqw] h-[1.2cqw] w-[15cqw] rounded-full ${block('bg-zinc-400')}`} />
          <div className={`mt-[0.9cqw] h-[1.2cqw] w-[7cqw] rounded-full ${block('bg-orange-400/80')}`} />
        </div>
      ))}
    </>
  );
}

function Finding({
  beam,
  reveal,
  finding,
  label,
}: {
  beam: MotionValue<number>;
  reveal: MotionValue<number>;
  finding: (typeof FINDINGS)[number];
  label: string;
}) {
  // 1 with the beam on the finding (or the whole page shown), fading to 0 a band away.
  const lit = useTransform([beam, reveal], ([b, r]: number[]) => Math.max(r, 1 - Math.abs(b - finding.x) / BAND, 0));
  const scale = useTransform(lit, [0, 1], [1, 1.07]);
  const style = SEVERITY[finding.severity];

  return (
    <div
      className="absolute top-(--row) lg:top-[calc(var(--row)+var(--lift))]"
      style={{
        left: `${finding.x}%`,
        '--row': `${finding.row}cqw`,
        '--lift': `${finding.z * TILT_LIFT}cqw`,
        transform: `translate(-50%, -50%) translateZ(${finding.z}px)`,
      } as React.CSSProperties}
    >
      <motion.div style={{ scale }} className="relative">
        <motion.div style={{ opacity: lit }} className={`absolute -inset-2 rounded-full blur-xl ${style.glow}`} />
        <div
          className={`relative flex items-center gap-[0.35em] whitespace-nowrap rounded-full border px-[0.8em] py-[0.35em] text-[clamp(9px,2cqw,14px)] font-medium shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md ${style.box}`}
        >
          <i className={`${style.icon} ${style.mark}`} />
          {label}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Where the mascot flies, in viewport pixels. With room to the left of the
 * window (a wide screen) it comes in from the left, level with the window,
 * over the text. Without it (a phone, where the window starts at the screen's
 * edge) it would stay half off screen that way, so it drops in diagonally from
 * the top-left corner onto the middle of the screen instead, bigger and with a
 * glow so the black mascot shows on the dark page.
 */
function flightPath(box: DOMRect) {
  const fromLeft = box.left > 200;
  const width = fromLeft ? Math.min(150, Math.max(90, box.width * 0.22)) : Math.min(170, Math.max(110, window.innerWidth * 0.28));
  const height = (width * 254) / 525;

  if (fromLeft) {
    const hit = { x: box.left + box.width * 0.06, y: box.top + box.height * 0.45 };
    const contact = { x: hit.x - width * 0.85, y: hit.y - height / 2 };
    return {
      width, height, hit, contact, glow: false,
      start: { x: -width - 40, y: hit.y - 240 },
      peak: { y: hit.y - 300, at: 0.45 },
      approach: { duration: 0.75, ease: [0.55, 0, 1, 0.45] as const, tilt: [-30, 25] },
      rebound: { x: contact.x - 220, peakY: hit.y - 180, duration: 1.1, turn: -400 },
    };
  }

  const hit = { x: Math.max(box.left + box.width * 0.22, window.innerWidth * 0.5), y: box.top + box.height * 0.22 };
  const contact = { x: hit.x - width * 0.75, y: hit.y - height * 0.8 };
  const start = { x: -width - 20, y: Math.min(-height - 20, contact.y - 420) };
  return {
    width, height, hit, contact, start, glow: true,
    peak: { y: start.y + (contact.y - start.y) * 0.35, at: 0.5 },
    approach: { duration: 1, ease: [0.4, 0, 0.9, 0.5] as const, tilt: [-35, 20] },
    rebound: { x: contact.x - 160, peakY: contact.y - 140, duration: 1.3, turn: -420 },
  };
}

export default function XRayPreview({ isScanning }: { isScanning: boolean }) {
  const { t } = useI18n();
  const copy = t.landing.hero.xray;
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const [paused, setPaused] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { margin: '100px' });

  const beam = useMotionValue(BEAM_START);
  /** 0 normally, 1 with the whole page X-rayed. */
  const reveal = useMotionValue(0);
  /** Extra turn of the window, in degrees, when the mascot hits it. */
  const spin = useMotionValue(0);

  const mask = useTransform([beam, reveal], ([b, r]: number[]) => {
    const band = BAND + r * 150;
    return `linear-gradient(90deg, transparent ${b - band - EDGE}%, #000 ${b - band}%, #000 ${b + band}%, transparent ${b + band + EDGE}%)`;
  });
  const beamLeft = useTransform(beam, (b) => `${b}%`);
  const beamOpacity = useTransform(reveal, [0, 1], [1, 0]);

  // Left to right, over and over: first from wherever the beam is, then whole passes.
  useEffect(() => {
    if (reduced) {
      beam.set(BEAM_REST);
      return;
    }
    if (paused || !inView) return;

    const mode = isScanning ? 'scanning' : 'idle';
    let stopped = false;
    let sweep: AnimationPlaybackControls = animate(beam, BEAM_END, {
      duration: (PASS[mode] * (BEAM_END - beam.get())) / (BEAM_END - BEAM_START),
      ease: 'linear',
    });
    sweep.finished.then(() => {
      if (stopped) return;
      sweep = animate(beam, [BEAM_START, BEAM_END], {
        duration: PASS[mode],
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: PASS_GAP[mode],
      });
    });
    return () => {
      stopped = true;
      sweep.stop();
    };
  }, [beam, inView, isScanning, paused, reduced]);

  // The easter egg.
  const clicks = useRef<number[]>([]);
  const busy = useRef(false);
  const [mascot, setMascot] = useState<{ width: number; glow: boolean } | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const flyX = useMotionValue(0);
  const flyY = useMotionValue(0);
  const flyRotate = useMotionValue(0);

  const showWholePage = async () => {
    await animate(reveal, 1, { duration: 0.35, ease: 'easeOut' });
    await wait(REVEAL_HOLD);
    await animate(reveal, 0, { duration: 0.7, ease: 'easeInOut' });
  };

  const launchMascot = async () => {
    const stage = stageRef.current;
    if (!stage || busy.current) return;
    busy.current = true;
    try {
      if (reduced) {
        await showWholePage();
        return;
      }

      const path = flightPath(stage.getBoundingClientRect());
      flyX.set(path.start.x);
      flyY.set(path.start.y);
      flyRotate.set(path.approach.tilt[0]);
      setMascot({ width: path.width, glow: path.glow });

      await Promise.all([
        animate(flyX, path.contact.x, { duration: path.approach.duration, ease: [...path.approach.ease] }),
        animate(flyY, [path.start.y, path.peak.y, path.contact.y], {
          duration: path.approach.duration,
          times: [0, path.peak.at, 1],
          ease: ['easeOut', 'easeIn'],
        }),
        animate(flyRotate, path.approach.tilt[1], { duration: path.approach.duration, ease: 'easeIn' }),
      ]);

      // The hit: the window spins away from it, and the page shows X-rayed.
      setBurst({ x: path.hit.x, y: path.hit.y, id: Date.now() });
      animate(spin, spin.get() - 360, { duration: 1.3, ease: [0.12, 0.75, 0.25, 1] });
      const shown = showWholePage();

      // The mascot bounces back and tumbles off the bottom of the screen.
      await Promise.all([
        animate(flyX, path.rebound.x, { duration: path.rebound.duration, ease: 'easeOut' }),
        animate(flyY, [path.contact.y, path.rebound.peakY, window.innerHeight + path.height], {
          duration: path.rebound.duration,
          times: [0, 0.3, 1],
          ease: ['easeOut', 'easeIn'],
        }),
        animate(flyRotate, path.rebound.turn, { duration: path.rebound.duration, ease: 'easeOut' }),
      ]);
      setMascot(null);
      await shown;
    } finally {
      busy.current = false;
    }
  };

  const handleClick = () => {
    const now = performance.now();
    clicks.current = [...clicks.current.filter((at) => now - at < 650), now];
    if (clicks.current.length >= 3) {
      clicks.current = [];
      void launchMascot();
    }
  };

  const rows: { top: number; parts: [string, Tone][] }[] = [
    { top: 3, parts: [['GET / HTTP/2', 'dim'], ['   host: shop.example', 'dim']] },
    { top: 6.4, parts: [['HTTP/2 200', 'val']] },
    { top: 9.8, parts: [['server: ', 'key'], ['nginx/1.18.0', 'warn']] },
    { top: 13.2, parts: [['content-security-policy: ', 'key'], ["default-src 'self'", 'pass']] },
    { top: 16.6, parts: [['x-frame-options: ', 'key'], ['DENY', 'pass']] },
    { top: 20, parts: [['strict-transport-security: ', 'key'], ['—', 'fail']] },
    { top: 23.4, parts: [['set-cookie: ', 'key'], ['sid=…; HttpOnly; Secure', 'val']] },
    { top: 29, parts: [['# tls', 'dim']] },
    { top: 32.4, parts: [['protocol: ', 'key'], ['TLS 1.3', 'pass'], [' · TLS_AES_128_GCM_SHA256', 'val']] },
    { top: 35.8, parts: [['cert: ', 'key'], ['CN=shop.example · ', 'val'], [copy.validFor(63), 'pass']] },
    { top: 41.4, parts: [['# dns', 'dim']] },
    { top: 44.8, parts: [['A     ', 'key'], ['203.0.113.42', 'val']] },
    { top: 48.2, parts: [['NS    ', 'key'], ['ns1.dns.example', 'val']] },
    { top: 51.6, parts: [['RDAP  ', 'key'], [`${copy.registered} 2009-03-14`, 'pass']] },
  ];

  return (
    <div>
      <div
        ref={stageRef}
        role="img"
        aria-label={copy.label}
        onClick={handleClick}
        className="@container relative select-none perspective-[1600px]"
      >
        {/* The tilt (wide screens only) and, inside it, the spin when the mascot hits */}
        <div className="relative pointer-events-none transform-3d lg:transform-[rotateX(8deg)_rotateY(-16deg)]">
          <motion.div style={{ rotateY: spin, transformStyle: 'preserve-3d' }} className="relative">
            {/* Light under the window */}
            <div
              className="absolute inset-[6%] rounded-[3cqw] bg-cyan-500/25 blur-3xl"
              style={{ transform: 'translateZ(-140px)' }}
            />

            {/* The browser window */}
            <div className="relative aspect-16/11 overflow-hidden rounded-[1.6cqw] border border-white/10 bg-zinc-900 shadow-[0_40px_120px_-30px_rgba(6,182,212,0.45)]">
              <div className="absolute inset-x-0 top-0 h-[6cqw] flex items-center gap-[0.8cqw] px-[2cqw] border-b border-white/10 bg-zinc-900">
                <span className="w-[1.2cqw] h-[1.2cqw] rounded-full bg-zinc-700" />
                <span className="w-[1.2cqw] h-[1.2cqw] rounded-full bg-zinc-700" />
                <span className="w-[1.2cqw] h-[1.2cqw] rounded-full bg-zinc-700" />
                <span className="ml-[2cqw] flex-1 max-w-[46cqw] h-[3.4cqw] rounded-full bg-zinc-800 flex items-center gap-[0.8cqw] px-[1.4cqw] font-mono text-[1.7cqw] text-zinc-400">
                  <i className="ri-lock-fill text-zinc-500" />
                  shop.example
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 top-[6cqw]">
                {/* The page as a visitor sees it */}
                <div className="absolute inset-0 bg-zinc-100">
                  <ShopPage />
                </div>

                {/* The page X-rayed, shown in the band around the beam */}
                <motion.div
                  className="absolute inset-0 bg-[#03161b] bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-size-[3cqw_3cqw]"
                  style={{ maskImage: mask, WebkitMaskImage: mask }}
                >
                  <ShopPage wire />
                  <div className="absolute inset-0 bg-linear-to-r from-[#03161b] via-[#03161b]/70 to-transparent" />
                  {rows.map((row) => (
                    <p
                      key={row.top}
                      className="absolute left-[4cqw] whitespace-pre font-mono text-[1.75cqw] leading-none"
                      style={{ top: `${row.top}cqw` }}
                    >
                      {row.parts.map(([text, tone]) => (
                        <span key={text} className={TONE_CLASS[tone]}>{text}</span>
                      ))}
                    </p>
                  ))}
                </motion.div>

                {/* The beam */}
                <motion.div className="absolute inset-y-0 w-0" style={{ left: beamLeft, opacity: beamOpacity }}>
                  <div className="absolute inset-y-0 -left-[3cqw] w-[6cqw] bg-linear-to-r from-transparent via-cyan-300/15 to-transparent" />
                  <div className="absolute inset-y-0 -left-px w-0.5 bg-cyan-200 shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]" />
                </motion.div>
              </div>
            </div>

            {FINDINGS.map((finding) => (
              <Finding key={finding.key} beam={beam} reveal={reveal} finding={finding} label={copy.findings[finding.key]} />
            ))}
          </motion.div>
        </div>
      </div>

      {!reduced && (
        <div className="mt-3 lg:mt-8 flex justify-end lg:justify-center">
          <button
            type="button"
            onClick={() => setPaused((wasPaused) => !wasPaused)}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-zinc-400 hover:text-cyan-300 transition-colors"
          >
            <i className={paused ? 'ri-play-fill' : 'ri-pause-fill'} aria-hidden="true"></i>
            {paused ? copy.resume : copy.pause}
          </button>
        </div>
      )}

      {/* The flying mascot and the flash where it hits, over the whole page */}
      {(mascot || burst) &&
        createPortal(
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-60 overflow-hidden">
            {mascot && (
              <motion.div className="absolute left-0 top-0" style={{ x: flyX, y: flyY, rotate: flyRotate, width: mascot.width }}>
                <Image
                  src="/logo.png"
                  alt=""
                  width={525}
                  height={254}
                  className={`w-full h-auto ${
                    mascot.glow
                      ? '[filter:drop-shadow(0_0_1.5px_rgba(255,255,255,0.95))_drop-shadow(0_0_18px_rgba(34,211,238,0.85))]'
                      : 'drop-shadow-[0_12px_18px_rgba(0,0,0,0.6)]'
                  }`}
                />
              </motion.div>
            )}
            {burst && (
              <motion.span
                key={burst.id}
                className="absolute left-0 top-0 h-24 w-24 rounded-full border-2 border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.7)]"
                style={{ x: burst.x - 48, y: burst.y - 48 }}
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                onAnimationComplete={() => setBurst(null)}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
