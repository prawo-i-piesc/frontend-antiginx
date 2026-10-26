import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as motion from 'framer-motion/client';

import { PRIMARY_BUTTON } from './components/ui/buttonStyles';
import { MAIN_CONTENT_ID } from './components/ui/SkipLink';
import { getMessages } from './i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.notFound.title };
}

export default async function NotFound() {
  const t = await getMessages();
  const copy = t.notFound;

  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className="marketing-surface min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden focus:outline-none"
    >

      {/* The hero's backdrop, slightly darker */}
      <div className="absolute inset-0" style={{ backgroundColor: '#060607' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,140,190,0.15),transparent_90%)]"></div>

      {/* Grid Pattern (dimmed) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-size-[100px_100px]"></div>

      <motion.div className="max-w-2xl w-full text-center relative z-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* The mascot, pointing at the visitor */}
        <Image
          src="/logo404.png"
          alt={copy.imageAlt}
          width={250}
          height={250}
          className="mx-auto mb-8"
          preload
        />

        {/* Text, under the response a scan would get here */}
        <motion.p
          className="font-mono text-sm text-zinc-500 mb-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04 }}
        >
          HTTP/2 <span className="text-red-400">404</span> · Not Found
        </motion.p>
        <motion.h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
          {copy.heading}
          <span className="sr-only"> {copy.title}</span>
        </motion.h1>
        <motion.p className="text-lg text-zinc-400 mb-8" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}>
          {copy.lead} <br /> {copy.body}
        </motion.p>

        {/* Back to home button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.18 }}>
          <Link
            href="/"
            className={`inline-block px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border transition-colors duration-200 whitespace-nowrap font-semibold text-sm sm:text-base ${PRIMARY_BUTTON}`}
          >
            {copy.home}
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
