import { BOOKING_STATUSES } from "@/lib/constants";
import type { Booking, BookingStatus } from "@/types";

export type MonthlyEarning = {
  key: string;
  label: string;
  shortLabel: string;
  total: number;
  trips: number;
};

export type StatusCount = {
  status: BookingStatus;
  count: number;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const STATUS_ORDER = new Map<BookingStatus, number>(
  BOOKING_STATUSES.map((status, index) => [status, index]),
);

export function buildMonthlyEarnings(
  bookings: readonly Booking[],
): MonthlyEarning[] {
  const byMonth = new Map<string, { total: number; trips: number }>();

  for (const booking of bookings) {
    const key = booking.endDate.slice(0, 7);
    const bucket = byMonth.get(key) ?? { total: 0, trips: 0 };
    bucket.total += booking.total;
    bucket.trips += 1;
    byMonth.set(key, bucket);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket]) => {
      const [year, month] = key.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, 1));

      return {
        key,
        label: MONTH_FORMATTER.format(date),
        shortLabel: SHORT_MONTH_FORMATTER.format(date),
        total: bucket.total,
        trips: bucket.trips,
      };
    });
}

export function buildStatusBreakdown(
  bookings: readonly Booking[],
): StatusCount[] {
  const counts = new Map<BookingStatus, number>();

  for (const booking of bookings) {
    counts.set(booking.status, (counts.get(booking.status) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        (STATUS_ORDER.get(a.status) ?? 0) - (STATUS_ORDER.get(b.status) ?? 0),
    );
}
