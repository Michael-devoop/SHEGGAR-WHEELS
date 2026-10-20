/**
 * Seed reviews.
 *
 * One per reviewed booking. `ownerReply` is set on one of them so the owner
 * review thread has a reply to render.
 */
import type { Review } from "@/types";

export const seedReviews: Review[] = [
  {
    id: "rev_01",
    bookingId: "bkg_05",
    carId: "car_05",
    renterId: "usr_02",
    ownerId: "usr_01",
    rating: 5,
    comment:
      "The Note was exactly as described and Marta was easy to deal with. Collected it from Sarbet in ten minutes.",
    createdAt: "2026-10-02T08:15:00.000Z",
  },
  {
    id: "rev_02",
    bookingId: "bkg_10",
    carId: "car_01",
    renterId: "usr_04",
    ownerId: "usr_01",
    rating: 4,
    comment:
      "Car was clean and the handover was quick. Only note: the air conditioning took a few minutes to cool down.",
    ownerReply:
      "Thank you for the feedback. The air conditioning is serviced every year, it just needs a moment on a hot afternoon.",
    createdAt: "2026-10-15T09:05:00.000Z",
  },
  {
    id: "rev_03",
    bookingId: "bkg_11",
    carId: "car_03",
    renterId: "usr_02",
    ownerId: "usr_01",
    rating: 5,
    comment:
      "Second time booking this Accent. Comfortable, economical and the owner answered every message within minutes.",
    createdAt: "2026-09-08T08:40:00.000Z",
  },
];
