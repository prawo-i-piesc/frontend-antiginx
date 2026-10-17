"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { getTopLayerHost, subscribeTopLayerHost } from "@/app/components/ui/topLayer";
import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * Application-wide toasts.
 *
 * Auth screens used to render failures as a red strip inside the form, which
 * meant an error from a redirect or a background refresh had nowhere to go.
 * Toasts give every one of those a single, consistent place to land.
 */

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastOptions {
  description?: string;
  /** Milliseconds before auto-dismiss. Pass 0 to keep it until dismissed. */
  duration?: number;
}

interface ToastContextValue {
  success: (title: string, options?: ToastOptions) => void;
  error: (title: string, options?: ToastOptions) => void;
  info: (title: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
}

/** What the screen reader live regions currently hold. */
interface Announcement {
  id: number;
  text: string;
}

/** A paused toast's countdown: how long it had left when the pause began. */
interface Countdown {
  timer?: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  info: 5000,
  // Errors usually carry something to act on, so they linger.
  error: 7000,
};

/** A toast resumed with almost nothing left still stays long enough to read the last word. */
const MIN_RESUME = 1500;

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [polite, setPolite] = useState<Announcement | null>(null);
  const [assertive, setAssertive] = useState<Announcement | null>(null);
  const countdowns = useRef(new Map<number, Countdown>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const countdown = countdowns.current.get(id);
    if (countdown?.timer) clearTimeout(countdown.timer);
    countdowns.current.delete(id);
  }, []);

  const start = useCallback(
    (id: number, ms: number) => {
      countdowns.current.set(id, {
        remaining: ms,
        startedAt: Date.now(),
        timer: setTimeout(() => dismiss(id), ms),
      });
    },
    [dismiss],
  );

  // Pointer or keyboard focus on a toast stops its countdown, so nobody loses
  // a message halfway through reading it (WCAG 2.2.1).
  const pause = useCallback((id: number) => {
    const countdown = countdowns.current.get(id);
    if (!countdown?.timer) return;
    clearTimeout(countdown.timer);
    countdown.timer = undefined;
    countdown.remaining = Math.max(0, countdown.remaining - (Date.now() - countdown.startedAt));
  }, []);

  const resume = useCallback(
    (id: number) => {
      const countdown = countdowns.current.get(id);
      if (!countdown || countdown.timer) return;
      countdown.startedAt = Date.now();
      countdown.timer = setTimeout(() => dismiss(id), Math.max(countdown.remaining, MIN_RESUME));
    },
    [dismiss],
  );

  const push = useCallback(
    (variant: ToastVariant, title: string, options?: ToastOptions) => {
      const id = nextId++;
      setToasts((current) => [...current.slice(-2), { id, variant, title, description: options?.description }]);

      // Read out through regions that exist before the message arrives: a
      // freshly inserted role="status" is not reliably announced, and errors
      // interrupt while everything else waits its turn.
      const announcement = { id, text: options?.description ? `${title} ${options.description}` : title };
      if (variant === "error") setAssertive(announcement);
      else setPolite(announcement);

      const duration = options?.duration ?? DEFAULT_DURATION[variant];
      if (duration > 0) start(id, duration);
    },
    [start],
  );

  useEffect(() => {
    const pending = countdowns.current;
    return () => {
      for (const countdown of pending.values()) {
        if (countdown.timer) clearTimeout(countdown.timer);
      }
      pending.clear();
    };
  }, []);

  // An open modal dialog makes everything outside it inert, so while one is
  // open the toasts and their live regions move inside it to stay heard and
  // above the backdrop.
  const host = useSyncExternalStore(subscribeTopLayerHost, getTopLayerHost, () => null);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (title, options) => push("success", title, options),
      error: (title, options) => push("error", title, options),
      info: (title, options) => push("info", title, options),
      dismiss,
    }),
    [push, dismiss],
  );

  const layer = (
    <>
      <ToastViewport toasts={toasts} onDismiss={dismiss} onPause={pause} onResume={resume} />
      {/* Keyed children, so the same message twice in a row is announced twice. */}
      <div role="status" className="sr-only">
        {polite ? <p key={polite.id}>{polite.text}</p> : null}
      </div>
      <div role="alert" className="sr-only">
        {assertive ? <p key={assertive.id}>{assertive.text}</p> : null}
      </div>
    </>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {host ? createPortal(layer, host) : layer}
    </ToastContext.Provider>
  );
}

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: string; iconColor: string }> = {
  success: {
    border: "border-emerald-500/30",
    icon: "ri-checkbox-circle-line",
    iconColor: "text-emerald-400",
  },
  error: {
    border: "border-red-500/30",
    icon: "ri-error-warning-line",
    iconColor: "text-red-400",
  },
  info: {
    border: "border-cyan-500/30",
    icon: "ri-information-line",
    iconColor: "text-cyan-400",
  },
};

function ToastViewport({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
}) {
  const { t } = useI18n();

  if (toasts.length === 0) return null;

  return (
    <section
      aria-label={t.common.toast.region}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:items-end"
    >
      {toasts.map((toast) => {
        const styles = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            onMouseEnter={() => onPause(toast.id)}
            onMouseLeave={() => onResume(toast.id)}
            onFocus={() => onPause(toast.id)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onResume(toast.id);
            }}
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${styles.border} bg-zinc-900/95 p-4 shadow-xl backdrop-blur-sm`}
          >
            <i className={`${styles.icon} ${styles.iconColor} mt-0.5 text-lg`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-zinc-300">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label={t.common.toast.dismiss}
              className="-m-1 cursor-pointer rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <i className="ri-close-line text-lg" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </section>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export default ToastProvider;
