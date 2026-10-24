/**
 * Availability rules.
 *
 * A rental occupies nights: `[startDate, endDate)`. The return day is free
 * for the next pickup, so back-to-back bookings are allowed. A car is blocked
 * by its owner's `unavailableDates` and by any booking that still holds the
 * car (requested, confirmed, in progress or disputed).
 */
import type { Booking, BookingStatus, Car, ISODate } from "@/types";

/** Booking states that still reserve the car. */
const BLOCKING_STATUSES: readonly BookingStatus[] = [
  "requested",
  "confirmed",
  "in_progress",
  "disputed",
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const nextDay = (value: ISODate): ISODate =>
  new Date(Date.parse(value) + 86_400_000).toISOString().slice(0, 10);

/** A same-day rental still claims that night, so it is widened to one day. */
const occupiedEnd = (startDate: ISODate, endDate: ISODate): ISODate =>
  startDate === endDate ? nextDay(endDate) : endDate;

const isRealDate = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  // Reject impossible calendar dates that Date.parse silently rolls over.
  return new Date(parsed).toISOString().slice(0, 10) === value;
};

/** True when the two half-open ranges share at least one night. */
export function rangesOverlap(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate,
): boolean {
  if (aStart >= aEnd || bStart >= bEnd) return false;
  return aStart < bEnd && bStart < aEnd;
}

/** A usable range has real dates and ends on or after it starts. */
export function isValidDateRange(startDate: ISODate, endDate: ISODate): boolean {
  return (
    isRealDate(startDate) && isRealDate(endDate) && endDate >= startDate
  );
}

/**
 * Can this car be booked for these dates?
 *
 * An invalid range is treated as unavailable rather than throwing; the form
 * that produced it should have caught the problem first.
 */
export function isCarAvailable(
  car: Car,
  bookings: readonly Booking[],
  startDate: ISODate,
  endDate: ISODate,
): boolean {
  if (!isValidDateRange(startDate, endDate)) return false;

  const until = occupiedEnd(startDate, endDate);

  if (car.unavailableDates.some((date) => date >= startDate && date < until)) {
    return false;
  }

  return !bookings.some(
    (booking) =>
      booking.carId === car.id &&
      BLOCKING_STATUSES.includes(booking.status) &&
      rangesOverlap(
        startDate,
        until,
        booking.startDate,
        occupiedEnd(booking.startDate, booking.endDate),
      ),
  );
}

/** The subset of cars that has no conflict for the given dates. */
export function filterAvailableCars(
  cars: readonly Car[],
  bookings: readonly Booking[],
  startDate: ISODate,
  endDate: ISODate,
): Car[] {
  return cars.filter((car) => isCarAvailable(car, bookings, startDate, endDate));
}
