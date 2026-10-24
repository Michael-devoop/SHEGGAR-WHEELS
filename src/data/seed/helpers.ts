/**
 * Shared helpers for the seed data.
 *
 * `daysFromToday` is the only place in the seed set that reads the clock, so
 * the demo stays alive whenever it is opened. It is client-only: seed data is
 * written from a browser effect, never during a server render.
 */
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import type { ISODate, ISODateTime } from "@/types";

const MS_PER_DAY = 86_400_000;

/** UTC calendar date `offsetDays` from today. */
export function daysFromToday(offsetDays: number): ISODate {
  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return new Date(today + offsetDays * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Timestamp `offsetDays` from today, at a fixed UTC hour. */
export function timestampDaysFromToday(
  offsetDays: number,
  hour = 9,
): ISODateTime {
  return `${daysFromToday(offsetDays)}T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

/**
 * Rental length in days between two calendar dates.
 *
 * The end date is the return day, so a booking from the 20th to the 22nd is
 * 2 days of rental.
 */
export function daysBetween(startDate: ISODate, endDate: ISODate): number {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / MS_PER_DAY);
}

/** Price snapshot for a booking, with the platform fee rounded to the birr. */
export function priceFor(
  pricePerDay: number,
  days: number,
): { subtotal: number; fee: number; total: number } {
  const subtotal = pricePerDay * days;
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  return { subtotal, fee, total: subtotal + fee };
}
