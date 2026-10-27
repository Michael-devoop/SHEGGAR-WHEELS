/**
 * Car listing actions.
 *
 * Owners submit the facts a renter needs; the action owns the fields the
 * owner must not set (id, owner, photos, moderation status, coordinates).
 * Every listing starts pending and only an admin can approve it.
 */
import {
  CAR_PLACEHOLDER_PHOTO,
  NEIGHBOURHOOD_COORDS,
  STORAGE_KEYS,
} from "@/lib/constants";
import { listBookings } from "@/lib/data/bookings";
import { listCars } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { uniqueCarSlug } from "@/lib/domain/carSlug";
import { hasRole } from "@/lib/domain/permissions";
import { newId } from "@/lib/ids";
import { carDraftSchema, carSchema } from "@/lib/schemas";
import { readSession } from "@/lib/storage/session";
import { localStore } from "@/lib/storage/storage";
import type { Car, CarDraft, Result, User } from "@/types";

const now = (): string => new Date().toISOString();

/** Returns the signed-in user when they can act as an owner. */
function actingOwner(): Result<User> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage your cars." };
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

  if (!hasRole(user, "owner")) {
    return { ok: false, error: "Only owners can list cars." };
  }

  return { ok: true, data: user };
}

function persist(cars: Car[]): boolean {
  return localStore.writeJson(STORAGE_KEYS.cars, cars);
}

