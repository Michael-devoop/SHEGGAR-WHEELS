import { describe, expect, it } from "vitest";

import {
  averageRating,
  buildMonthlyActivity,
  isPaidEarnedBooking,
} from "@/lib/domain/dashboardStats";

const NOW = new Date("2026-10-27T12:00:00.000Z");

describe("buildMonthlyActivity", () => {
  it("buckets dates into the last eight months, oldest first", () => {
    const points = buildMonthlyActivity(
      [
        "2026-10-02",
        "2026-10-20",
        "2026-09-15T09:00:00.000Z",
        "2026-05-01",
        "2026-03-31",
        "2026-02-28",
      ],
      8,
      NOW,
    );

    expect(points).toEqual([1, 0, 1, 0, 0, 0, 1, 2]);
  });

  it("ignores dates outside the window and unparseable values", () => {
    const points = buildMonthlyActivity(
      ["2025-12-31", "2026-11-01", "not-a-date", "2026-10-01"],
      8,
      NOW,
    );

    expect(points).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it("returns a zero-filled window when there is no activity", () => {
    expect(buildMonthlyActivity([], 6, NOW)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("crosses a year boundary without shifting the trailing window", () => {
    const points = buildMonthlyActivity(
      ["2025-12-31", "2026-01-01", "2026-02-01"],
      3,
      new Date("2026-02-15T12:00:00.000Z"),
    );

    expect(points).toEqual([1, 1, 1]);
  });

  it("uses the UTC month for timestamps with an offset", () => {
    const points = buildMonthlyActivity(
      ["2026-10-01T00:30:00+03:00"],
      2,
      new Date("2026-10-02T00:00:00.000Z"),
    );

    expect(points).toEqual([1, 0]);
  });

  it("returns an empty series for a non-positive window", () => {
    expect(buildMonthlyActivity(["2026-10-01"], 0, NOW)).toEqual([]);
    expect(buildMonthlyActivity(["2026-10-01"], -2, NOW)).toEqual([]);
  });
});

describe("averageRating", () => {
  it("rounds the mean to one decimal place", () => {
    expect(averageRating([5, 4, 4])).toBe(4.3);
  });

  it("keeps a single rating unchanged", () => {
    expect(averageRating([5])).toBe(5);
  });

  it("returns null when there are no ratings", () => {
    expect(averageRating([])).toBeNull();
  });
});

describe("isPaidEarnedBooking", () => {
  it("counts completed and reviewed bookings only when paid", () => {
    expect(
      isPaidEarnedBooking({ status: "completed", paymentStatus: "paid" }),
    ).toBe(true);
    expect(
      isPaidEarnedBooking({ status: "reviewed", paymentStatus: "paid" }),
    ).toBe(true);
    expect(
      isPaidEarnedBooking({ status: "completed", paymentStatus: "held" }),
    ).toBe(false);
  });

  it("excludes refunded and resolved bookings", () => {
    expect(
      isPaidEarnedBooking({ status: "resolved", paymentStatus: "refunded" }),
    ).toBe(false);
    expect(
      isPaidEarnedBooking({ status: "cancelled", paymentStatus: "paid" }),
    ).toBe(false);
  });
});
