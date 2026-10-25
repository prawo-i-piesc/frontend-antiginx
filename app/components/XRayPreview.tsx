"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useTransform,
  type Variants,
} from 'framer-motion';

import { REDUCED_MOTION_QUERY, useMediaQuery } from '@/app/hooks/useMediaQuery';
import { useI18n } from '@/app/i18n/I18nProvider';

/*
 * An illustration of a scan: a made-up shop at shop.example (a domain reserved
 * for examples, RFC 2606) seen in a browser window. A scan line keeps crossing
 * the page from left to right; findings pop up on elements of the page as the
 * line reaches their middle, and stay until it has crossed the whole page. Each pass turns up a
 * different set, beside different elements. While a real scan runs, the line
 * goes faster.
 *
 * The loop never ends, so it can be paused (WCAG 2.2.2); it also stops while
 * off screen, and with "reduce motion" the first set of findings just stands.
 * Sizes are in cqw, so the drawing scales with the width it gets. The page's
 * code shows through faintly in a short trail behind the line.
 *
 * Three quick clicks on the window send the mascot flying in across the screen.
 * It hits the window, which spins, and for a moment the page shows X-rayed:
 * its response headers and HTML.
 */

/** How wide the trail behind the line, where the code shows through, is, in cqw. */
const TRAIL = 24;
/**
 * Scan line positions, in percent of the window's width (the same as cqw).
 * A pass starts with the line off the window and ends with its trail off it
 * too, so the jump back is unseen.
 */
const BEAM_START = -3;
const BEAM_END = 100 + TRAIL + 3;
/** Milliseconds: one pass, and the pause before the next. */
const PASS = 6200;
const GAP = 700;
const LOOP = PASS + GAP;
const SCANNING_SPEED = 3;

function beamAt(time: number) {
  if (time < 0) return BEAM_START;
  const t = time % LOOP;
  return t < PASS ? BEAM_START + ((BEAM_END - BEAM_START) * t) / PASS : BEAM_END;
}

/** When, into a pass, the line reaches `x`. */
const reachedAt = (x: number) => ((x - BEAM_START) / (BEAM_END - BEAM_START)) * PASS;

/** How long the whole page stays X-rayed after the mascot hits it, in seconds. */
const REVEAL_HOLD = 2.6;
const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

type Tone = 'dim' | 'key' | 'val' | 'src' | 'pass' | 'warn' | 'fail';

const TONE_CLASS: Record<Tone, string> = {
  dim: 'text-zinc-600',
  key: 'text-zinc-400',
  val: 'text-zinc-200',
  src: 'text-zinc-500',
  pass: 'text-emerald-400',
  warn: 'text-amber-300',
  fail: 'text-red-400',
};

type Severity = 'pass' | 'warn' | 'fail';

const SEVERITY_ICON: Record<Severity, string> = {
  pass: 'ri-checkbox-circle-fill text-emerald-400',
  warn: 'ri-error-warning-fill text-amber-300',
  fail: 'ri-close-circle-fill text-red-400',
};

type Finding =
  | 'server' | 'hsts' | 'tls' | 'domain' | 'cdn' | 'csp' | 'cookieHttpOnly' | 'contentType'
  | 'apache' | 'framing' | 'oldTls' | 'obfuscatedJs' | 'sameSite' | 'certExpiry' | 'youngDomain' | 'sitemapAdmin';
type Row = { parts: [string, Tone][] };

/** Where each of the fourteen rows of an X-ray column sits, in cqw from the top. */
const ROW_TOPS = [3, 6.1, 9.1, 12.2, 15.2, 18.3, 21.4, 26.4, 29.5, 32.5, 37.6, 40.6, 43.7, 46.7];