/** Creates a listing awaiting admin approval. */
export function createCar(input: CarDraft): Result<Car> {
  const owner = actingOwner();
  if (!owner.ok) return owner;
  const parsed = carDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  const coordinates = NEIGHBOURHOOD_COORDS[parsed.data.neighbourhood];
  const draft: Car = {
    id: newId("car"),
    ownerId: owner.data.id,
    ...parsed.data,
    city: "Addis Ababa",
    ...coordinates,
    photos: [CAR_PLACEHOLDER_PHOTO],
    status: "pending",
    unavailableDates: [],
    createdAt: now(),
  };
  const candidate: Car = {
    ...draft,
    slug: uniqueCarSlug(draft, listCars()),
  };

  const car = carSchema.safeParse(candidate);
  if (!car.success) {
    return {
      ok: false,
      error: car.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  if (!persist([...listCars(), car.data])) {
    return {
      ok: false,
      error: "Could not save the listing. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: car.data };
}

/**
 * Edits a listing the signed-in owner owns.
 *
 * A live or previously rejected listing goes back to pending: the edited
 * facts have not been reviewed. An inactive car stays inactive.
 */
export function updateCar(carId: string, input: CarDraft): Result<Car> {
  const owner = actingOwner();
  if (!owner.ok) return owner;
  const parsed = carDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  const cars = listCars();
  const existing = cars.find((car) => car.id === carId);
  if (!existing) {
    return { ok: false, error: "That listing could not be found." };
  }

  if (existing.ownerId !== owner.data.id) {
    return { ok: false, error: "You can only edit your own listings." };
  }

  const draft: Car = {
    ...existing,
    ...parsed.data,
    ...NEIGHBOURHOOD_COORDS[parsed.data.neighbourhood],
    status: existing.status === "inactive" ? "inactive" : "pending",
  };
  const candidate: Car = {
    ...draft,
    slug: existing.slug ?? uniqueCarSlug(draft, cars),
  };

  const car = carSchema.safeParse(candidate);
  if (!car.success) {
    return {
      ok: false,
      error: car.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  const next = cars.map((entry) => (entry.id === carId ? car.data : entry));
  if (!persist(next)) {
    return {
      ok: false,
      error: "Could not save the listing. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: car.data };
}

/**
 * Takes an approved car off the road, or puts a previously approved car back.
 * Pending and rejected listings cannot be self-published.
 */
export function setCarPublished(carId: string, published: boolean): Result<Car> {
  const owner = actingOwner();
  if (!owner.ok) return owner;
  const cars = listCars();
  const existing = cars.find((car) => car.id === carId);
  if (!existing) {
    return { ok: false, error: "That listing could not be found." };
  }

  if (existing.ownerId !== owner.data.id) {
    return { ok: false, error: "You can only manage your own listings." };
  }

  const allowed = published
    ? existing.status === "inactive"
    : existing.status === "approved";
  if (!allowed) {
    return {
      ok: false,
      error: published
        ? "Only a paused listing can be published again."
        : "Only an approved listing can be paused.",
    };
  }

  const car: Car = {
    ...existing,
    status: published ? "approved" : "inactive",
  };

  const next = cars.map((entry) => (entry.id === carId ? car : entry));
  if (!persist(next)) {
    return {
      ok: false,
      error: "Could not save the listing. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: car };
}

/** Admin decision on a submitted listing. */
export function moderateCar(
  carId: string,
  decision: "approve" | "reject",
): Result<Car> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to moderate listings." };
  }

  const user = getUserById(session.userId);
  if (!user || user.status === "suspended") {
    return { ok: false, error: "This account cannot moderate listings." };
  }

  if (!hasRole(user, "admin")) {
    return { ok: false, error: "Only admins can moderate listings." };
  }

  const cars = listCars();
  const existing = cars.find((car) => car.id === carId);
  if (!existing) {
    return { ok: false, error: "That listing could not be found." };
  }

  const reviewable =
    existing.status === "pending" || existing.status === "rejected";
  if (!reviewable) {
    return {
      ok: false,
      error: "Only a pending or rejected listing can be reviewed.",
    };
  }

  const car: Car = {
    ...existing,
    status: decision === "approve" ? "approved" : "rejected",
  };

  const next = cars.map((entry) => (entry.id === carId ? car : entry));
  if (!persist(next)) {
    return {
      ok: false,
      error: "Could not save the decision. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: car };
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const BLOCKING = new Set(["requested", "confirmed", "in_progress", "disputed"]);

function isCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = Date.parse(value);
  return (
    !Number.isNaN(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === value
  );
}

/** The night after `date`; same-day rentals still claim one night. */
function nextDay(date: string): string {
  return new Date(Date.parse(date) + 86_400_000).toISOString().slice(0, 10);
}

/**
 * Blocks or unblocks one night for an owner's car.
 *
 * A date that an active booking already holds cannot be blocked, so an owner
 * cannot strand a confirmed renter. Unblocking is always allowed.
 */
export function toggleUnavailableDate(
  carId: string,
  date: string,
): Result<Car> {
  const owner = actingOwner();
  if (!owner.ok) return owner;

  if (!isCalendarDate(date)) {
    return { ok: false, error: "Choose a valid date." };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return { ok: false, error: "Past dates cannot be changed." };
  }

  const cars = listCars();
  const existing = cars.find((car) => car.id === carId);
  if (!existing) {
    return { ok: false, error: "That car could not be found." };
  }

  if (existing.ownerId !== owner.data.id) {
    return { ok: false, error: "You can only manage your own cars." };
  }

  const blocked = existing.unavailableDates.includes(date);
  if (!blocked) {
    const clash = listBookings().some((booking) => {
      if (booking.carId !== carId || !BLOCKING.has(booking.status)) {
        return false;
      }
      const until =
        booking.startDate === booking.endDate
          ? nextDay(booking.endDate)
          : booking.endDate;
      return date >= booking.startDate && date < until;
    });
    if (clash) {
      return {
        ok: false,
        error: "That night is already booked. Cancel the booking first.",
      };
    }
  }

  const updated: Car = {
    ...existing,
    unavailableDates: blocked
      ? existing.unavailableDates.filter((entry) => entry !== date)
      : [...existing.unavailableDates, date].sort(),
  };

  if (!persist(cars.map((car) => (car.id === carId ? updated : car)))) {
    return {
      ok: false,
      error: "Could not save availability. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: updated };
}
