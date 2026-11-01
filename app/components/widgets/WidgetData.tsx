"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import usePolledQuery from "@/app/hooks/usePolledQuery";

type Query<T> = ReturnType<typeof usePolledQuery<T>>;

interface Options {
  /**
   * Load only while a widget reading it is rendered — on the board, or as a
   * preview in the customize library — so a removed widget costs nothing.
   */
  lazy?: boolean;
  /** Load again every this many ms while the tab is visible; a failed refresh keeps the last data. */
  refresh?: number;
}

/**
 * Data that several widgets on a board show, loaded once by the board's page
 * rather than once per card: the overview's counters all come from one
 * response. A widget reads it with `useData()`.
 */
export function createWidgetData<T>(key: string, load: (signal: AbortSignal) => Promise<T>, options: Options = {}) {
  const Context = createContext<{ query: Query<T>; subscribe: () => () => void } | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [readers, setReaders] = useState(0);
    const active = !options.lazy || readers > 0;
    const query = usePolledQuery(active ? key : null, load, options.refresh ?? null);

    const subscribe = useCallback(() => {
      setReaders((count) => count + 1);
      return () => setReaders((count) => count - 1);
    }, []);

    return <Context.Provider value={{ query, subscribe }}>{children}</Context.Provider>;
  }

  function useContextOrThrow() {
    const context = useContext(Context);
    if (!context) throw new Error(`A widget reading "${key}" is rendered outside its board's provider.`);
    return context;
  }

  /** For a widget: reading the data is what makes a lazy source load. */
  function useData(): Query<T> {
    const context = useContextOrThrow();
    const { subscribe } = context;
    useEffect(() => (options.lazy ? subscribe() : undefined), [subscribe]);
    return context.query;
  }

  /** For the page around the board: its error and reload, without making a lazy source load. */
  function useStatus(): Query<T> {
    return useContextOrThrow().query;
  }

  return { Provider, useData, useStatus };
}
