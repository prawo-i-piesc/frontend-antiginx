"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  info: 5000,
  // Errors usually carry something to act on, so they linger.
  error: 7000,
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, options?: ToastOptions) => {
      const id = nextId++;
      setToasts((current) => [...current.slice(-2), { id, variant, title, description: options?.description }]);

      const duration = options?.duration ?? DEFAULT_DURATION[variant];
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (title, options) => push("success", title, options),
      error: (title, options) => push("error", title, options),
      info: (title, options) => push("info", title, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
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
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      // Errors are announced immediately; the container is polite so a success
      // toast never interrupts what a screen reader is already saying.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:items-end"
    >
      {toasts.map((toast) => {
        const styles = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${styles.border} bg-zinc-900/95 p-4 shadow-xl backdrop-blur-sm`}
          >
            <i className={`${styles.icon} ${styles.iconColor} mt-0.5 text-lg`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-zinc-400">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-m-1 cursor-pointer rounded-md p-1 text-zinc-500 transition-colors hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <i className="ri-close-line text-lg" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export default ToastProvider;
