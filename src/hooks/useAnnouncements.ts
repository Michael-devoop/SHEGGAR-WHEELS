"use client";

/** Stored announcements as React state, newest first. */
import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { listAnnouncements } from "@/lib/data/announcements";
import { localStore } from "@/lib/storage/storage";
import type { Announcement } from "@/types";

const subscribe = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.announcements, () => onChange());

const getSnapshot = (): string => JSON.stringify(listAnnouncements());
const getServerSnapshot = (): string => "[]";

export function useAnnouncements(): Announcement[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(raw) as Announcement[];
}
