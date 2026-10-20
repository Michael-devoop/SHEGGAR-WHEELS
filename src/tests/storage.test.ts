import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStoreClient } from "@/lib/storage/storage";

type MemoryStorage = Storage & {
  data: Map<string, string>;
  failOnWrite: boolean;
  failOnRead: boolean;
};

function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const data = new Map<string, string>(Object.entries(initial));

  const store: MemoryStorage = {
    data,
    failOnWrite: false,
    failOnRead: false,
    get length() {
      return data.size;
    },
    key: (index: number) => [...data.keys()][index] ?? null,
    getItem(key: string) {
      if (store.failOnRead) throw new Error("read blocked");
      return data.has(key) ? (data.get(key) as string) : null;
    },
    setItem(key: string, value: string) {
      if (store.failOnWrite) throw new Error("quota exceeded");
      data.set(key, String(value));
    },
    removeItem(key: string) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };

  return store;
}

describe("safe JSON parsing", () => {
  it("returns the parsed value for valid JSON", () => {
    const store = createMemoryStorage({ cars: '[{"id":"c1"}]' });
    const client = createStoreClient(() => store);

    expect(client.readJson<unknown[]>("cars", [])).toEqual([{ id: "c1" }]);
  });

  it("returns the fallback for malformed JSON instead of throwing", () => {
    const store = createMemoryStorage({ cars: "{not json" });
    const client = createStoreClient(() => store);

    expect(() => client.readJson("cars", [])).not.toThrow();
    expect(client.readJson("cars", [])).toEqual([]);
  });

  it("returns the fallback when the stored value is literally null", () => {
    const store = createMemoryStorage({ cars: "null" });
    const client = createStoreClient(() => store);

    expect(client.readJson("cars", ["fallback"])).toEqual(["fallback"]);
  });

  it("returns the fallback when the value fails the shape guard", () => {
    const store = createMemoryStorage({ cars: '{"id":"c1"}' });
    const client = createStoreClient(() => store);

    const result = client.readJson("cars", [], {
      guard: (value) => Array.isArray(value),
    });

    expect(result).toEqual([]);
  });

  it("keeps a value that fails the guard when pruning is off", () => {
    const store = createMemoryStorage({ cars: '{"id":"c1"}' });
    const client = createStoreClient(() => store);

    client.readJson("cars", [], { guard: (value) => Array.isArray(value) });

    expect(store.data.has("cars")).toBe(true);
  });

  it("removes a value that fails the guard when pruning is on", () => {
    const store = createMemoryStorage({ cars: "{not json" });
    const client = createStoreClient(() => store);

    client.readJson("cars", [], {
      guard: (value) => Array.isArray(value),
      pruneInvalid: true,
    });

    expect(store.data.has("cars")).toBe(false);
  });

  it("returns the fallback when the store is unavailable", () => {
    const client = createStoreClient(() => null);

    expect(client.isAvailable()).toBe(false);
    expect(client.readJson("cars", ["fallback"])).toEqual(["fallback"]);
    expect(client.writeJson("cars", [])).toBe(false);
    expect(client.removeKey("cars")).toBe(false);
  });

  it("returns the fallback when the read itself throws", () => {
    const store = createMemoryStorage({ cars: "[]" });
    store.failOnRead = true;
    const client = createStoreClient(() => store);

    expect(client.readJson("cars", ["fallback"])).toEqual(["fallback"]);
  });
});

describe("writing", () => {
  it("round-trips a value", () => {
    const store = createMemoryStorage();
    const client = createStoreClient(() => store);

    expect(client.writeJson("cars", [{ id: "c1" }])).toBe(true);
    expect(client.readJson("cars", [])).toEqual([{ id: "c1" }]);
  });

  it("reports failure instead of throwing when the write is rejected", () => {
    const store = createMemoryStorage();
    store.failOnWrite = true;
    const client = createStoreClient(() => store);

    expect(() => client.writeJson("cars", [])).not.toThrow();
    expect(client.writeJson("cars", [])).toBe(false);
  });

  it("reports failure for a value that cannot be serialised", () => {
    const store = createMemoryStorage();
    const client = createStoreClient(() => store);

    expect(client.writeJson("fn", () => undefined)).toBe(false);
  });

  it("removes a key", () => {
    const store = createMemoryStorage({ cars: "[]" });
    const client = createStoreClient(() => store);

    expect(client.removeKey("cars")).toBe(true);
    expect(store.data.has("cars")).toBe(false);
  });
});

