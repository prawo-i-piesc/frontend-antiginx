"use client";

import { createContext, useContext, type ReactNode } from "react";

import useApiQuery from "@/app/hooks/useApiQuery";

type Query<T> = ReturnType<typeof useApiQuery<T>>;

/**
 * Data that several widgets on a board show, loaded once by the board's page
 * rather than once per card: the overview's counters all come from one
 * response. A widget reads it with `useData()`.
 */
export function createWidgetData<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const Context = createContext<Query<T> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const query = useApiQuery(key, load);
    return <Context.Provider value={query}>{children}</Context.Provider>;
  }

  function useData(): Query<T> {
    const query = useContext(Context);
    if (!query) throw new Error(`A widget reading "${key}" is rendered outside its board's provider.`);
    return query;
  }

  return { Provider, useData };
}
