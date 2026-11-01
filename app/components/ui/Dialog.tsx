"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { addTopLayerHost, removeTopLayerHost } from "@/app/components/ui/topLayer";

/**
 * Modal dialog built on the native <dialog> element.
 *
 * showModal() is what makes it accessible without hand-rolled key handlers:
 * focus moves inside and cannot leave, Escape closes it, everything behind it
 * becomes inert for both the keyboard and screen readers, and focus returns to
 * whatever opened it once it closes.
 *
 * Children render only while open, so a closed dialog leaves nothing behind
 * for a screen reader to find.
 */
export default function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  label,
  closeOnBackdrop = false,
  className = "",
  children,
}: {
  open: boolean;
  /** Called for every dismissal: Escape, the backdrop, or the caller's own close button. */
  onClose: () => void;
  /** Id of the heading that names the dialog. Prefer this over `label`. */
  labelledBy?: string;
  describedBy?: string;
  /** Accessible name when there is no visible heading to point at. */
  label?: string;
  /**
   * Close when the backdrop is clicked. The click lands on the <dialog>
   * element itself, so the dialog must have no padding of its own — put it on
   * an inner wrapper — or clicks on that padding would close it too.
   */
  closeOnBackdrop?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // The close event fires for every close, including the ones this component
  // performs when `open` goes false. Reporting those back as a dismissal would
  // undo the state change that closed it — which silently killed a flow moving
  // from one dialog straight into the next.
  const openRef = useRef(open);

  // Children mount only once the dialog is showing. React focuses an
  // `autoFocus` field the moment it mounts; inside a dialog that is not open
  // yet the focus is lost and showModal() then picks the first button instead.
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    // Recorded before the close is performed, so the event that follows can
    // tell our own close apart from the user dismissing the dialog.
    openRef.current = open;

    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    // In a layout effect, so the content renders before the empty dialog is painted.
    setShown(open);
  }, [open]);

  // A caller that renders the dialog only while it is open removes it without
  // closing it, and focus then falls to the page instead of going back to the
  // control that opened it. Closing first lets the browser restore it.
  useLayoutEffect(() => {
    const dialog = ref.current;
    return () => {
      if (!dialog?.open) return;
      openRef.current = false;
      dialog.close();
    };
  }, []);

  // While open, toasts render inside the dialog: outside it they are inert.
  useEffect(() => {
    const host = hostRef.current;
    if (!open || !host) return;
    addTopLayerHost(host);
    return () => removeTopLayerHost(host);
  }, [open]);

  const handleClose = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    // The native close event does not bubble, but React passes it up its own
    // tree anyway: closing a dialog nested in this one would close this too.
    if (event.target !== event.currentTarget) return;
    // The event is queued, so it can arrive after the dialog was shown again —
    // React's development mode closes and reopens it on mount. A dismissal
    // always finds it closed.
    if (event.currentTarget.open) return;
    if (!openRef.current) return;
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-label={labelledBy ? undefined : label}
      onClick={
        closeOnBackdrop
          ? (event) => {
              // Closed natively, like Escape, so focus goes back where it came
              // from; the close event then reports the dismissal.
              if (event.target === event.currentTarget) event.currentTarget.close();
            }
          : undefined
      }
      className={className}
    >
      {open && shown ? children : null}
      <div ref={hostRef} />
    </dialog>
  );
}
