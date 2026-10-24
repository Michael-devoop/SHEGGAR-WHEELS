"use client";

/**
 * Stored disputes as React state.
 *
 * Snapshots are strings so a freshly sorted array still compares equal when
 * the underlying data has not changed.
 */
import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { listDisputes } from "@/lib/data/disputes";
import { localStore } from "@/lib/storage/storage";
import type { Dispute } from "@/types";

const subscribe = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.disputes, () => onChange());

const getSnapshot = (): string => JSON.stringify(listDisputes());
const getServerSnapshot = (): string => "[]";

export function useDisputes(): Dispute[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(raw) as Dispute[];
}
