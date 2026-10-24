import { describe, expect, it } from "vitest";

import {
  bookingEventsFor,
  canTransition,
  nextBookingStatus,
  transition,
} from "@/lib/domain/bookingMachine";
import type { Booking, BookingStatus } from "@/types";

const AT = "2026-11-15T10:00:00.000Z";

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
    paymentStatus: "unpaid",
    status: "requested",
    createdAt: "2026-11-01T09:00:00.000Z",
    updatedAt: "2026-11-01T09:00:00.000Z",
    ...overrides,
  };
}

describe("nextBookingStatus", () => {
  it("maps the happy path", () => {
    expect(nextBookingStatus("requested", "accept")).toBe("confirmed");
    expect(nextBookingStatus("confirmed", "start")).toBe("in_progress");
    expect(nextBookingStatus("in_progress", "complete")).toBe("completed");
    expect(nextBookingStatus("completed", "review")).toBe("reviewed");
    expect(nextBookingStatus("disputed", "resolve")).toBe("resolved");
  });

  it("returns null for an event that does not apply", () => {
    expect(nextBookingStatus("requested", "start")).toBeNull();
    expect(nextBookingStatus("cancelled", "accept")).toBeNull();
    expect(nextBookingStatus("resolved", "dispute")).toBeNull();
  });
});

describe("canTransition", () => {
  it("lets an owner accept or decline a request", () => {
    expect(canTransition("requested", "accept", "owner")).toBe(true);
    expect(canTransition("requested", "decline", "owner")).toBe(true);
    expect(canTransition("requested", "accept", "renter")).toBe(false);
    expect(canTransition("requested", "accept", "admin")).toBe(false);
  });

  it("lets a renter cancel, and nobody accept a confirmed booking", () => {
    expect(canTransition("confirmed", "cancel", "renter")).toBe(true);
    expect(canTransition("confirmed", "accept", "owner")).toBe(false);
  });

  it("only lets an admin resolve a dispute", () => {
    expect(canTransition("disputed", "resolve", "admin")).toBe(true);
    expect(canTransition("disputed", "resolve", "owner")).toBe(false);
    expect(canTransition("disputed", "resolve", "renter")).toBe(false);
  });
});

describe("bookingEventsFor", () => {
  it("lists the owner's options for a request", () => {
    expect(bookingEventsFor("requested", "owner")).toEqual([
      "accept",
      "decline",
    ]);
  });

  it("lists the renter's options for a request", () => {
    expect(bookingEventsFor("requested", "renter")).toEqual(["cancel"]);
  });

  it("is empty for a finished booking", () => {
    expect(bookingEventsFor("cancelled", "renter")).toEqual([]);
    expect(bookingEventsFor("resolved", "admin")).toEqual([]);
  });
});

describe("transition", () => {
  it("moves a booking and holds the payment on acceptance", () => {
    const result = transition(makeBooking(), "accept", "owner", AT);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("confirmed");
    expect(result.data.paymentStatus).toBe("held");
    expect(result.data.updatedAt).toBe(AT);
  });

  it("refunds the held amount when a confirmed booking is cancelled", () => {
    const result = transition(
      makeBooking({ status: "confirmed", paymentStatus: "held" }),
      "cancel",
      "renter",
      AT,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("cancelled");
    expect(result.data.paymentStatus).toBe("refunded");
  });

  it("leaves an unpaid request unpaid when cancelled", () => {
    const result = transition(makeBooking(), "cancel", "renter", AT);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.paymentStatus).toBe("unpaid");
  });

  it("pays the owner when the rental completes", () => {
    const result = transition(
      makeBooking({ status: "in_progress", paymentStatus: "held" }),
      "complete",
      "owner",
      AT,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("completed");
    expect(result.data.paymentStatus).toBe("paid");
  });

  it("refuses an action the role cannot take", () => {
    const result = transition(makeBooking(), "accept", "renter", AT);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/owner/i);
  });

  it("refuses an action that does not apply to the status", () => {
    const result = transition(
      makeBooking({ status: "completed", paymentStatus: "paid" }),
      "start",
      "owner",
      AT,
    );

    expect(result.ok).toBe(false);
  });

  it("does not mutate the original booking", () => {
    const booking = makeBooking();
    transition(booking, "accept", "owner", AT);
    expect(booking.status).toBe("requested");
    expect(booking.updatedAt).toBe("2026-11-01T09:00:00.000Z");
  });

  it("accepts every status in the union without throwing", () => {
    const statuses: BookingStatus[] = [
      "requested",
      "confirmed",
      "in_progress",
      "completed",
      "reviewed",
      "declined",
      "cancelled",
      "disputed",
      "resolved",
    ];

    for (const status of statuses) {
      expect(() =>
        transition(makeBooking({ status }), "accept", "owner", AT),
      ).not.toThrow();
    }
  });
});
