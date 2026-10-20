/**
 * Review reads.
 *
 * The seed dataset is the source of truth until the browser store is seeded
 * (see `src/lib/storage/init.ts`).
 */
import { seedReviews } from "@/data/seed";
import type { Review } from "@/types";

/** The reviews left for a car, most recent first. */
export function listReviewsForCar(carId: string): Review[] {
  return seedReviews
    .filter((review) => review.carId === carId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** The average rating for a car, or null when it has no reviews. */
export function averageRatingForCar(carId: string): number | null {
  const reviews = listReviewsForCar(carId);
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
