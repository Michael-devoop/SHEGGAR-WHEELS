/**
 * Seed data integrity.
 *
 * The seed is the input every other layer trusts, so it is checked here
 * rather than discovered at runtime: referential integrity, price arithmetic,
 * availability, and coverage of every status the UI filters on.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BOOKING_STATUSES,
  CAR_STATUSES,
  NEIGHBOURHOODS,
  PAYMENT_STATUSES,
  USER_STATUSES,
} from "@/lib/constants";
import {
  seedAnnouncements,
  seedBookings,
  seedCars,
  seedDisputes,
  seedReviews,
  seedUsers,
} from "@/data/seed";
import { daysBetween, priceFor } from "@/data/seed/helpers";

const MS_PER_DAY = 86_400_000;

/** Every calendar date from start to end, both inclusive. */
function expandRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  for (let t = start; t <= end; t += MS_PER_DAY) {
    dates.push(new Date(t).toISOString().slice(0, 10));
  }
  return dates;
}

const userIds = new Set(seedUsers.map((u) => u.id));
const carIds = new Set(seedCars.map((c) => c.id));
const bookingIds = new Set(seedBookings.map((b) => b.id));

describe("seed coverage", () => {
  it("ships at least 8 cars and 3 users", () => {
    expect(seedCars.length).toBeGreaterThanOrEqual(8);
    expect(seedUsers.length).toBeGreaterThanOrEqual(3);
  });

  it("covers every booking status", () => {
    for (const status of BOOKING_STATUSES) {
      const count = seedBookings.filter((b) => b.status === status).length;
      expect(count, `no booking with status "${status}"`).toBeGreaterThan(0);
    }
  });

  it("covers every car status, user status and payment status", () => {
    expect(new Set(seedCars.map((c) => c.status))).toEqual(new Set(CAR_STATUSES));
    expect(new Set(seedUsers.map((u) => u.status))).toEqual(
      new Set(USER_STATUSES),
    );
    expect(new Set(seedBookings.map((b) => b.paymentStatus))).toEqual(
      new Set(PAYMENT_STATUSES),
    );
  });

  it("covers every neighbourhood", () => {
    const used = new Set(seedCars.map((c) => c.neighbourhood));
    for (const area of NEIGHBOURHOODS) {
      expect(used.has(area), `no car in "${area}"`).toBe(true);
    }
  });

  it("uses unique ids everywhere", () => {
    expect(new Set(seedUsers.map((u) => u.id)).size).toBe(seedUsers.length);
    expect(new Set(seedCars.map((c) => c.id)).size).toBe(seedCars.length);
    expect(new Set(seedBookings.map((b) => b.id)).size).toBe(seedBookings.length);
    expect(new Set(seedReviews.map((r) => r.id)).size).toBe(seedReviews.length);
    expect(new Set(seedDisputes.map((d) => d.id)).size).toBe(seedDisputes.length);
  });
});

describe("referential integrity", () => {
  it("links every car to a real owner", () => {
    for (const car of seedCars) {
      expect(userIds.has(car.ownerId), `${car.id} owner ${car.ownerId}`).toBe(
        true,
      );
    }
  });

  it("links every booking to a real car, renter and owner", () => {
    for (const booking of seedBookings) {
      expect(carIds.has(booking.carId), `${booking.id} car`).toBe(true);
      expect(userIds.has(booking.renterId), `${booking.id} renter`).toBe(true);
      expect(userIds.has(booking.ownerId), `${booking.id} owner`).toBe(true);
    }
  });

  it("gives every booking the owner of the car it is for", () => {
    const ownerByCar = new Map(seedCars.map((c) => [c.id, c.ownerId]));
    for (const booking of seedBookings) {
      expect(booking.ownerId).toBe(ownerByCar.get(booking.carId));
    }
  });

  it("links every review to a reviewed booking", () => {
    const bookingById = new Map(seedBookings.map((b) => [b.id, b]));
    for (const review of seedReviews) {
      const booking = bookingById.get(review.bookingId);
      expect(booking, `${review.id} booking`).toBeDefined();
      expect(booking?.status).toBe("reviewed");
      expect(review.carId).toBe(booking?.carId);
      expect(review.renterId).toBe(booking?.renterId);
      expect(review.ownerId).toBe(booking?.ownerId);
    }
  });

  it("links every dispute to a real booking and opener", () => {
    for (const dispute of seedDisputes) {
      expect(bookingIds.has(dispute.bookingId), `${dispute.id} booking`).toBe(
        true,
      );
      expect(userIds.has(dispute.openedBy), `${dispute.id} opener`).toBe(true);
    }
  });

  it("links every announcement to a real author", () => {
    for (const announcement of seedAnnouncements) {
      expect(userIds.has(announcement.createdBy)).toBe(true);
    }
  });

  it("never books a car that is not on the road", () => {
    const bookedCarIds = new Set(seedBookings.map((b) => b.carId));
    for (const car of seedCars) {
      if (car.status === "approved") continue;
      expect(bookedCarIds.has(car.id), `${car.id} is ${car.status}`).toBe(false);
    }
  });
});

