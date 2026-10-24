"use client";

/**
 * The signed-in session, as React state.
 *
 * `useSyncExternalStore` reads sessionStorage without a hydration mismatch:
 * the server snapshot is always "signed out", then the browser value is
 * applied after hydration. `useHydrated` lets guards wait for that moment
 * instead of redirecting during the first paint.
 */
import { useSyncExternalStore } from "react";

import { getUserById } from "@/lib/data/users";
import { readSession, subscribeToSession } from "@/lib/storage/session";
import type { Session, User } from "@/types";

const subscribe = (onChange: () => void): (() => void) =>
  subscribeToSession(() => onChange());

/** Strings compare by value, so a fresh session object is still a stable snapshot. */
const getSnapshot = (): string => JSON.stringify(readSession());
const getServerSnapshot = (): string => "null";

const noSubscribe = (): (() => void) => () => {};
const alwaysHydrated = (): boolean => true;
const neverHydrated = (): boolean => false;

export function useSession(): Session | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return raw === "null" ? null : (JSON.parse(raw) as Session);
}

/** True once React has switched from the server snapshot to the browser store. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noSubscribe, alwaysHydrated, neverHydrated);
}

export function useCurrentUser(): {
  session: Session | null;
  user: User | null;
  hydrated: boolean;
} {
  const session = useSession();
  const hydrated = useHydrated();
  return {
    session,
    user: session ? getUserById(session.userId) : null,
    hydrated,
  };
}
