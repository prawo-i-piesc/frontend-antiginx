"use client";

import { useRef, type KeyboardEvent } from "react";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

/**
 * A few mutually exclusive choices side by side, in the frame of the area
 * switch in the sidebar. A radio group: Tab reaches the chosen segment, the
 * arrow keys move the choice.
 */
export default function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  /** The group's accessible name. */
  label: string;
  className?: string;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    let next: number | undefined;
    if (step) next = (current + step + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    onChange(options[next].value);
    buttons.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`inline-flex h-9 items-center gap-0.5 rounded-lg border border-zinc-300 bg-zinc-100 p-0.5 dark:border-zinc-700/70 dark:bg-zinc-900 ${className}`}
    >
      {options.map((option, index) => {
        const checked = index === current;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`flex h-full cursor-pointer items-center rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors ${
              checked
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
