/**
 * The signed-in session and other session-scoped state.
 *
 * Session state lives in `sessionStorage`, so it disappears when the tab
 * closes. That is the right lifetime for a demo sign-in and it avoids
 * leaving a signed-in state behind on a shared machine.
 *
 * The persisted domain data (users, cars, bookings, ...) lives in
 * `localStorage` and is handled by `@/lib/data`.
 */
import { STORAGE_KEYS } from "@/lib/constants";
import type { Session } from "@/types";
import {
  createStoreClient,
  resolveSessionStorage,
  type ReadOptions,
  type StoreClient,
} from "./storage";

/** The session-scoped store. */
export const sessionStore: StoreClient = createStoreClient(
  resolveSessionStorage,
);

/** A stored session is only usable if it carries a user id and a timestamp. */
const isSession = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.userId === "string" &&
    candidate.userId.length > 0 &&
    typeof candidate.signedInAt === "string" &&
    candidate.signedInAt.length > 0
  );
};

export function isSessionStorageAvailable(): boolean {
  return sessionStore.isAvailable();
}

/** The current session, or null when signed out. Never throws. */
export function readSession(): Session | null {
  return sessionStore.readJson<Session | null>(STORAGE_KEYS.session, null, {
    guard: isSession,
  });
}

export function writeSession(session: Session): boolean {
  return sessionStore.writeJson(STORAGE_KEYS.session, session);
}

/**
 * Starts a session for a user.
 *
 * Call this from an event handler, not during render: it reads the clock,
 * which is request-time data.
 */
export function signIn(userId: string): Session {
  const session: Session = { userId, signedInAt: new Date().toISOString() };
  writeSession(session);
  return session;
}

/** Ends the session. Idempotent. */
export function signOut(): void {
  sessionStore.removeKey(STORAGE_KEYS.session);
}

export function isSignedIn(): boolean {
  return readSession() !== null;
}

/**
 * Notifies when the session changes, in this tab and in other tabs.
 * Returns an unsubscribe function.
 */
export function subscribeToSession(
  handler: (session: Session | null) => void,
): () => void {
  return sessionStore.subscribe(STORAGE_KEYS.session, (raw) => {
    if (raw === null) {
      handler(null);
      return;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      handler(isSession(parsed) ? (parsed as Session) : null);
    } catch {
      handler(null);
    }
  });
}

/**
 * The in-progress checkout, kept for the lifetime of the tab so a half
 * finished booking survives a refresh but never leaks into the next session.
 */
export function readCheckoutDraft<T>(
  fallback: T,
  options?: ReadOptions,
): T {
  return sessionStore.readJson<T>(STORAGE_KEYS.checkoutDraft, fallback, options);
}

export function writeCheckoutDraft(value: unknown): boolean {
  return sessionStore.writeJson(STORAGE_KEYS.checkoutDraft, value);
}

export function clearCheckoutDraft(): boolean {
  return sessionStore.removeKey(STORAGE_KEYS.checkoutDraft);
}
