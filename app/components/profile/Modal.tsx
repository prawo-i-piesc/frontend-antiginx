"use client";

import React, { useId } from "react";

import Dialog from "@/app/components/ui/Dialog";
import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * Dialog for the multi-step flows in the profile.
 *
 * The heading names the dialog and the description is read with it, so a
 * screen reader announces both the moment focus moves inside.
 */
export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
      // m-auto restores the centring the browser gives dialog:modal — Tailwind's
      // reset zeroes every margin, which otherwise pins it to the top-left.
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(42rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-zinc-300 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/70 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-700/50">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="-m-1 cursor-pointer rounded-lg p-1 text-zinc-600 transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <i className="ri-close-line text-xl" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </Dialog>
  );
}
