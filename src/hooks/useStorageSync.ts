"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { queryKeys } from "@/lib/queryKeys";
import { localStore } from "@/lib/storage/storage";

const STORAGE_QUERIES = [
  { storageKey: STORAGE_KEYS.users, queryKey: queryKeys.users },
  { storageKey: STORAGE_KEYS.cars, queryKey: queryKeys.cars },
  { storageKey: STORAGE_KEYS.bookings, queryKey: queryKeys.bookings },
  { storageKey: STORAGE_KEYS.reviews, queryKey: queryKeys.reviews },
  { storageKey: STORAGE_KEYS.disputes, queryKey: queryKeys.disputes },
  {
    storageKey: STORAGE_KEYS.announcements,
    queryKey: queryKeys.announcements,
  },
] as const;

/**
 * Keeps the query cache in step with browser storage.
 *
 * Storage writes are the low-latency path. Polling in the collection hooks
 * remains enabled as a safety net, but it should rarely be the reason a screen
 * updates.
 */
export function useStorageSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribes = STORAGE_QUERIES.map(({ storageKey, queryKey }) =>
      localStore.subscribe(storageKey, () => {
        void queryClient.invalidateQueries({
          queryKey,
          refetchType: "all",
        });
      }),
    );

    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [queryClient]);
}
