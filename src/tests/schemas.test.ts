import { describe, expect, it } from "vitest";

import {
  BOOKING_STATUSES,
  CAR_STATUSES,
  DISPUTE_STATUSES,
  PAYMENT_STATUSES,
  ROLES,
  TRANSMISSIONS,
  USER_STATUSES,
} from "@/lib/constants";
import {
  announcementSchema,
  bookingSchema,
  carSchema,
  disputeSchema,
  reviewSchema,
  sessionSchema,
  userSchema,
} from "@/lib/schemas";

const user = {
  id: "u1",
  name: "Test Renter",
  email: "renter@example.com",
  phone: "0911000000",
  roles: ["renter"],
  status: "active",
  createdAt: "2026-10-20T09:30:00.000Z",
};

const car = {
  id: "c1",
  ownerId: "u2",
  make: "Toyota",
  model: "Corolla",
  year: 2021,
  transmission: "automatic",
  seats: 5,
  city: "Addis Ababa",
  neighbourhood: "Bole",
  latitude: 8.999,
  longitude: 38.789,
  pricePerDay: 3500,
  photos: ["/images/cars/corolla.jpg"],
  description: "Clean and reliable.",
  status: "approved",
  unavailableDates: ["2026-11-01"],
  createdAt: "2026-10-20T09:30:00.000Z",
};

const booking = {
  id: "b1",
  carId: "c1",
  renterId: "u1",
  ownerId: "u2",
  startDate: "2026-11-10",
  endDate: "2026-11-12",
  days: 3,
  pricePerDay: 3500,
  subtotal: 10500,
  fee: 1050,
  total: 11550,
  paymentStatus: "held",
  status: "requested",
  createdAt: "2026-10-20T09:30:00.000Z",
  updatedAt: "2026-10-20T09:30:00.000Z",
};

describe("entity schemas", () => {
  it("accepts every role", () => {
    for (const role of ROLES) {
      expect(userSchema.safeParse({ ...user, roles: [role] }).success).toBe(true);
    }
    expect(userSchema.safeParse({ ...user, roles: ["superuser"] }).success).toBe(false);
  });

  it("accepts every user status and rejects an unknown one", () => {
    for (const status of USER_STATUSES) {
      expect(userSchema.safeParse({ ...user, status }).success).toBe(true);
    }
    expect(userSchema.safeParse({ ...user, status: "deleted" }).success).toBe(false);
  });

  it("accepts every car status and transmission", () => {
    for (const status of CAR_STATUSES) {
      expect(carSchema.safeParse({ ...car, status }).success).toBe(true);
    }
    for (const transmission of TRANSMISSIONS) {
      expect(carSchema.safeParse({ ...car, transmission }).success).toBe(true);
    }
    expect(carSchema.safeParse({ ...car, transmission: "cvt" }).success).toBe(false);
  });

  it("accepts every booking and payment status", () => {
    for (const status of BOOKING_STATUSES) {
      expect(bookingSchema.safeParse({ ...booking, status }).success).toBe(true);
    }
    for (const paymentStatus of PAYMENT_STATUSES) {
      expect(
        bookingSchema.safeParse({ ...booking, paymentStatus }).success,
      ).toBe(true);
    }
    expect(bookingSchema.safeParse({ ...booking, status: "refunded" }).success).toBe(
      false,
    );
  });

  it("rejects a booking that ends before it starts", () => {
    expect(
      bookingSchema.safeParse({
        ...booking,
        startDate: "2026-11-12",
        endDate: "2026-11-10",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed ISO dates", () => {
    expect(carSchema.safeParse({ ...car, unavailableDates: ["2026-13-40"] }).success).toBe(
      false,
    );
    expect(userSchema.safeParse({ ...user, createdAt: "20 Oct 2026" }).success).toBe(
      false,
    );
  });

  it("accepts reviews, disputes, announcements and sessions", () => {
    expect(
      reviewSchema.safeParse({
        id: "r1",
        bookingId: "b1",
        carId: "c1",
        renterId: "u1",
        ownerId: "u2",
        rating: 5,
        comment: "Great car.",
        createdAt: "2026-10-20T09:30:00.000Z",
      }).success,
    ).toBe(true);

    for (const status of DISPUTE_STATUSES) {
      expect(
        disputeSchema.safeParse({
          id: "d1",
          bookingId: "b1",
          openedBy: "u1",
          reason: "Damage",
          description: "Scratch on the door.",
          status,
          createdAt: "2026-10-20T09:30:00.000Z",
        }).success,
      ).toBe(true);
    }

    expect(
      announcementSchema.safeParse({
        id: "a1",
        title: "Welcome",
        message: "Demo data only.",
        active: true,
        createdAt: "2026-10-20T09:30:00.000Z",
        createdBy: "u3",
      }).success,
    ).toBe(true);

    expect(
      sessionSchema.safeParse({
        userId: "u1",
        signedInAt: "2026-10-20T09:30:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("rejects a rating outside 1 to 5", () => {
    expect(
      reviewSchema.safeParse({
        id: "r1",
        bookingId: "b1",
        carId: "c1",
        renterId: "u1",
        ownerId: "u2",
        rating: 6,
        comment: "Too much.",
        createdAt: "2026-10-20T09:30:00.000Z",
      }).success,
    ).toBe(false);
  });
});
