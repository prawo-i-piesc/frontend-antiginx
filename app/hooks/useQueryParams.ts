"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Filters and paging kept in the address, so a view can be linked, reloaded
 * and walked back through without losing its place.
 *
 * Changes replace the current history entry: typing a search should not leave
 * one entry per keystroke behind. A null or empty value removes the parameter.
 *
 * Reads useSearchParams, so the component needs a Suspense boundary above it.
 */
export default function useQueryParams() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const update = useCallback(
    (changes: Record<string, string | number | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      const search = next.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return [params, update] as const;
}
