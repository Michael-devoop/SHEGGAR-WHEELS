"use client";

/**
 * Stored reviews as React state.
 *
 * Snapshots are strings so a freshly sorted array still compares equal when
 * the underlying data has not changed.
 */
import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { listReviews } from "@/lib/data/reviews";
import { localStore } from "@/lib/storage/storage";
import type { Review } from "@/types";

const subscribe = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.reviews, () => onChange());

const getSnapshot = (): string => JSON.stringify(listReviews());
const getServerSnapshot = (): string => "[]";

export function useReviews(): Review[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(raw) as Review[];
}