/** The page's HTML, the right-hand column of the X-ray. */
const SOURCE: [string, Tone][][] = [
  [['view-source:shop.example', 'dim']],
  [['<!doctype html>', 'src']],
  [['<html lang="en">', 'src']],
  [['<head>', 'src']],
  [['  <title>', 'src'], ['Shop', 'val'], ['</title>', 'src']],
  [['  <link rel="icon" href="/favicon.ico">', 'src']],
  [['  <script src="/app.js"></script>', 'src']],
  [['</head>', 'src']],
  [['<body>', 'src']],
  [['  <h1>', 'src'], ['Spring sale', 'val'], ['</h1>', 'src']],
  [['  <a href="/products">', 'src'], ['Shop now', 'val'], ['</a>', 'src']],
  [['  …', 'dim']],
  [['</body>', 'src']],
  [['</html>', 'src']],
];

function ShopPage() {
  return (
    <>
      {/* Navigation */}
      <div className="absolute inset-x-0 top-0 h-[7.2cqw] border-b border-zinc-800" />
      <div className="absolute left-[4cqw] top-[2.6cqw] h-[2cqw] w-[8cqw] rounded-full bg-zinc-200" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute top-[3.1cqw] h-[1cqw] w-[5.5cqw] rounded-full bg-zinc-600"
          style={{ left: `${38 + i * 9}cqw` }}
        />
      ))}
      <div className="absolute right-[4cqw] top-[2.3cqw] h-[2.6cqw] w-[9cqw] rounded-full border border-zinc-700" />

      {/* Hero */}
      <div className="absolute left-[4cqw] top-[11cqw] h-[1cqw] w-[9cqw] rounded-full bg-orange-400/80" />
      <div className="absolute left-[4cqw] top-[13.6cqw] h-[2.4cqw] w-[34cqw] rounded-full bg-zinc-200" />
      <div className="absolute left-[4cqw] top-[17.4cqw] h-[2.4cqw] w-[24cqw] rounded-full bg-zinc-200" />
      {[34, 31, 20].map((width, i) => (
        <div
          key={width}
          className="absolute left-[4cqw] h-[1cqw] rounded-full bg-zinc-700"
          style={{ top: `${22.6 + i * 2.2}cqw`, width: `${width}cqw` }}
        />
      ))}
      <div className="absolute left-[4cqw] top-[30.5cqw] h-[3.6cqw] w-[13cqw] rounded-full bg-orange-500" />
      <div className="absolute left-[19cqw] top-[30.5cqw] h-[3.6cqw] w-[11cqw] rounded-full border border-zinc-700" />
      <div className="absolute left-[48cqw] top-[10cqw] h-[24.5cqw] w-[48cqw] overflow-hidden rounded-[1.2cqw] border border-zinc-800 bg-zinc-900">
        {/* An island with an orange palm */}
        <svg viewBox="0 0 480 245" className="absolute inset-0 h-full w-full">
          <rect x="0" y="182" width="480" height="63" fill="#27272a" />
          <path d="M70 208h44M140 224h56M318 212h48M392 228h34" stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
          <path d="M146 184 C 180 150, 300 150, 334 184 Z" fill="#3f3f46" />
          <path d="M246 170 C 249 138, 255 108, 268 80" fill="none" stroke="#f97316" strokeWidth="9" strokeLinecap="round" />
          <g fill="#f97316">
            <path d="M268 78 C 240 58, 205 60, 180 88 C 210 72, 240 74, 268 82 Z" />
            <path d="M268 78 C 250 48, 222 38, 198 44 C 228 52, 248 62, 266 82 Z" />
            <path d="M268 78 C 298 58, 334 62, 356 92 C 326 74, 296 74, 270 82 Z" />
            <path d="M268 78 C 286 46, 316 38, 340 46 C 310 52, 290 62, 270 82 Z" />
            <path d="M268 78 C 262 52, 270 30, 286 20 C 281 42, 276 60, 270 80 Z" />
          </g>
          <circle cx="262" cy="88" r="5.5" fill="#fb923c" />
          <circle cx="275" cy="90" r="5.5" fill="#fb923c" />
        </svg>
      </div>

      {/* Products */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute top-[39cqw] w-[21cqw] rounded-[1cqw] border border-zinc-800 bg-zinc-900 p-[1cqw]"
          style={{ left: `${4 + i * 23}cqw` }}
        >
          <div className="h-[10cqw] rounded-[0.7cqw] bg-zinc-800" />
          <div className="mt-[1.2cqw] h-[1cqw] w-[13cqw] rounded-full bg-zinc-600" />
          <div className="mt-[0.9cqw] h-[1cqw] w-[6cqw] rounded-full bg-orange-400/80" />
        </div>
      ))}
    </>
  );
}

