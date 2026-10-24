/**
 * Rental pricing.
 *
 * The end date is the return day: 20 Nov to 22 Nov is two nights, and a
 * same-day rental is charged as one day. Money is whole birr throughout.
 */
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import type { Car, ISODate } from "@/types";

const MS_PER_DAY = 86_400_000;

export interface Quote {
  days: number;
  subtotal: number;
  fee: number;
  total: number;
}

/** Nights between the pickup and return dates, never less than one. */
export function rentalDays(startDate: ISODate, endDate: ISODate): number {
  const diff = (Date.parse(endDate) - Date.parse(startDate)) / MS_PER_DAY;
  return Math.max(1, Math.round(diff));
}

/** Subtotal plus the platform fee, for a given daily price. */
export function quote(
  pricePerDay: number,
  startDate: ISODate,
  endDate: ISODate,
): Quote {
  const days = rentalDays(startDate, endDate);
  const subtotal = pricePerDay * days;
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  return { days, subtotal, fee, total: subtotal + fee };
}

/** Convenience wrapper that reads the car's current daily price. */
export function quoteForCar(
  car: Pick<Car, "pricePerDay">,
  startDate: ISODate,
  endDate: ISODate,
): Quote {
  return quote(car.pricePerDay, startDate, endDate);
}
