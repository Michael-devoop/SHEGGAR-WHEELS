import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/types";

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

const { createUser, signInWithEmail, signOutAction } = await import(
  "@/lib/actions/authActions"
);
const { findUserByEmail } = await import("@/lib/data/users");
const { hasRole, canAccessArea, homeForUser } = await import(
  "@/lib/domain/permissions"
);
const { safeReturnPath } = await import("@/lib/domain/safeReturnPath");
const { readSession } = await import("@/lib/storage/session");

const active = (
  roles: User["roles"],
  status: User["status"] = "active",
): User => ({
  id: "usr_test",
  name: "Test User",
  email: "test@example.com",
  phone: "+251911000000",
  roles,
  status,
  createdAt: "2026-01-01T00:00:00.000Z",
});

describe("permissions", () => {
  it("lets each role into its own area and nobody else's", () => {
    expect(hasRole(active(["renter"]), "renter")).toBe(true);
    expect(hasRole(active(["renter"]), "owner")).toBe(false);
    expect(hasRole(active(["owner"]), "owner")).toBe(true);
    expect(hasRole(active(["admin"]), "admin")).toBe(true);
    expect(hasRole(active(["admin"]), "renter")).toBe(false);
  });

  it("supports users with more than one role", () => {
    const both = active(["renter", "owner"]);
    expect(canAccessArea(both, "renter")).toBe(true);
    expect(canAccessArea(both, "owner")).toBe(true);
    expect(canAccessArea(both, "admin")).toBe(false);
  });

  it("blocks suspended users and signed-out visitors", () => {
    expect(canAccessArea(active(["admin"], "suspended"), "admin")).toBe(false);
    expect(canAccessArea(null, "renter")).toBe(false);
    expect(hasRole(null, "renter")).toBe(false);
  });

  it("sends each user to the right home", () => {
    expect(homeForUser(active(["admin", "owner"]))).toBe("/admin");
    expect(homeForUser(active(["owner", "renter"]))).toBe("/owner");
    expect(homeForUser(active(["renter"]))).toBe("/renter/dashboard");
    expect(homeForUser(null)).toBe("/signin");
  });
});

describe("safeReturnPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeReturnPath("/cars")).toBe("/cars");
    expect(safeReturnPath("/renter/bookings?tab=active#top")).toBe(
      "/renter/bookings?tab=active#top",
    );
  });

  it("rejects anything that could leave the site", () => {
    for (const value of [
      null,
      "",
      "cars",
      "//evil.example",
      "/\\evil.example",
      "https://evil.example",
      "javascript:alert(1)",
    ]) {
      expect(safeReturnPath(value)).toBe("/");
    }
  });

  it("uses the supplied fallback instead of /", () => {
    expect(safeReturnPath("https://evil.example", "/dashboard")).toBe(
      "/dashboard",
    );
  });
});

describe("accounts", () => {
  beforeEach(() => {
    local.clear();
    session.clear();
  });

  it("creates an account that can be found by email", () => {
    const result = createUser({
      name: "Hanna Girma",
      email: "hanna@example.com",
      phone: "+251911234567",
      roles: ["renter", "owner"],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.roles).toEqual(["renter", "owner"]);
    expect(findUserByEmail("HANNA@example.com")?.id).toBe(result.data.id);
  });

  it("rejects a duplicate email regardless of case", () => {
    createUser({
      name: "Hanna Girma",
      email: "hanna@example.com",
      phone: "+251911234567",
      roles: ["renter"],
    });

    const again = createUser({
      name: "Someone Else",
      email: "Hanna@Example.com",
      phone: "+251911765432",
      roles: ["renter"],
    });

    expect(again).toEqual({
      ok: false,
      error: "An account with that email already exists.",
    });
  });

  it("rejects malformed details", () => {
    const result = createUser({
      name: "H",
      email: "not-an-email",
      phone: "123",
      roles: [],
    });
    expect(result.ok).toBe(false);
  });
});

describe("sign in and out", () => {
  beforeEach(() => {
    local.clear();
    session.clear();
  });

  it("rejects an unknown email", () => {
    expect(signInWithEmail("nobody@example.com")).toEqual({
      ok: false,
      error: "No account with that email.",
    });
  });

  it("refuses a suspended account", () => {
    expect(signInWithEmail("abel@example.com")).toEqual({
      ok: false,
      error: "This account is suspended.",
    });
    expect(readSession()).toBeNull();
  });

  it("signs in an active seeded user", () => {
    const result = signInWithEmail("marta@example.com");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(readSession()?.userId).toBe(result.data.id);
    expect(result.data.roles).toContain("owner");
  });

  it("signs out cleanly", () => {
    signInWithEmail("marta@example.com");
    signOutAction();
    expect(readSession()).toBeNull();
  });
});
