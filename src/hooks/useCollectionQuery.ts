"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";

/** Re-read local collections even when no storage event fires. */
export const COLLECTION_POLL_INTERVAL = 15_000;

const EMPTY: never[] = [];

/**
 * Cached, polling reads for a browser-backed collection.
 *
 * A storage write is the fast path: the sync bridge invalidates the matching
 * query immediately. Polling is the fallback for changes the subscription
 * cannot see, such as data written by another tab that missed an event or a
 * future remote source replacing localStorage.
 */
export function useCollectionQuery<T>(
  queryKey: QueryKey,
  read: () => T[],
): T[] {
  const { data } = useQuery({
    queryKey,
    queryFn: read,
    staleTime: COLLECTION_POLL_INTERVAL,
    refetchInterval: COLLECTION_POLL_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    networkMode: "always",
  });

  return data ?? (EMPTY as T[]);
}
