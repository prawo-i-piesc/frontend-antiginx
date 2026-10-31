"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The name of an icon-only control, shown beside it on hover and on keyboard
 * focus. The control keeps its own accessible name, so this is aria-hidden:
 * it is there for sighted users only and would otherwise be read twice.
 *
 * Rendered into <body> at a fixed position, because the collapsed sidebar
 * scrolls vertically and would clip anything sticking out of its side.
 * Escape hides it (WCAG 1.4.13).
 */
export default function RailTooltip({
  label,
  enabled = true,
  children,
}: {
  label: string;
  /** Off where the label is already on screen, as in the expanded sidebar. */
  enabled?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

  function show() {
    const target = ref.current?.firstElementChild;
    if (!enabled || !target) return;
    const rect = target.getBoundingClientRect();
    setAnchor({ top: rect.top + rect.height / 2, left: rect.right + 10 });
  }

  const hide = () => setAnchor(null);

  useEffect(() => {
    if (!anchor) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAnchor(null);
    };
    // Scrolling the list moves the control out from under it.
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", hide, true);
    };
  }, [anchor]);

  const visible = enabled && anchor !== null;

  return (
    <span
      ref={ref}
      className="contents"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={(event) => {
        // Keyboard focus only: a click focuses too, and the pointer is already there.
        if ((event.target as HTMLElement).matches(":focus-visible")) show();
      }}
      onBlur={hide}
    >
      {children}
      {visible
        ? createPortal(
            <span
              aria-hidden="true"
              style={{ top: anchor.top, left: anchor.left }}
              className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