describe("collections", () => {
  it("reads an empty list when the key is missing", () => {
    const client = createStoreClient(() => createMemoryStorage());
    expect(client.readList("cars")).toEqual([]);
  });

  it("reads an empty list when the stored value is not an array", () => {
    const store = createMemoryStorage({ cars: '{"id":"c1"}' });
    const client = createStoreClient(() => store);

    expect(client.readList("cars")).toEqual([]);
  });

  it("round-trips a list", () => {
    const store = createMemoryStorage();
    const client = createStoreClient(() => store);

    client.writeList("cars", [{ id: "c1" }, { id: "c2" }]);
    expect(client.readList("cars")).toEqual([{ id: "c1" }, { id: "c2" }]);
  });

  it("reads null when a record is missing", () => {
    const client = createStoreClient(() => createMemoryStorage());
    expect(client.readRecord("car")).toBeNull();
  });

  it("reads null when a stored record is actually a list", () => {
    const store = createMemoryStorage({ car: "[]" });
    const client = createStoreClient(() => store);

    expect(client.readRecord("car")).toBeNull();
  });

  it("round-trips a record", () => {
    const store = createMemoryStorage();
    const client = createStoreClient(() => store);

    client.writeRecord("car", { id: "c1" });
    expect(client.readRecord("car")).toEqual({ id: "c1" });
  });
});

describe("subscriptions", () => {
  it("notifies on a write to the same key", () => {
    const client = createStoreClient(() => createMemoryStorage());
    const seen: (string | null)[] = [];

    client.subscribe("cars", (value) => seen.push(value));
    client.writeJson("cars", []);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe("[]");
  });

  it("notifies with null on a removal", () => {
    const client = createStoreClient(() => createMemoryStorage());
    const seen: (string | null)[] = [];

    client.subscribe("cars", (value) => seen.push(value));
    client.removeKey("cars");

    expect(seen).toEqual([null]);
  });

  it("does not notify for a different key", () => {
    const client = createStoreClient(() => createMemoryStorage());
    const seen: (string | null)[] = [];

    client.subscribe("cars", (value) => seen.push(value));
    client.writeJson("bookings", []);

    expect(seen).toHaveLength(0);
  });

  it("stops notifying after unsubscribe", () => {
    const client = createStoreClient(() => createMemoryStorage());
    const seen: (string | null)[] = [];

    const unsubscribe = client.subscribe("cars", (value) => seen.push(value));
    unsubscribe();
    client.writeJson("cars", []);

    expect(seen).toHaveLength(0);
  });
});

describe("session", () => {
  let memory: MemoryStorage;

  beforeEach(() => {
    vi.resetModules();
    memory = createMemoryStorage();
    vi.stubGlobal("window", { sessionStorage: memory });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has no session when nothing is stored", async () => {
    const { readSession, isSignedIn } = await import("@/lib/storage/session");

    expect(readSession()).toBeNull();
    expect(isSignedIn()).toBe(false);
  });

  it("rejects a stored session with the wrong shape", async () => {
    memory.setItem("sw_session_v1", '{"userId":""}');
    const { readSession } = await import("@/lib/storage/session");

    expect(readSession()).toBeNull();
  });

  it("signs a user in and out", async () => {
    const { signIn, readSession, signOut, isSignedIn } = await import(
      "@/lib/storage/session"
    );

    const session = signIn("u1");
    expect(session.userId).toBe("u1");
    expect(Number.isNaN(Date.parse(session.signedInAt))).toBe(false);
    expect(readSession()).toEqual(session);
    expect(isSignedIn()).toBe(true);

    signOut();
    expect(readSession()).toBeNull();
    expect(isSignedIn()).toBe(false);
  });

  it("notifies subscribers when the session changes", async () => {
    const { signIn, signOut, subscribeToSession } = await import(
      "@/lib/storage/session"
    );

    const seen: (unknown)[] = [];
    const unsubscribe = subscribeToSession((session) => seen.push(session));

    signIn("u1");
    signOut();

    expect(seen).toHaveLength(2);
    expect(seen[0]).toMatchObject({ userId: "u1" });
    expect(seen[1]).toBeNull();

    unsubscribe();
  });

  it("keeps the checkout draft for the tab and clears it on demand", async () => {
    const {
      readCheckoutDraft,
      writeCheckoutDraft,
      clearCheckoutDraft,
    } = await import("@/lib/storage/session");

    expect(readCheckoutDraft({ carId: "" })).toEqual({ carId: "" });

    writeCheckoutDraft({ carId: "c1" });
    expect(readCheckoutDraft({ carId: "" })).toEqual({ carId: "c1" });

    clearCheckoutDraft();
    expect(readCheckoutDraft({ carId: "" })).toEqual({ carId: "" });
  });

  it("stores the session in sessionStorage, not localStorage", async () => {
    const { signIn } = await import("@/lib/storage/session");

    signIn("u1");

    expect(memory.data.has("sw_session_v1")).toBe(true);
  });
});
