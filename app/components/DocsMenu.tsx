"use client";

import { useEffect, useId, useRef, useState } from 'react';

import { DOCS, DOCS_PARTS, type DocsPart } from '@/app/config/constants';
import { useI18n } from '@/app/i18n/I18nProvider';

const ICONS: Record<DocsPart, string> = {
  engine: 'ri-radar-line',
  backend: 'ri-server-line',
  daemon: 'ri-stack-line',
};

/**
 * "Documentation" in the site header: each part of the project has its own
 * site, so the link opens a short list to choose from.
 *
 * A disclosure, not an ARIA menu: a button that shows a list of ordinary
 * links, reached with Tab. Escape closes it and returns focus to the button;
 * so does a click outside it or focus moving on past the last link.
 */
export default function DocsMenu({ linkClass }: { linkClass: string }) {
  const { t } = useI18n();
  const copy = t.landing.header;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return;
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`${linkClass} inline-flex cursor-pointer items-center`}
      >
        {copy.docs}
        <i
          className={`ri-arrow-down-s-line ml-0.5 text-base transition-transform duration-200 motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="pop-in absolute left-1/2 top-full z-50 mt-3 w-76 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-900/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          <ul>
            {DOCS_PARTS.map((part) => (
              <li key={part}>
                <a
                  href={DOCS[part]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5 focus-visible:bg-white/5"
                >
                  <i className={`${ICONS[part]} mt-0.5 text-base text-zinc-400 group-hover:text-cyan-300`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 text-sm font-medium text-white">
                      {copy.docsParts[part].name}
                      <i className="ri-arrow-right-up-line text-xs text-zinc-500 group-hover:text-cyan-300" aria-hidden="true" />
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-400">{copy.docsParts[part].description}</span>
                  </span>
                  <span className="sr-only"> {t.common.opensInNewTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
