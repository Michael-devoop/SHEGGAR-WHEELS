/**
 * Low-level browser storage helpers.
 *
 * Browser storage is user-writable and untrusted: a value can be malformed
 * JSON, it can be truncated, it can be left over from an older schema, and
 * the whole API can throw — Safari in private mode exposes `localStorage` but
 * throws on write, and some blocked third-party contexts throw on access.
 *
 * The rules this module enforces:
 * - A read never throws and never returns a value of the wrong shape.
 * - A write never throws; it reports success with a boolean.
 * - A missing or unusable store behaves exactly like an empty store.
 * - On the server, reads return the fallback and writes are no-ops.
 *
 * Server/client contract: localStorage is not available while rendering on
 * the server, so a value read during render on the client will not match the
 * server HTML. Read from an effect (or through the query hooks), never
 * during render.
 *
 * This module is deliberately domain-agnostic. The keys live in
 * `@/lib/constants`; the typed collection helpers live in `@/lib/data`.
 */

export interface ReadOptions {
  /**
   * Rejects a stored value whose shape is not what the caller expects.
   * A rejected value is treated exactly like a missing one.
   */
  guard?: (value: unknown) => boolean;
  /**
   * Delete the stored value when it cannot be parsed or fails the guard.
   *
   * Off by default: removing data is destructive, and a value that fails the
   * guard may simply come from a newer schema. Turn it on for keys you own
   * end to end.
   */
  pruneInvalid?: boolean;
}

export interface StoreClient {
  /** False when the store is unavailable (server, private mode, blocked). */
  isAvailable(): boolean;
  /** Reads and parses a value, falling back on any problem. */
  readJson<T>(key: string, fallback: T, options?: ReadOptions): T;
  /** Serialises and writes a value. Returns false when it could not be written. */
  writeJson(key: string, value: unknown): boolean;
  /** Deletes a key. Returns false when the store is unavailable. */
  removeKey(key: string): boolean;
  /** Reads a value that must be an array. */
  readList<T>(key: string, options?: ReadOptions): T[];
  /** Writes an array. */
  writeList<T>(key: string, items: readonly T[]): boolean;
  /** Reads a value that must be a plain object, or null. */
  readRecord<T>(key: string, options?: ReadOptions): T | null;
  /** Writes an object. */
  writeRecord<T extends object>(key: string, value: T): boolean;
  /**
   * Notifies on changes to a key, in this tab and in other tabs.
   * Returns an unsubscribe function.
   */
  subscribe(key: string, handler: (value: string | null) => void): () => void;
}

type StoreKind = "local" | "session";

/**
 * Resolves a browser storage area.
 *
 * Returns null when there is no DOM, when the area is missing, or when the
 * browser refuses to let us use it. The probe write is what catches Safari's
 * private mode, where the API exists but every write throws.
 */
function probeStore(kind: StoreKind): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    const store = kind === "local" ? window.localStorage : window.sessionStorage;
    if (!store) return null;

    const probe = "__sw_probe__";
    store.setItem(probe, "1");
    store.removeItem(probe);

    return store;
  } catch {
    return null;
  }
}

export function resolveLocalStorage(): Storage | null {
  return probeStore("local");
}

export function resolveSessionStorage(): Storage | null {
  return probeStore("session");
}

const isArray = (value: unknown): boolean => Array.isArray(value);

const isPlainObject = (value: unknown): boolean =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function warn(message: string, error?: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  if (error === undefined) console.warn(`[storage] ${message}`);
  else console.warn(`[storage] ${message}`, error);
}

/**
 * Creates a client bound to one storage area.
 *
 * The resolved store is cached, so the availability probe runs at most once
 * per client. The factory exists so the same logic can be pointed at
 * localStorage, at sessionStorage, or at an in-memory store in tests.
 */
export function createStoreClient(resolve: () => Storage | null): StoreClient {
  let cached: Storage | null | undefined;
  const listeners = new Set<(key: string, value: string | null) => void>();

  const getStore = (): Storage | null => {
    if (cached === undefined) cached = resolve();
    return cached;
  };

  const emit = (key: string, value: string | null): void => {
    for (const listener of listeners) {
      try {
        listener(key, value);
      } catch (error) {
        warn(`a subscriber for "${key}" threw`, error);
      }
    }
  };

  const client: StoreClient = {
    isAvailable(): boolean {
      return getStore() !== null;
    },

    readJson<T>(key: string, fallback: T, options: ReadOptions = {}): T {
      const store = getStore();
      if (!store) return fallback;

      let raw: string | null;
      try {
        raw = store.getItem(key);
      } catch (error) {
        warn(`could not read "${key}"`, error);
        return fallback;
      }

      if (raw === null) return fallback;

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        warn(`the value stored at "${key}" is not valid JSON`, error);
        if (options.pruneInvalid) client.removeKey(key);
        return fallback;
      }

      if (parsed === null || parsed === undefined) return fallback;

      if (options.guard && !options.guard(parsed)) {
        warn(`the value stored at "${key}" does not match the expected shape`);
        if (options.pruneInvalid) client.removeKey(key);
        return fallback;
      }

      return parsed as T;
    },

    writeJson(key: string, value: unknown): boolean {
      const store = getStore();
      if (!store) return false;

      let raw: string;
      try {
        raw = JSON.stringify(value);
      } catch (error) {
        warn(`the value for "${key}" could not be serialised`, error);
        return false;
      }

      if (raw === undefined) {
        warn(`the value for "${key}" is not serialisable`);
        return false;
      }

      try {
        store.setItem(key, raw);
      } catch (error) {
        warn(`could not write "${key}" (quota exceeded or storage blocked)`, error);
        return false;
      }

      emit(key, raw);
      return true;
    },

    removeKey(key: string): boolean {
      const store = getStore();
      if (!store) return false;

      try {
        store.removeItem(key);
      } catch (error) {
        warn(`could not remove "${key}"`, error);
        return false;
      }

      emit(key, null);
      return true;
    },

    readList<T>(key: string, options: ReadOptions = {}): T[] {
      return client.readJson<unknown[]>(key, [], {
        guard: isArray,
        ...options,
      }) as T[];
    },

    writeList<T>(key: string, items: readonly T[]): boolean {
      return client.writeJson(key, items);
    },

    readRecord<T>(key: string, options: ReadOptions = {}): T | null {
      return client.readJson<T | null>(key, null, {
        guard: isPlainObject,
        ...options,
      }) as T | null;
    },

    writeRecord<T extends object>(key: string, value: T): boolean {
      return client.writeJson(key, value);
    },

    subscribe(key: string, handler: (value: string | null) => void): () => void {
      const local = (changedKey: string, value: string | null): void => {
        if (changedKey === key) handler(value);
      };
      listeners.add(local);

      // The `storage` event only fires in other tabs, and only for
      // localStorage. Same-tab changes arrive through `emit` above.
      let onStorage: ((event: StorageEvent) => void) | null = null;
      if (
        typeof window !== "undefined" &&
        typeof window.addEventListener === "function"
      ) {
        onStorage = (event: StorageEvent): void => {
          // `key === null` means the whole store was cleared.
          if (event.key !== null && event.key !== key) return;
          handler(event.key === null ? null : event.newValue);
        };
        window.addEventListener("storage", onStorage);
      }

      return () => {
        listeners.delete(local);
        if (onStorage && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
  };

  return client;
}

/** The persistent store: users, cars, bookings, reviews, disputes, announcements. */
export const localStore: StoreClient = createStoreClient(resolveLocalStorage);
