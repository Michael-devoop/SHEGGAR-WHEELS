/**
 * Review actions.
 *
 * A review is only possible after a completed trip, and only by the renter
 * who took it. The review and the booking status change together; if the
 * second write fails the first is rolled back.
 */
import { hasRole } from "@/lib/domain/permissions";
import { transition } from "@/lib/domain/bookingMachine";
import { STORAGE_KEYS } from "@/lib/constants";
import { listBookings } from "@/lib/data/bookings";
import { getUserById } from "@/lib/data/users";
import { listReviews } from "@/lib/data/reviews";
import { newId } from "@/lib/ids";
import { reviewDraftSchema, reviewSchema } from "@/lib/schemas";
import { readSession } from "@/lib/storage/session";
import { localStore } from "@/lib/storage/storage";
import type { Result, Review, ReviewDraft } from "@/types";

export function createReview(input: ReviewDraft): Result<Review> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to leave a review." };
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
    return { ok: false, error: "Only the renter can review this trip." };
  }

  const parsed = reviewDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the review and try again.",
    };
  }

  const bookings = listBookings();
  const booking = bookings.find((entry) => entry.id === parsed.data.bookingId);
  if (!booking) {
    return { ok: false, error: "That booking could not be found." };
  }

  if (booking.renterId !== user.id) {
    return { ok: false, error: "Only the renter can review this trip." };
  }

  const reviews = listReviews();
  if (reviews.some((review) => review.bookingId === booking.id)) {
    return { ok: false, error: "This trip already has a review." };
  }

  const moved = transition(booking, "review", "renter");
  if (!moved.ok) return moved;

  const candidate: Review = {
    id: newId("rev"),
    bookingId: booking.id,
    carId: booking.carId,
    renterId: user.id,
    ownerId: booking.ownerId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    createdAt: new Date().toISOString(),
  };

  const review = reviewSchema.safeParse(candidate);
  if (!review.success) {
    return {
      ok: false,
      error: review.error.issues[0]?.message ?? "Check the review and try again.",
    };
  }

  if (!localStore.writeJson(STORAGE_KEYS.reviews, [...reviews, review.data])) {
    return {
      ok: false,
      error: "Could not save the review. Browser storage is unavailable.",
    };
  }

  const nextBookings = bookings.map((entry) =>
    entry.id === booking.id ? moved.data : entry,
  );

  if (!localStore.writeJson(STORAGE_KEYS.bookings, nextBookings)) {
    localStore.writeJson(STORAGE_KEYS.reviews, reviews);
    return {
      ok: false,
      error: "Could not update the booking. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: review.data };
}

/** Owner response under a review. One reply, editable by replacing it. */
export function replyToReview(reviewId: string, reply: string): Result<Review> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to reply." };
  }

  const user = getUserById(session.userId);
  if (!user || user.status === "suspended") {
    return { ok: false, error: "This account cannot reply to reviews." };
  }

  const trimmed = reply.trim();
  if (trimmed.length < 2 || trimmed.length > 600) {
    return { ok: false, error: "Replies must be 2–600 characters." };
  }

  const reviews = listReviews();
  const existing = reviews.find((review) => review.id === reviewId);
  if (!existing) {
    return { ok: false, error: "That review could not be found." };
  }

  if (existing.ownerId !== user.id) {
    return { ok: false, error: "Only the car's owner can reply." };
  }

  const updated: Review = { ...existing, ownerReply: trimmed };
  const next = reviews.map((review) =>
    review.id === reviewId ? updated : review,
  );

  if (!localStore.writeJson(STORAGE_KEYS.reviews, next)) {
    return {
      ok: false,
      error: "Could not save the reply. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: updated };
}
