import { describe, expect, it } from "vitest";

import { quote, quoteForCar, rentalDays } from "@/lib/domain/pricing";
import type { Car } from "@/types";

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

describe("rentalDays", () => {
  it("counts the nights between two dates", () => {
    expect(rentalDays("2026-11-20", "2026-11-22")).toBe(2);
    expect(rentalDays("2026-11-20", "2026-11-27")).toBe(7);
  });

  it("charges one day for a same-day booking", () => {
    expect(rentalDays("2026-11-20", "2026-11-20")).toBe(1);
  });
});

describe("quote", () => {
  it("adds the platform fee to the subtotal", () => {
    expect(quote(1500, "2026-11-20", "2026-11-22")).toEqual({
      days: 2,
      subtotal: 3000,
      fee: 300,
      total: 3300,
    });
  });

  it("rounds the fee to the nearest birr", () => {
    expect(quote(1333, "2026-11-20", "2026-11-23")).toEqual({
      days: 3,
      subtotal: 3999,
      fee: 400,
      total: 4399,
    });
  });

  it("quotes a car at its own daily price", () => {
    expect(quoteForCar(makeCar({ pricePerDay: 2400 }), "2026-11-20", "2026-11-21")).toEqual({
      days: 1,
      subtotal: 2400,
      fee: 240,
      total: 2640,
    });
  });
});
