import { describe, expect, it } from "vitest";

import {
  filterAvailableCars,
  isCarAvailable,
  isValidDateRange,
  rangesOverlap,
} from "@/lib/domain/availability";
import type { Booking, BookingStatus, Car } from "@/types";

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "bkg_test",
    carId: "car_test",
    renterId: "usr_renter",
    ownerId: "usr_owner",
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    days: 2,
    pricePerDay: 1500,
    subtotal: 3000,
    fee: 300,
    total: 3300,
    paymentStatus: "held",
    status: "confirmed",
    createdAt: "2026-11-01T09:00:00.000Z",
    updatedAt: "2026-11-01T09:00:00.000Z",
    ...overrides,
  };
}

function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    id: "car_test",
    ownerId: "usr_owner",
    make: "Toyota",
    model: "Corolla",
    year: 2019,
    transmission: "automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Bole",
    latitude: 9.0192,
    longitude: 38.7525,
    pricePerDay: 1500,
    photos: ["/images/cars/placeholder.svg"],
    description: "Test car",
    status: "approved",
    unavailableDates: [],
    createdAt: "2026-01-01T09:00:00.000Z",
    ...overrides,
  };
}

describe("rangesOverlap", () => {
  it("treats the return day as free for the next rental", () => {
    expect(
      rangesOverlap("2026-11-20", "2026-11-22", "2026-11-22", "2026-11-24"),
    ).toBe(false);
  });

  it("detects a shared night", () => {
    expect(
      rangesOverlap("2026-11-20", "2026-11-23", "2026-11-22", "2026-11-24"),
    ).toBe(true);
  });

  it("returns false for an empty range", () => {
    expect(
      rangesOverlap("2026-11-22", "2026-11-22", "2026-11-20", "2026-11-24"),
    ).toBe(false);
  });
});

describe("isValidDateRange", () => {
  it("accepts a well-formed range", () => {
    expect(isValidDateRange("2026-11-20", "2026-11-22")).toBe(true);
  });

  it("accepts a same-day rental", () => {
    expect(isValidDateRange("2026-11-20", "2026-11-20")).toBe(true);
  });

  it("rejects a backwards range", () => {
    expect(isValidDateRange("2026-11-22", "2026-11-20")).toBe(false);
  });

  it("rejects malformed dates", () => {
    expect(isValidDateRange("20-11-2026", "2026-11-22")).toBe(false);
    expect(isValidDateRange("2026-13-01", "2026-11-22")).toBe(false);
  });
});

describe("isCarAvailable", () => {
  it("is free when nothing overlaps", () => {
    expect(isCarAvailable(makeCar(), [], "2026-11-20", "2026-11-22")).toBe(
      true,
    );
  });

  it("respects the owner's blocked dates", () => {
    const car = makeCar({ unavailableDates: ["2026-11-21"] });
    expect(isCarAvailable(car, [], "2026-11-20", "2026-11-22")).toBe(false);
    // The return day is not a rental night.
    expect(isCarAvailable(car, [], "2026-11-21", "2026-11-22")).toBe(false);
    expect(isCarAvailable(car, [], "2026-11-22", "2026-11-24")).toBe(true);
  });

  it("blocks overlapping requests, confirmed and active bookings", () => {
    for (const status of [
      "requested",
      "confirmed",
      "in_progress",
      "disputed",
    ] satisfies BookingStatus[]) {
      expect(
        isCarAvailable(makeCar(), [makeBooking({ status })], "2026-11-21", "2026-11-23"),
      ).toBe(false);
    }
  });

  it("ignores finished and cancelled bookings", () => {
    for (const status of [
      "completed",
      "reviewed",
      "declined",
      "cancelled",
      "resolved",
    ] satisfies BookingStatus[]) {
      expect(
        isCarAvailable(makeCar(), [makeBooking({ status })], "2026-11-21", "2026-11-23"),
      ).toBe(true);
    }
  });

  it("ignores bookings on another car", () => {
    expect(
      isCarAvailable(
        makeCar(),
        [makeBooking({ carId: "car_other" })],
        "2026-11-21",
        "2026-11-23",
      ),
    ).toBe(true);
  });

  it("treats a same-day rental as one occupied night", () => {
    const car = makeCar({ unavailableDates: ["2026-11-20"] });
    expect(isCarAvailable(car, [], "2026-11-20", "2026-11-20")).toBe(false);
    expect(isCarAvailable(makeCar(), [], "2026-11-20", "2026-11-20")).toBe(
      true,
    );
    expect(
      isCarAvailable(
        makeCar(),
        [makeBooking({ startDate: "2026-11-20", endDate: "2026-11-20" })],
        "2026-11-20",
        "2026-11-20",
      ),
    ).toBe(false);
  });

  it("rejects an invalid range", () => {
    expect(isCarAvailable(makeCar(), [], "2026-11-22", "2026-11-20")).toBe(
      false,
    );
  });
});

describe("filterAvailableCars", () => {
  it("keeps only cars with no conflict", () => {
    const free = makeCar({ id: "car_free" });
    const booked = makeCar({ id: "car_booked" });
    const result = filterAvailableCars(
      [free, booked],
      [makeBooking({ carId: "car_booked" })],
      "2026-11-21",
      "2026-11-23",
    );

    expect(result.map((car) => car.id)).toEqual(["car_free"]);
  });
});
