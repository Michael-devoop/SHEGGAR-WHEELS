"use client";

/**
 * Stored cars as React state.
 *
 * Snapshots are strings so a freshly sorted array still compares equal when
 * the underlying data has not changed. Owner and admin screens read through
 * this hook; the public catalogue is rendered on the server.
 */
import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { listCars } from "@/lib/data/cars";
import { localStore } from "@/lib/storage/storage";
import type { Car } from "@/types";

const subscribe = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.cars, () => onChange());

const getSnapshot = (): string => JSON.stringify(listCars());
const getServerSnapshot = (): string => "[]";

export function useCars(): Car[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(raw) as Car[];
}
