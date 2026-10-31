"use client";

import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { getTopLayerHost, subscribeTopLayerHost } from "@/app/components/ui/topLayer";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

type Size = "sm" | "md" | "lg";

const TRIGGER_SIZES: Record<Size, string> = {
  sm: "h-8 rounded-lg pr-8 text-xs",
  md: "h-9 rounded-lg pr-8 text-sm",
  lg: "h-12 rounded-xl pr-10 text-base",
};

/** Left padding, wider when an icon sits in front of the value. */
const TRIGGER_INSET: Record<Size, { plain: string; icon: string }> = {
  sm: { plain: "pl-2.5", icon: "pl-8" },
  md: { plain: "pl-3", icon: "pl-9" },
  lg: { plain: "pl-4", icon: "pl-11" },
};

/** The menu never grows past this; longer lists scroll inside it. */
const MAX_MENU_HEIGHT = 288;
/** Room for about three options: below that the menu would rather open upwards. */
const MIN_MENU_HEIGHT = 120;
const GAP = 4;
const TYPEAHEAD_RESET_MS = 600;

interface MenuPlace {
  left: number;
  minWidth: number;
  /** Opened upwards: anchored by its bottom edge to the top of the button. */
  above: boolean;
  edge: number;
  maxHeight: number;
}

/**
 * A select whose menu is drawn by the page instead of the browser, so it
 * opens right under its button, in the app's own colours, everywhere.
 *
 * It follows the WAI-ARIA select-only combobox pattern: focus stays on the
 * button and aria-activedescendant points at the highlighted option. Arrows,
 * Home and End move, Enter or Space picks, Escape and Tab close, and typing a
 * few letters jumps to the option that starts with them.
 *
 * The menu is rendered at a fixed position in a portal — into <body>, or into
 * the open dialog when there is one, where anything outside would be inert —
 * so a card with overflow: hidden cannot clip it. It stays under its button,
 * scrolling when the window is short, and opens upwards only when even a few
 * options would not fit; it moves with the page as it scrolls.
 */
