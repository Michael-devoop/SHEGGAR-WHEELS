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

const { respondToBooking } = await import("@/lib/actions/bookingActions");
const { signInWithEmail, signOutAction } = await import(
  "@/lib/actions/authActions"
);
const { getBookingById } = await import("@/lib/data/bookings");

beforeEach(() => {
  local.clear();
  session.clear();
});

describe("respondToBooking", () => {
  it("accepts a request and holds the payment", () => {
    signInWithEmail("marta@example.com");
    const result = respondToBooking("bkg_01", "accept");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("confirmed");
    expect(result.data.paymentStatus).toBe("held");
  });

  it("declines a request", () => {
    signInWithEmail("marta@example.com");
    const result = respondToBooking("bkg_01", "decline");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("declined");
    expect(result.data.paymentStatus).toBe("unpaid");
  });

  it("starts a confirmed trip and completes an active one", () => {
    signInWithEmail("marta@example.com");
    expect(respondToBooking("bkg_02", "start").ok).toBe(true);

    const completed = respondToBooking("bkg_02", "complete");
    expect(completed.ok).toBe(true);
    if (!completed.ok) return;
    expect(completed.data.status).toBe("completed");
    expect(completed.data.paymentStatus).toBe("paid");
  });

  it("persists the decision", () => {
    signInWithEmail("marta@example.com");
    respondToBooking("bkg_01", "accept");

    expect(getBookingById("bkg_01")?.status).toBe("confirmed");
  });

  it("refuses a non-owner and a signed-out visitor", () => {
    signInWithEmail("yonas@example.com");
    expect(respondToBooking("bkg_01", "accept").ok).toBe(false);

    signOutAction();
    expect(respondToBooking("bkg_01", "accept").ok).toBe(false);
  });

  it("refuses a booking that belongs to another owner", () => {
    signInWithEmail("selam@example.com");
    expect(respondToBooking("bkg_01", "accept").ok).toBe(false);
  });

  it("refuses an event that does not apply", () => {
    signInWithEmail("marta@example.com");
    const result = respondToBooking("bkg_04", "accept");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/cannot accept/i);
  });

  it("refuses an unknown booking", () => {
    signInWithEmail("marta@example.com");
    expect(respondToBooking("bkg_missing", "accept").ok).toBe(false);
  });
});
