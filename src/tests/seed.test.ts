import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { getSeeds } from "@/data/seed";
import {
  BOOKING_STATUSES,
  CAR_STATUSES,
  PLATFORM_FEE_RATE,
  STORAGE_KEYS,
} from "@/lib/constants";
import {
  announcementSchema,
  bookingSchema,
  carSchema,
  disputeSchema,
  reviewSchema,
  userSchema,
} from "@/lib/schemas";
import { ensureSeeded, resetDemoData } from "@/lib/storage/init";
import { createStoreClient } from "@/lib/storage/storage";

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

describe("seed data", () => {
  const seeds = getSeeds();

  it("validates every collection against its schema", () => {
    expect(z.array(userSchema).safeParse(seeds.users).success).toBe(true);
    expect(z.array(carSchema).safeParse(seeds.cars).success).toBe(true);
    expect(z.array(bookingSchema).safeParse(seeds.bookings).success).toBe(true);
    expect(z.array(reviewSchema).safeParse(seeds.reviews).success).toBe(true);
    expect(z.array(disputeSchema).safeParse(seeds.disputes).success).toBe(true);
    expect(
      z.array(announcementSchema).safeParse(seeds.announcements).success,
    ).toBe(true);
  });

  it("covers every car and booking status", () => {
    const carStatuses = new Set(seeds.cars.map((car) => car.status));
    for (const status of CAR_STATUSES) expect(carStatuses.has(status)).toBe(true);

    const bookingStatuses = new Set(seeds.bookings.map((b) => b.status));
    for (const status of BOOKING_STATUSES) {
      expect(bookingStatuses.has(status)).toBe(true);
    }
  });

  it("has the cast the demo flow needs", () => {
    const suspended = seeds.users.filter((user) => user.status === "suspended");
    const admin = seeds.users.filter((user) => user.roles.includes("admin"));
    const owners = new Set(
      seeds.cars
        .filter((car) => car.status === "approved")
        .map((car) => car.ownerId),
    );

    expect(suspended.length).toBeGreaterThanOrEqual(1);
    expect(admin.length).toBeGreaterThanOrEqual(1);
    expect(owners.size).toBeGreaterThanOrEqual(1);
    expect(
      seeds.cars.filter((car) => car.status === "approved").length,
    ).toBeGreaterThanOrEqual(5);
    expect(seeds.cars.length).toBeGreaterThanOrEqual(8);
    for (const user of seeds.users) expect(user.email).toMatch(/@example\.com$/);
  });

  it("keeps booking snapshots consistent", () => {
    for (const booking of seeds.bookings) {
      expect(booking.days).toBeGreaterThanOrEqual(1);
      expect(booking.subtotal).toBe(booking.pricePerDay * booking.days);
      expect(booking.fee).toBe(
        Math.round(booking.subtotal * PLATFORM_FEE_RATE),
      );
      expect(booking.total).toBe(booking.subtotal + booking.fee);
    }
  });

  it("gives every review, dispute and announcement a real booking or user", () => {
    const bookingIds = new Set(seeds.bookings.map((b) => b.id));
    const userIds = new Set(seeds.users.map((u) => u.id));

    for (const review of seeds.reviews) {
      expect(bookingIds.has(review.bookingId)).toBe(true);
    }
    for (const dispute of seeds.disputes) {
      expect(bookingIds.has(dispute.bookingId)).toBe(true);
      expect(userIds.has(dispute.openedBy)).toBe(true);
    }
    for (const announcement of seeds.announcements) {
      expect(userIds.has(announcement.createdBy)).toBe(true);
    }
  });
});

describe("demo initialisation", () => {
  let local: MemoryStorage;
  let store: ReturnType<typeof createStoreClient>;

  beforeEach(() => {
    local = new MemoryStorage();
    vi.stubGlobal("window", {
      localStorage: local,
      sessionStorage: new MemoryStorage(),
    });
    store = createStoreClient(() => local);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const keys = [
    STORAGE_KEYS.users,
    STORAGE_KEYS.cars,
    STORAGE_KEYS.bookings,
    STORAGE_KEYS.reviews,
    STORAGE_KEYS.disputes,
    STORAGE_KEYS.announcements,
  ];

  it("writes every key when the store is empty", () => {
    ensureSeeded(store);

    for (const key of keys) {
      expect(local.getItem(key)).not.toBeNull();
    }
  });

  it("never overwrites data on a second call", () => {
    ensureSeeded(store);

    const users = store.readList<Record<string, unknown>>(STORAGE_KEYS.users);
    const edited = [{ ...users[0], name: "Edited" }];
    local.setItem(STORAGE_KEYS.users, JSON.stringify(edited));

    ensureSeeded(store);

    expect(store.readList(STORAGE_KEYS.users)).toEqual(edited);
  });

  it("restores only the missing key", () => {
    ensureSeeded(store);
    local.removeItem(STORAGE_KEYS.cars);

    ensureSeeded(store);

    expect(local.getItem(STORAGE_KEYS.cars)).not.toBeNull();
    for (const key of keys) {
      if (key !== STORAGE_KEYS.cars) expect(local.getItem(key)).not.toBeNull();
    }
  });

  it("resetDemoData overwrites edited data", () => {
    ensureSeeded(store);
    local.setItem(STORAGE_KEYS.users, JSON.stringify([]));

    resetDemoData(store);

    expect(store.readList(STORAGE_KEYS.users).length).toBeGreaterThan(0);
  });
});