export default function Dropdown<T extends string>({
  value,
  options,
  onChange,
  id,
  label,
  labelledBy,
  size = "md",
  icon,
  disabled = false,
  className = "",
}: {
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  /** For a visible <label htmlFor>; otherwise give `label`. */
  id?: string;
  /** Accessible name when there is no visible label pointing at the button. */
  label?: string;
  /** Id of visible text that names it, when that text is not a <label>. */
  labelledBy?: string;
  size?: Size;
  /** A Remix Icon class shown inside the button, before the value. */
  icon?: string;
  disabled?: boolean;
  className?: string;
}) {
  const autoId = useId();
  const buttonId = id ?? `${autoId}-button`;
  const listId = `${autoId}-list`;
  const optionId = (index: number) => `${autoId}-option-${index}`;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<MenuPlace | null>(null);

  const host = useSyncExternalStore(subscribeTopLayerHost, getTopLayerHost, () => null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];

  function measure(): MenuPlace | null {
    const button = buttonRef.current;
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    const wanted = Math.min(options.length * 36 + 10, MAX_MENU_HEIGHT);
    const below = window.innerHeight - rect.bottom - GAP * 2;
    const aboveRoom = rect.top - GAP * 2;
    // Below the button whenever it fits, shortened and scrolling if need be:
    // a menu that jumps above its button reads as misplaced. Upwards only
    // when not even a few options fit underneath.
    const above = below < Math.min(wanted, MIN_MENU_HEIGHT) && aboveRoom > below;
    return {
      left: rect.left,
      minWidth: rect.width,
      above,
      edge: above ? window.innerHeight - rect.top + GAP : rect.bottom + GAP,
      maxHeight: Math.min(MAX_MENU_HEIGHT, wanted, Math.max(above ? aboveRoom : below, MIN_MENU_HEIGHT)),
    };
  }

  function openMenu(index: number) {
    setPlace(measure());
    setActive(Math.min(Math.max(index, 0), options.length - 1));
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    typed.current = { text: "", at: 0 };
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close(true);
  }

  /** The next option after the highlighted one that starts with what was typed. */
  function typeahead(key: string): number | null {
    const now = Date.now();
    const text = now - typed.current.at > TYPEAHEAD_RESET_MS ? key : typed.current.text + key;
    typed.current = { text, at: now };
    const start = text.length === 1 ? active + 1 : active;
    for (let step = 0; step < options.length; step++) {
      const index = (start + step) % options.length;
      if (options[index].label.toLocaleLowerCase().startsWith(text.toLocaleLowerCase())) return index;
    }
    return null;
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const start = event.key === "Home" ? 0 : event.key === "End" ? last : selectedIndex;
        openMenu(start);
        return;
      }
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const match = typeahead(event.key);
        if (match !== null) openMenu(match);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => Math.min(index + 1, last));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => Math.max(index - 1, 0));
        return;
      case "Home":
        event.preventDefault();
        setActive(0);
        return;
      case "End":
        event.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        return;
      case "Escape":
        // Closes the menu only, not a dialog it sits in.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      case "Tab":
        close(false);
        return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const match = typeahead(event.key);
      if (match !== null) setActive(match);
    }
  }

  // Follows the button when the page scrolls under it — focusing a button
  // that is half out of view scrolls too, right as the menu opens — and
  // closes once the button has left the screen.
  const follow = useEffectEvent(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) {
      setOpen(false);
      return;
    }
    setPlace(measure());
  });

  // A click elsewhere or a resize closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = (event: Event) => {
      if (listRef.current?.contains(event.target as Node)) return;
      follow();
    };
    const onResize = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Kept inside the window when an option is wider than the button.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!open || !list || !place) return;
    const overflow = list.getBoundingClientRect().right - (window.innerWidth - 8);
    if (overflow > 0) list.style.left = `${Math.max(8, place.left - overflow)}px`;
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${autoId}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, autoId]);

  return (
    <span className={`relative inline-flex ${className}`}>
      {icon ? (
        <i
          className={`${icon} pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 ${size === "lg" ? "left-4" : "left-3"}`}
          aria-hidden="true"
        />
      ) : null}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-label={label}
        aria-labelledby={labelledBy}
        disabled={disabled}
        onClick={() => (open ? close(false) : openMenu(selectedIndex))}
        onKeyDown={onKeyDown}
        className={`w-full cursor-pointer truncate border border-zinc-300 bg-zinc-50 text-left text-zinc-900 transition-colors hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:border-cyan-600/60 dark:border-zinc-700/70 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:border-zinc-600 dark:aria-expanded:border-cyan-400/50 ${
          TRIGGER_SIZES[size]
        } ${icon ? TRIGGER_INSET[size].icon : TRIGGER_INSET[size].plain}`}
      >
        {selected?.label}
      </button>
      <i
        className={`ri-arrow-down-s-line pointer-events-none absolute top-1/2 -translate-y-1/2 leading-none text-zinc-500 transition-transform dark:text-zinc-400 ${
          size === "lg" ? "right-3.5 text-lg" : "right-2.5 text-base"
        } ${open ? "rotate-180" : ""}`}
        aria-hidden="true"
      />

      {open && place
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={labelledBy ?? buttonId}
              tabIndex={-1}
              // Keeps focus on the button when an option is clicked.
              onPointerDown={(event) => event.preventDefault()}
              style={{
                left: place.left,
                minWidth: place.minWidth,
                maxHeight: place.maxHeight,
                ...(place.above ? { bottom: place.edge } : { top: place.edge }),
              }}
              className="fixed z-[70] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 text-sm text-zinc-900 shadow-lg scrollbar-theme dark:border-zinc-700/70 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onPointerMove={() => setActive(index)}
                    onClick={() => choose(index)}
                    className={`flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md pl-2 pr-3 ${
                      index === active ? "bg-zinc-100 dark:bg-zinc-800" : ""
                    } ${isSelected ? "font-medium" : ""}`}
                  >
                    <i
                      className={`ri-check-line text-base leading-none text-cyan-700 dark:text-cyan-400 ${
                        isSelected ? "" : "invisible"
                      }`}
                      aria-hidden="true"
                    />
                    {option.label}
                  </li>
                );
              })}
            </ul>,
            host ?? document.body,
          )
        : null}
    </span>
  );
}
