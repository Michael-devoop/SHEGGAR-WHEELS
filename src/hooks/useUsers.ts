"use client";

/**
 * Stored users as React state.
 *
 * Only admin screens read this hook; public pages resolve one user at a time
 * through `getUserById`.
 */
import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { listUsers } from "@/lib/data/users";
import { localStore } from "@/lib/storage/storage";
import type { User } from "@/types";

const subscribe = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.users, () => onChange());

const getSnapshot = (): string => JSON.stringify(listUsers());
const getServerSnapshot = (): string => "[]";

export function useUsers(): User[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(raw) as User[];
}
