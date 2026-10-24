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

const { createBooking, cancelBooking } = await import("@/lib/actions/bookingActions");
const { signInWithEmail, signOutAction } = await import(
  "@/lib/actions/authActions"
);
const { getBookingById, listBookings } = await import("@/lib/data/bookings");
const { daysFromToday, seedBookings } = await import("@/data/seed");

beforeEach(() => {
  local.clear();
  session.clear();
});

describe("createBooking", () => {
  it("creates a requested, unpaid booking with a price snapshot", () => {
    signInWithEmail("yonas@example.com");
    const startDate = daysFromToday(60);
    const endDate = daysFromToday(62);

    const result = createBooking({ carId: "car_02", startDate, endDate });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({
      carId: "car_02",
      renterId: "usr_02",
      ownerId: "usr_01",
      startDate,
      endDate,
      days: 2,
      pricePerDay: 1500,
      subtotal: 3000,
      fee: 300,
      total: 3300,
      status: "requested",
      paymentStatus: "unpaid",
    });
    expect(result.data.id).toMatch(/^bkg_/);
  });

  it("persists the booking in the stored collection", () => {
    signInWithEmail("yonas@example.com");
    const result = createBooking({
      carId: "car_02",
      startDate: daysFromToday(60),
      endDate: daysFromToday(61),
    });

    expect(result.ok).toBe(true);
    expect(listBookings()).toHaveLength(seedBookings.length + 1);
  });

  it("asks a signed-out visitor to sign in", () => {
    signOutAction();
    const result = createBooking({
      carId: "car_02",
      startDate: daysFromToday(60),
      endDate: daysFromToday(61),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/sign in/i);
  });

  it("requires the renter role", () => {
    signInWithEmail("selam@example.com");
    const result = createBooking({
      carId: "car_02",
      startDate: daysFromToday(60),
      endDate: daysFromToday(61),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/renter/i);
  });

  it("refuses to let an owner book their own car", () => {
    signInWithEmail("marta@example.com");
    const result = createBooking({
      carId: "car_01",
      startDate: daysFromToday(60),
      endDate: daysFromToday(61),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/your own car/i);
  });

  it("refuses unavailable dates", () => {
    signInWithEmail("yonas@example.com");
    const result = createBooking({
      carId: "car_01",
      startDate: daysFromToday(5),
      endDate: daysFromToday(7),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/no longer available/i);
  });

  it("refuses a second request for the same dates", () => {
    signInWithEmail("yonas@example.com");
    const dates = {
      carId: "car_02",
      startDate: daysFromToday(60),
      endDate: daysFromToday(62),
    };

    expect(createBooking(dates).ok).toBe(true);
    const second = createBooking(dates);
    expect(second.ok).toBe(false);
  });

  it("refuses a past pickup date", () => {
    signInWithEmail("yonas@example.com");
    const result = createBooking({
      carId: "car_02",
      startDate: daysFromToday(-1),
      endDate: daysFromToday(1),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/past/i);
  });

  it("refuses a backwards or impossible date range", () => {
    signInWithEmail("yonas@example.com");
    expect(
      createBooking({
        carId: "car_02",
        startDate: daysFromToday(62),
        endDate: daysFromToday(60),
      }).ok,
    ).toBe(false);
    expect(
      createBooking({
        carId: "car_02",
        startDate: "2026-02-30",
        endDate: "2026-03-02",
      }).ok,
    ).toBe(false);
  });

  it("refuses a car that is not open for booking", () => {
    signInWithEmail("yonas@example.com");
    const result = createBooking({
      carId: "car_06",
      startDate: daysFromToday(60),
      endDate: daysFromToday(61),
    });

    expect(result.ok).toBe(false);
  });

  it("refuses an unknown car", () => {
    signInWithEmail("yonas@example.com");
    const result = createBooking({
      carId: "car_missing",
      startDate: daysFromToday(60),
      endDate: daysFromToday(61),
    });

    expect(result.ok).toBe(false);
  });
});

describe("cancelBooking", () => {
  it("lets the renter cancel a pending request", () => {
    signInWithEmail("yonas@example.com");
    const result = cancelBooking("bkg_01");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("cancelled");
    expect(result.data.paymentStatus).toBe("unpaid");
  });

  it("refunds a held booking when the owner cancels", () => {
    signInWithEmail("marta@example.com");
    const result = cancelBooking("bkg_02");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("cancelled");
    expect(result.data.paymentStatus).toBe("refunded");
  });

  it("persists the new status", () => {
    signInWithEmail("yonas@example.com");
    cancelBooking("bkg_01");

    const stored = getBookingById("bkg_01");
    expect(stored?.status).toBe("cancelled");
  });

  it("refuses somebody who is not part of the booking", () => {
    signInWithEmail("selam@example.com");
    const result = cancelBooking("bkg_01");

    expect(result.ok).toBe(false);
  });

  it("refuses a finished booking", () => {
    signInWithEmail("yonas@example.com");
    const result = cancelBooking("bkg_04");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/cannot cancel/i);
  });

  it("refuses a signed-out visitor and an unknown booking", () => {
    signOutAction();
    expect(cancelBooking("bkg_01").ok).toBe(false);

    signInWithEmail("yonas@example.com");
    expect(cancelBooking("bkg_missing").ok).toBe(false);
  });
});
