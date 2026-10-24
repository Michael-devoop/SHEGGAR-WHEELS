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

const { openDispute, resolveDispute } = await import(
  "@/lib/actions/disputeActions"
);
const { signInWithEmail } = await import("@/lib/actions/authActions");
const { getBookingById } = await import("@/lib/data/bookings");
const { getDisputeForBooking } = await import("@/lib/data/disputes");

beforeEach(() => {
  local.clear();
  session.clear();
});

describe("openDispute", () => {
  it("lets the renter open a dispute on a completed trip", () => {
    signInWithEmail("yonas@example.com");
    const result = openDispute({
      bookingId: "bkg_04",
      reason: "Cleaning charge",
      description:
        "The car was returned clean and I was still charged a cleaning fee.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("open");
    expect(result.data.openedBy).toBe("usr_02");
    expect(getDisputeForBooking("bkg_04")?.reason).toBe("Cleaning charge");
    expect(getBookingById("bkg_04")?.status).toBe("disputed");
  });

  it("lets the owner open a dispute on an active trip", () => {
    signInWithEmail("selam@example.com");
    const result = openDispute({
      bookingId: "bkg_03",
      reason: "Late return",
      description:
        "The car has not been returned and the renter is not answering calls.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.openedBy).toBe("usr_03");
    expect(getBookingById("bkg_03")?.status).toBe("disputed");
  });

  it("refuses a booking that already has a dispute", () => {
    signInWithEmail("yonas@example.com");
    expect(
      openDispute({
        bookingId: "bkg_08",
        reason: "Second complaint",
        description: "Trying to open a second dispute on the same booking.",
      }).ok,
    ).toBe(false);
  });

  it("refuses someone outside the booking and invalid details", () => {
    signInWithEmail("selam@example.com");
    expect(
      openDispute({
        bookingId: "bkg_04",
        reason: "Not my trip",
        description: "An admin who was not part of this booking cannot open it.",
      }).ok,
    ).toBe(false);

    signInWithEmail("yonas@example.com");
    expect(
      openDispute({
        bookingId: "bkg_04",
        reason: "x",
        description: "short",
      }).ok,
    ).toBe(false);
  });
});

describe("resolveDispute", () => {
  it("lets an admin resolve a dispute and the booking", () => {
    signInWithEmail("selam@example.com");
    const result = resolveDispute(
      "dsp_01",
      "Photos confirmed the damage was pre-existing, so no charge is due.",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("resolved");
    expect(result.data.resolvedBy).toBe("usr_03");
    expect(result.data.resolutionNotes).toMatch(/pre-existing/);
    expect(getBookingById("bkg_08")?.status).toBe("resolved");
  });

  it("refuses a non-admin, a resolved dispute and short notes", () => {
    signInWithEmail("marta@example.com");
    expect(resolveDispute("dsp_01", "Not my decision to make.").ok).toBe(false);

    signInWithEmail("selam@example.com");
    expect(resolveDispute("dsp_01", "Too short").ok).toBe(false);

    expect(resolveDispute("dsp_01", "Damage was pre-existing, charge waived.").ok).toBe(
      true,
    );
    expect(resolveDispute("dsp_01", "Trying to resolve it again.").ok).toBe(
      false,
    );
  });
});
