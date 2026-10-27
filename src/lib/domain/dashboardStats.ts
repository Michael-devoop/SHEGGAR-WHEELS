import type { Booking, BookingStatus } from "@/types";

/**
 * Dashboard helpers.
 *
 * The monthly window accepts `now` so it stays testable and avoids
 * server/client hydration drift. Omitting it uses the current clock at call
 * time, which is right for client-only dashboards.
 */

const MONTHS_IN_YEAR = 12;
const EARNED_STATUSES = new Set<BookingStatus>(["completed", "reviewed"]);

function parseDate(value: string): Date | null {
  const text = value.length === 10 ? `${value}T00:00:00.000Z` : value;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Counts activity in the trailing `months` window, oldest month first.
 *
 * Dates outside the window are ignored, and each bucket is UTC-aligned so a
 * date-only booking never shifts a month at a timezone boundary.
 */
export function buildMonthlyActivity(
  dates: readonly string[],
  months = 8,
  now = new Date(),
): number[] {
  const count = Number.isFinite(months) ? Math.max(0, Math.floor(months)) : 0;
  const points = Array<number>(count).fill(0);
  if (count === 0) return points;

  const currentMonth =
    now.getUTCFullYear() * MONTHS_IN_YEAR + now.getUTCMonth();

  for (const value of dates) {
    const date = parseDate(value);
    if (!date) continue;

    const month =
      date.getUTCFullYear() * MONTHS_IN_YEAR + date.getUTCMonth();
    const age = currentMonth - month;

    if (age >= 0 && age < count) {
      points[count - 1 - age] += 1;
    }
  }

  return points;
}

/** Mean rating rounded to one decimal, or null when there are no reviews. */
export function averageRating(ratings: readonly number[]): number | null {
  if (ratings.length === 0) return null;

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return Math.round((total / ratings.length) * 10) / 10;
}

/**
 * A trip only counts as earnings once it is finished and the renter's payment
 * has actually been captured. Resolved/refunded bookings stay out of totals.
 */
export function isPaidEarnedBooking(
  booking: Pick<Booking, "status" | "paymentStatus">,
): boolean {
  return (
    EARNED_STATUSES.has(booking.status) && booking.paymentStatus === "paid"
  );
}
