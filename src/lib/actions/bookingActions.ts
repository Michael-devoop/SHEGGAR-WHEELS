/**
 * Booking requests.
 *
 * The browser supplies the car and dates; the action re-derives the renter,
 * checks the car, the dates, the calendar and the price. Nothing money-related
 * is trusted from the form.
 */
import { listBookings } from "@/lib/data/bookings";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { isCarAvailable, isValidDateRange } from "@/lib/domain/availability";
import {
  transition,
  type BookingEvent,
} from "@/lib/domain/bookingMachine";
import { hasRole } from "@/lib/domain/permissions";
import { quoteForCar } from "@/lib/domain/pricing";
import { newId } from "@/lib/ids";
import { bookingSchema } from "@/lib/schemas";
import { STORAGE_KEYS } from "@/lib/constants";
import { readSession } from "@/lib/storage/session";
import { localStore } from "@/lib/storage/storage";
import type { Booking, ISODate, Result } from "@/types";

export interface CreateBookingInput {
  carId: string;
  startDate: ISODate;
  endDate: ISODate;
}

const today = (): ISODate => new Date().toISOString().slice(0, 10);

/** Creates a pending request. The owner decides whether to accept it. */
export function createBooking(input: CreateBookingInput): Result<Booking> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to request a booking." };
  }

  const user = getUserById(session.userId);
  if (!user) {
    return {
      ok: false,
      error: "Your account could not be found. Please sign in again.",
    };
  }

  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended." };
  }

  if (!hasRole(user, "renter")) {
    return { ok: false, error: "Only renters can request a booking." };
  }

  const car = getCarById(input.carId);
  if (!car || car.status !== "approved") {
    return { ok: false, error: "That car is not open for booking right now." };
  }

  if (car.ownerId === user.id) {
    return { ok: false, error: "You cannot book your own car." };
  }

  if (!isValidDateRange(input.startDate, input.endDate)) {
    return { ok: false, error: "Choose a valid pickup and return date." };
  }

  if (input.startDate < today()) {
    return { ok: false, error: "The pickup date cannot be in the past." };
  }

  const bookings = listBookings();
  if (!isCarAvailable(car, bookings, input.startDate, input.endDate)) {
    return {
      ok: false,
      error: "Those dates are no longer available. Pick another range.",
    };
  }

  const pricing = quoteForCar(car, input.startDate, input.endDate);
  const now = new Date().toISOString();

  const candidate = {
    id: newId("bkg"),
    carId: car.id,
    renterId: user.id,
    ownerId: car.ownerId,
    startDate: input.startDate,
    endDate: input.endDate,
    days: pricing.days,
    pricePerDay: car.pricePerDay,
    subtotal: pricing.subtotal,
    fee: pricing.fee,
    total: pricing.total,
    paymentStatus: "unpaid" as const,
    status: "requested" as const,
    createdAt: now,
    updatedAt: now,
  };

  const parsed = bookingSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Check the dates and try again.",
    };
  }

  if (
    !localStore.writeJson(STORAGE_KEYS.bookings, [...bookings, parsed.data])
  ) {
    return {
      ok: false,
      error: "Could not save the request. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Cancels a booking the signed-in user is part of.
 *
 * The machine decides whether the current status can still be cancelled and
 * whether this side of the booking may do it. A held payment is refunded.
 */
export function cancelBooking(bookingId: string): Result<Booking> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage this booking." };
  }

  const user = getUserById(session.userId);
  if (!user) {
    return {
      ok: false,
      error: "Your account could not be found. Please sign in again.",
    };
  }

  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended." };
  }

  const bookings = listBookings();
  const booking = bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    return { ok: false, error: "That booking could not be found." };
  }

  const role =
    booking.renterId === user.id
      ? ("renter" as const)
      : booking.ownerId === user.id
        ? ("owner" as const)
        : null;

  if (!role) {
    return {
      ok: false,
      error: "You are not part of this booking.",
    };
  }

  const result = transition(booking, "cancel", role);
  if (!result.ok) return result;

  const next = bookings.map((entry) =>
    entry.id === booking.id ? result.data : entry,
  );

  if (!localStore.writeJson(STORAGE_KEYS.bookings, next)) {
    return {
      ok: false,
      error: "Could not update the booking. Browser storage is unavailable.",
    };
  }

  return result;
}

/** The decisions an owner can make from their booking inbox. */
export type OwnerBookingEvent = Extract<
  BookingEvent,
  "accept" | "decline" | "start" | "complete" | "dispute"
>;

/**
 * Applies an owner decision to a booking for one of their own cars.
 *
 * The machine still decides which events are legal from the current status,
 * so an old tab or a double click cannot move a booking backwards.
 */
export function respondToBooking(
  bookingId: string,
  event: OwnerBookingEvent,
): Result<Booking> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage bookings." };
  }

  const user = getUserById(session.userId);
  if (!user) {
    return {
      ok: false,
      error: "Your account could not be found. Please sign in again.",
    };
  }

  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended." };
  }

  const bookings = listBookings();
  const booking = bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    return { ok: false, error: "That booking could not be found." };
  }

  if (booking.ownerId !== user.id) {
    return {
      ok: false,
      error: "Only this car's owner can respond to the booking.",
    };
  }

  const result = transition(booking, event, "owner");
  if (!result.ok) return result;

  const next = bookings.map((entry) =>
    entry.id === booking.id ? result.data : entry,
  );

  if (!localStore.writeJson(STORAGE_KEYS.bookings, next)) {
    return {
      ok: false,
      error: "Could not update the booking. Browser storage is unavailable.",
    };
  }

  return result;
}