describe("booking arithmetic", () => {
  it("derives days, subtotal, fee and total correctly", () => {
    for (const booking of seedBookings) {
      const days = daysBetween(booking.startDate, booking.endDate);
      const { subtotal, fee, total } = priceFor(booking.pricePerDay, days);

      expect(booking.days, `${booking.id} days`).toBe(days);
      expect(booking.subtotal, `${booking.id} subtotal`).toBe(subtotal);
      expect(booking.fee, `${booking.id} fee`).toBe(fee);
      expect(booking.total, `${booking.id} total`).toBe(total);
      expect(booking.total).toBe(booking.subtotal + booking.fee);
    }
  });

  it("keeps the rental length positive and the dates ordered", () => {
    for (const booking of seedBookings) {
      expect(booking.days, `${booking.id} days`).toBeGreaterThan(0);
      expect(booking.startDate < booking.endDate, `${booking.id} order`).toBe(
        true,
      );
      expect(Number.isNaN(Date.parse(booking.startDate))).toBe(false);
      expect(Number.isNaN(Date.parse(booking.endDate))).toBe(false);
    }
  });

  it("uses the car's daily rate", () => {
    const priceByCar = new Map(seedCars.map((c) => [c.id, c.pricePerDay]));
    for (const booking of seedBookings) {
      expect(booking.pricePerDay).toBe(priceByCar.get(booking.carId));
    }
  });
});

describe("availability", () => {
  it("blocks exactly the dates the car is booked for", () => {
    for (const car of seedCars) {
      const expected = new Set<string>();
      for (const booking of seedBookings.filter((b) => b.carId === car.id)) {
        for (const date of expandRange(booking.startDate, booking.endDate)) {
          expected.add(date);
        }
      }
      expect(new Set(car.unavailableDates), `${car.id} unavailable dates`).toEqual(
        expected,
      );
    }
  });

  it("never double books a car", () => {
    for (const car of seedCars) {
      const bookings = seedBookings.filter((b) => b.carId === car.id);
      for (let i = 0; i < bookings.length; i++) {
        for (let j = i + 1; j < bookings.length; j++) {
          const a = expandRange(bookings[i].startDate, bookings[i].endDate);
          const b = expandRange(bookings[j].startDate, bookings[j].endDate);
          const overlap = a.some((date) => b.includes(date));
          expect(overlap, `${car.id}: ${bookings[i].id} overlaps ${bookings[j].id}`).toBe(
            false,
          );
        }
      }
    }
  });

  it("gives every listed car at least one booking", () => {
    const bookedCarIds = new Set(seedBookings.map((b) => b.carId));
    for (const car of seedCars.filter((c) => c.status === "approved")) {
      expect(bookedCarIds.has(car.id), `${car.id} has no booking`).toBe(true);
    }
  });
});

describe("assets", () => {
  it("points every photo at a file that exists", () => {
    for (const car of seedCars) {
      expect(car.photos.length, `${car.id} has no photo`).toBeGreaterThan(0);
      for (const photo of car.photos) {
        // `photo` is a URL path ("/images/..."), so the leading slash has to
        // go before it can be resolved against the public directory.
        const target = path.resolve(
          process.cwd(),
          "public",
          photo.replace(/^\/+/, ""),
        );
        expect(existsSync(target), `${photo} does not exist`).toBe(true);
      }
    }
  });
});
