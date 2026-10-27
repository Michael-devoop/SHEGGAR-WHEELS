import { describe, expect, it } from "vitest";

import {
  buildMonthlyEarnings,
  buildStatusBreakdown,
} from "@/lib/domain/chartData";
import type { Booking } from "@/types";

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
    paymentStatus: "paid",
    status: "completed",
    createdAt: "2026-11-01T09:00:00.000Z",
    updatedAt: "2026-11-01T09:00:00.000Z",
    ...overrides,
  };
}

describe("buildMonthlyEarnings", () => {
  it("groups completed bookings by return month in chronological order", () => {
    const months = buildMonthlyEarnings([
      makeBooking({ id: "bkg_jan", endDate: "2026-01-12", total: 2000 }),
      makeBooking({ id: "bkg_feb_a", endDate: "2026-02-03", total: 1500 }),
      makeBooking({ id: "bkg_feb_b", endDate: "2026-02-20", total: 2500 }),
    ]);

    expect(months).toEqual([
      {
        key: "2026-01",
        label: "January 2026",
        shortLabel: "Jan 2026",
        total: 2000,
        trips: 1,
      },
      {
        key: "2026-02",
        label: "February 2026",
        shortLabel: "Feb 2026",
        total: 4000,
        trips: 2,
      },
    ]);
  });

  it("orders months across a year boundary", () => {
    const months = buildMonthlyEarnings([
      makeBooking({ id: "bkg_jan", endDate: "2026-01-04", total: 1000 }),
      makeBooking({ id: "bkg_dec", endDate: "2025-12-28", total: 2000 }),
    ]);

    expect(months.map((month) => month.key)).toEqual(["2025-12", "2026-01"]);
  });

  it("returns an empty list when there are no completed bookings", () => {
    expect(buildMonthlyEarnings([])).toEqual([]);
  });
});

describe("buildStatusBreakdown", () => {
  it("counts bookings and puts the largest group first", () => {
    const rows = buildStatusBreakdown([
      makeBooking({ id: "bkg_1", status: "requested" }),
      makeBooking({ id: "bkg_2", status: "completed" }),
      makeBooking({ id: "bkg_3", status: "completed" }),
      makeBooking({ id: "bkg_4", status: "cancelled" }),
    ]);

    expect(rows).toEqual([
      { status: "completed", count: 2 },
      { status: "requested", count: 1 },
      { status: "cancelled", count: 1 },
    ]);
  });

  it("uses canonical status order to break ties", () => {
    const rows = buildStatusBreakdown([
      makeBooking({ id: "bkg_1", status: "disputed" }),
      makeBooking({ id: "bkg_2", status: "requested" }),
      makeBooking({ id: "bkg_3", status: "confirmed" }),
    ]);

    expect(rows.map((row) => row.status)).toEqual([
      "requested",
      "confirmed",
      "disputed",
    ]);
  });

  it("returns an empty list when there are no bookings", () => {
    expect(buildStatusBreakdown([])).toEqual([]);
  });
});
