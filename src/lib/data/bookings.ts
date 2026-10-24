/**
 * Booking reads.
 *
 * Seeded bookings until the browser store holds a collection; stored bookings
 * win from then on. Newest first, so the lists that use these reads need no
 * extra sorting.
 */
import { z } from "zod";

import { seedBookings } from "@/data/seed";
import { STORAGE_KEYS } from "@/lib/constants";
import { bookingSchema } from "@/lib/schemas";
import { localStore } from "@/lib/storage/storage";
import type { Booking } from "@/types";

const bookingsGuard = (value: unknown): boolean =>
  z.array(bookingSchema).safeParse(value).success;

const newestFirst = (a: Booking, b: Booking): number =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
  a.id.localeCompare(b.id);

export function listBookings(): Booking[] {
  const stored = localStore.readJson<Booking[] | null>(
    STORAGE_KEYS.bookings,
    null,
    { guard: bookingsGuard },
  );

  return [...(stored ?? seedBookings)].sort(newestFirst);
}

export function getBookingById(id: string): Booking | null {
  return listBookings().find((booking) => booking.id === id) ?? null;
}

export function listBookingsByRenter(renterId: string): Booking[] {
  return listBookings().filter((booking) => booking.renterId === renterId);
}

export function listBookingsByOwner(ownerId: string): Booking[] {
  return listBookings().filter((booking) => booking.ownerId === ownerId);
}

export function listBookingsForCar(carId: string): Booking[] {
  return listBookings().filter((booking) => booking.carId === carId);
}
