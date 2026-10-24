"use client";

/**
 * Stored bookings as React state.
 *
 * Snapshots are strings so a freshly sorted array still compares equal when
 * the underlying data has not changed. Writes by the actions emit on the same
 * store, so lists and details update without a refetch.
 */
import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { listBookings } from "@/lib/data/bookings";
import { localStore } from "@/lib/storage/storage";
import type { Booking } from "@/types";

const subscribe = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.bookings, () => onChange());

const getSnapshot = (): string => JSON.stringify(listBookings());
const getServerSnapshot = (): string => "[]";

export function useBookings(): Booking[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(raw) as Booking[];
}