/**
 * What each pass turns up, and where: the label's middle, in cqw. A label pops
 * up as the line reaches its middle. In every set:
 * - four findings at least, one per pass is too few to feel like a scan;
 * - each on its own row (ROWS), so the four never overlap once all are up;
 * - their `x` at least 12 apart, so no two pop up at the same moment;
 * - `x` within 26–73, so the longest label still fits in the window on a phone.
 * The rows start below the shop's navigation and end above the pause button.
 * The headers the X-ray shows (`reports` below) go with the same sets.
 */
const ROWS = [11, 18.5, 26, 33.5, 41, 48.5];
type Label = { finding: Finding; severity: Severity; x: number; y: number };
const LABEL_SETS: Label[][] = [
  [
    { finding: 'domain', severity: 'pass', x: 27, y: ROWS[0] },
    { finding: 'hsts', severity: 'fail', x: 40, y: ROWS[2] },
    { finding: 'tls', severity: 'pass', x: 54, y: ROWS[5] },
    { finding: 'server', severity: 'warn', x: 70, y: ROWS[1] },
  ],
  [
    { finding: 'csp', severity: 'fail', x: 28, y: ROWS[1] },
    { finding: 'cookieHttpOnly', severity: 'warn', x: 42, y: ROWS[5] },
    { finding: 'cdn', severity: 'pass', x: 58, y: ROWS[0] },
    { finding: 'contentType', severity: 'warn', x: 72, y: ROWS[3] },
  ],
  [
    { finding: 'framing', severity: 'warn', x: 30, y: ROWS[2] },
    { finding: 'oldTls', severity: 'fail', x: 44, y: ROWS[4] },
    { finding: 'apache', severity: 'warn', x: 60, y: ROWS[0] },
    { finding: 'obfuscatedJs', severity: 'warn', x: 73, y: ROWS[1] },
  ],
  [
    { finding: 'sameSite', severity: 'warn', x: 26, y: ROWS[3] },
    { finding: 'youngDomain', severity: 'fail', x: 40, y: ROWS[0] },
    { finding: 'certExpiry', severity: 'warn', x: 55, y: ROWS[2] },
    { finding: 'sitemapAdmin', severity: 'warn', x: 70, y: ROWS[4] },
  ],
];
const SET_COUNT = LABEL_SETS.length;

/** The findings up: this pass's the line has reached, until the pass is over. */
function labelsAt(time: number): { pass: number; label: Label }[] {
  if (time < 0) return [];
  const pass = Math.floor(time / LOOP);
  const into = time - pass * LOOP;
  if (into >= PASS) return [];
  return LABEL_SETS[pass % SET_COUNT]
    .filter((label) => into >= reachedAt(label.x))
    .map((label) => ({ pass, label }));
}

/** A finding pops up, quick and small, and goes as quickly. */
const POP: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: '0.6cqw', transition: { duration: 0.16, ease: 'easeIn' } },
  shown: { opacity: 1, scale: 1, y: '0cqw', transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } },
};

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

