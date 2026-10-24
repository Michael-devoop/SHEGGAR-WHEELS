import { beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number {
    return this.data.size;
  }
  clear(): void {
    this.data.clear();
  }
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();

vi.stubGlobal("window", {
  localStorage: local,
  sessionStorage: session,
});

const { setUserStatus } = await import("@/lib/actions/adminActions");
const { signInWithEmail } = await import("@/lib/actions/authActions");
const { getUserById } = await import("@/lib/data/users");

beforeEach(() => {
  local.clear();
  session.clear();
});

describe("setUserStatus", () => {
  it("suspends and reactivates an account", () => {
    signInWithEmail("selam@example.com");

    const suspended = setUserStatus("usr_02", "suspended");
    expect(suspended.ok).toBe(true);
    if (!suspended.ok) return;
    expect(suspended.data.status).toBe("suspended");
    expect(getUserById("usr_02")?.status).toBe("suspended");

    const active = setUserStatus("usr_02", "active");
    expect(active.ok).toBe(true);
    if (!active.ok) return;
    expect(active.data.status).toBe("active");
  });

  it("refuses to suspend the signed-in admin", () => {
    signInWithEmail("selam@example.com");
    const result = setUserStatus("usr_03", "suspended");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/your own account/i);
  });

  it("refuses a non-admin, a signed-out visitor and an unknown user", () => {
    signInWithEmail("marta@example.com");
    expect(setUserStatus("usr_02", "suspended").ok).toBe(false);

    signInWithEmail("selam@example.com");
    expect(setUserStatus("usr_missing", "suspended").ok).toBe(false);
  });
});
