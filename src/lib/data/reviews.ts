/**
 * Review reads.
 *
 * Seeded reviews until the browser store holds a collection; stored reviews
 * win from then on. Most recent first.
 */
import { z } from "zod";

import { seedReviews } from "@/data/seed";
import { STORAGE_KEYS } from "@/lib/constants";
import { reviewSchema } from "@/lib/schemas";
import { localStore } from "@/lib/storage/storage";
import type { Review } from "@/types";

const reviewsGuard = (value: unknown): boolean =>
  z.array(reviewSchema).safeParse(value).success;

const newestFirst = (a: Review, b: Review): number =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
  a.id.localeCompare(b.id);

export function listReviews(): Review[] {
  const stored = localStore.readJson<Review[] | null>(
    STORAGE_KEYS.reviews,
    null,
    { guard: reviewsGuard },
  );

  return [...(stored ?? seedReviews)].sort(newestFirst);
}

/** The reviews left for a car, most recent first. */
export function listReviewsForCar(carId: string): Review[] {
  return listReviews().filter((review) => review.carId === carId);
}

/** The review attached to a booking, when it has one. */
export function getReviewForBooking(bookingId: string): Review | null {
  return listReviews().find((review) => review.bookingId === bookingId) ?? null;
}

/** The reviews a renter has written. */
export function listReviewsByRenter(renterId: string): Review[] {
  return listReviews().filter((review) => review.renterId === renterId);
}

/** The average rating for a car, or null when it has no reviews. */
export function averageRatingForCar(carId: string): number | null {
  const reviews = listReviewsForCar(carId);
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
