/**
 * Shared helpers for the seed data.
 *
 * Everything here is pure and deterministic. No `new Date()`, no
 * `Date.now()`, no `Math.random()`: the project runs with Cache Components
 * enabled, and those calls fail the prerender. Every date in the seed is a
 * literal ISO string.
 */
import { PLATFORM_FEE_RATE } from "@/lib/constants";

const MS_PER_DAY = 86_400_000;

/**
 * Rental length in days between two calendar dates.
 *
 * The end date is the return day, so a booking from the 20th to the 22nd is
 * 2 days of rental.
 */
export function daysBetween(startDate: string, endDate: string): number {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / MS_PER_DAY);
}

/**
 * Price snapshot for a booking.
 *
 * The fee is the platform commission, rounded to the nearest birr. Both the
 * booking and the receipt read these numbers, so they are derived once here
 * rather than typed out by hand.
 */
export function priceFor(
  pricePerDay: number,
  days: number,
): { subtotal: number; fee: number; total: number } {
  const subtotal = pricePerDay * days;
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  return { subtotal, fee, total: subtotal + fee };
}