/** The page X-rayed: its response headers on the left, its HTML on the right. */
function XRayText({ headers }: { headers: Row[] }) {
  return (
    <>
      <span className="absolute left-[52cqw] top-[2cqw] bottom-[2cqw] w-px bg-zinc-800" />
      {[
        ...headers.map((row, index) => ({ parts: row.parts, top: ROW_TOPS[index], left: 4 })),
        ...SOURCE.map((parts, index) => ({ parts, top: ROW_TOPS[index], left: 55 })),
      ].map((row) => (
        <p
          key={`${row.left}-${row.top}`}
          className="absolute whitespace-pre font-mono text-[1.75cqw] leading-none"
          style={{ top: `${row.top}cqw`, left: `${row.left}cqw` }}
        >
          {row.parts.map(([text, tone], index) => (
            <span key={index} className={TONE_CLASS[tone]}>{text}</span>
          ))}
        </p>
      ))}
    </>
  );
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

  /** The pass the X-ray's headers belong to, and the findings on screen. */
  const [pass, setPass] = useState(0);

  const [labels, setLabels] = useState<{ pass: number; label: Label }[]>([]);
  const signature = useRef('');

  // Starts a moment before the first pass.
  const time = useRef(-500);
  const running = !reduced && !paused && inView;
  useAnimationFrame((_, delta) => {
    if (!running) return;
    time.current += Math.min(delta, 100) * (isScanning ? SCANNING_SPEED : 1);
    beam.set(beamAt(time.current));
    const shown = labelsAt(time.current);
    const next = shown.map(({ pass, label }) => `${pass}:${label.finding}`).join(',');
    if (next !== signature.current) {
      signature.current = next;
      setLabels(shown);
    }
    const current = time.current < 0 ? 0 : Math.floor(time.current / LOOP);
    setPass((was) => (was === current ? was : current));
  });
  useEffect(() => {
    if (reduced) beam.set(BEAM_START);
  }, [beam, reduced]);
  const shownLabels = reduced ? LABEL_SETS[0].map((label) => ({ pass: 0, label })) : labels;

  const beamLeft = useTransform(beam, (b) => `${b}%`);
  // The code shows through behind the line: most right behind it, fading out
  // over the trail.
  const trailMask = useTransform(beam, (b) => `linear-gradient(90deg, transparent ${b - TRAIL}%, #000 ${b}%, transparent ${b}%)`);

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

      // The hit: the window spins away from it, and the whole page shows X-rayed.
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

  const request: Row = { parts: [['GET / HTTP/2', 'dim'], ['   host: shop.example', 'dim']] };
  const status: Row = { parts: [['HTTP/2 200', 'val']] };
  const heading = (name: string): Row => ({ parts: [[`# ${name}`, 'dim']] });
  const line = (key: string, value: string, tone: Tone = 'val'): Row => ({ parts: [[key, 'key'], [value, tone]] });
  /** The headers under the band, one set per set of findings (LABEL_SETS). */
  const reports: Row[][] = [
    [
      request, status,
      line('server: ', 'nginx/1.18.0', 'warn'),
      line('content-security-policy: ', "default-src 'self'", 'pass'),
      line('x-frame-options: ', 'DENY', 'pass'),
      line('strict-transport-security: ', '—', 'fail'),
      line('set-cookie: ', 'sid=…; HttpOnly; Secure'),
      heading('tls'),
      line('protocol: ', 'TLS 1.3', 'pass'),
      line('cert: ', 'CN=shop.example', 'val'),
      heading('dns'),
      line('A     ', '203.0.113.42'),
      line('NS    ', 'ns1.dns.example'),
      line('RDAP  ', `${copy.registered} 2009-03-14`, 'pass'),
    ],
    [
      request, status,
      line('server: ', 'cloudflare'),
      line('content-security-policy: ', '—', 'fail'),
      line('x-frame-options: ', 'SAMEORIGIN', 'pass'),
      line('strict-transport-security: ', 'max-age=31536000', 'pass'),
      line('set-cookie: ', 'sid=…; Secure', 'warn'),
      heading('tls'),
      line('protocol: ', 'TLS 1.3', 'pass'),
      line('cert: ', 'CN=shop.example'),
      heading('dns'),
      line('A     ', '198.51.100.7', 'val'),
      line('NS    ', 'ns1.dns.example'),
      line('RDAP  ', `${copy.registered} 2015-06-02`, 'pass'),
    ],
    [
      request, status,
      line('server: ', 'Apache/2.4.29', 'warn'),
      line('content-security-policy: ', "default-src 'self'", 'pass'),
      line('x-frame-options: ', '—', 'warn'),
      line('strict-transport-security: ', 'max-age=31536000', 'pass'),
      line('set-cookie: ', 'sid=…; HttpOnly; Secure'),
      heading('tls'),
      line('protocol: ', 'TLS 1.0', 'fail'),
      line('cert: ', 'CN=shop.example'),
      heading('dns'),
      line('A     ', '192.0.2.10'),
      line('NS    ', 'ns1.dns.example'),
      line('RDAP  ', `${copy.registered} 2012-11-20`, 'pass'),
    ],
    [
      request, status,
      line('server: ', 'nginx'),
      line('content-security-policy: ', "default-src 'self'", 'pass'),
      line('x-frame-options: ', 'DENY', 'pass'),
      line('strict-transport-security: ', 'max-age=31536000', 'pass'),
      line('set-cookie: ', 'sid=…; HttpOnly; Secure', 'warn'),
      heading('tls'),
      line('protocol: ', 'TLS 1.3', 'pass'),
      line('cert: ', 'CN=shop.example', 'warn'),
      heading('dns'),
      line('A     ', '203.0.113.99'),
      line('NS    ', 'ns1.dns.example'),
      line('RDAP  ', copy.registeredAgo(6), 'fail'),
    ],
  ];

  const headers = reports[pass % SET_COUNT];

  return (
    <div>
      {/* The window, with the pause button over its corner; the button sits
          outside the illustration, which reads as a single image. */}
      <div className="relative">
        <div
          ref={stageRef}
          role="img"
          aria-label={copy.label}
          onClick={handleClick}
          className="@container relative select-none perspective-[1600px]"
        >
          {/* The spin when the mascot hits */}
          <motion.div style={{ rotateY: spin }} className="relative pointer-events-none">
            <div className="relative aspect-16/11 overflow-hidden rounded-[1.6cqw] border border-white/10 bg-zinc-900 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
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
                <div className="absolute inset-0 bg-zinc-950">
                  <ShopPage />
                </div>

                {/* The page X-rayed, shown only after the mascot's hit */}
                <motion.div className="absolute inset-0 bg-zinc-950" style={{ opacity: reveal }}>
                  <XRayText headers={headers} />
                </motion.div>

                {/* The code, showing through behind the line */}
                {!reduced && (
                  <motion.div className="absolute inset-0 bg-zinc-950/60" style={{ maskImage: trailMask, WebkitMaskImage: trailMask }}>
                    <XRayText headers={headers} />
                  </motion.div>
                )}

                {/* The scan line */}
                <motion.div className="absolute inset-y-0 w-[max(3px,0.7cqw)] -translate-x-1/2 bg-cyan-400" style={{ left: beamLeft }} />

                {/* Findings, popping up as the line reaches their element */}
                <AnimatePresence>
                  {shownLabels.map(({ pass: from, label }) => (
                      <span
                        key={`${from}:${label.finding}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${label.x}cqw`, top: `${label.y}cqw` }}
                      >
                        <motion.span
                          variants={POP}
                          initial={reduced ? false : 'hidden'}
                          animate="shown"
                          exit="hidden"
                          className={`flex items-center gap-[0.45em] whitespace-nowrap rounded-[0.45em] border-2 border-cyan-400 bg-zinc-950 px-[0.65em] py-[0.35em] text-[clamp(10px,2.1cqw,15px)] font-medium leading-none text-white shadow-[0_8px_20px_rgba(0,0,0,0.5)]`}
                        >
                          <i className={SEVERITY_ICON[label.severity]} />
                          {copy.findings[label.finding]}
                        </motion.span>
                      </span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((wasPaused) => !wasPaused)}
            aria-label={paused ? copy.resume : copy.pause}
            title={paused ? copy.resume : copy.pause}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-white/15 bg-zinc-950/80 text-zinc-300 backdrop-blur-sm hover:border-white/30 hover:text-white transition-colors"
          >
            <i className={paused ? 'ri-play-fill' : 'ri-pause-fill'} aria-hidden="true"></i>
          </button>
        )}
      </div>

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
                className="absolute left-0 top-0 h-24 w-24 rounded-full border-2 border-cyan-300"
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
