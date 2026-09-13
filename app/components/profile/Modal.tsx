"use client";

import React, { useEffect, useRef } from "react";

/**
 * Dialog for the multi-step flows.
 *
 * Built on <dialog> so focus trapping, Esc and the backdrop come from the
 * platform rather than from hand-rolled key handlers.
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
  const ref = useRef<HTMLDialogElement>(null);

  // The <dialog> close event fires for every close, including the ones this
  // component performs when `open` goes false. Reporting those back as a
  // dismissal would undo the state change that closed it — which is what
  // silently killed a flow moving from one dialog straight into the next.
  const openRef = useRef(open);

  useEffect(() => {
    // Recorded before the close is performed, so the event that follows can
    // tell our own close apart from the user dismissing the dialog.
    openRef.current = open;

    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleDismiss = () => {
    if (!openRef.current) return;
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={handleDismiss}
      aria-label={title}
      // m-auto restores the centring the browser gives dialog:modal — Tailwind's
      // reset zeroes every margin, which otherwise pins it to the top-left.
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(42rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-zinc-300 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/70 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {open ? (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-700/50">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {description ? (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-m-1 cursor-pointer rounded-lg p-1 text-zinc-500 transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:hover:text-zinc-100"
            >
              <i className="ri-close-line text-xl" aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
