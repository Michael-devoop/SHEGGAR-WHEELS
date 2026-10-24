/**
 * Domain types.
 *
 * Enum-like unions are derived from the constant arrays in
 * `@/lib/constants`; entity shapes are inferred from the Zod schemas in
 * `@/lib/schemas`. There is exactly one definition per concept, so a status
 * or field cannot be valid in one place and missing in another.
 */
import type { z } from "zod";

import type {
  BOOKING_STATUSES,
  CAR_STATUSES,
  DISPUTE_STATUSES,
  PAYMENT_STATUSES,
  ROLES,
  TRANSMISSIONS,
  USER_STATUSES,
} from "@/lib/constants";
import type {
  announcementDraftSchema,
  announcementSchema,
  bookingSchema,
  carDraftSchema,
  carSchema,
  disputeDraftSchema,
  disputeSchema,
  reviewDraftSchema,
  reviewSchema,
  sessionSchema,
  userSchema,
} from "@/lib/schemas";

export type Role = (typeof ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type CarStatus = (typeof CAR_STATUSES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

/**
 * Outcome of an operation that can fail without throwing.
 *
 * `error` is a user-safe message, never a raw exception.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Calendar date, `YYYY-MM-DD`. Always interpreted in UTC. */
export type ISODate = string;

/** Full ISO 8601 timestamp, e.g. `2026-10-20T09:30:00.000Z`. */
export type ISODateTime = string;

export type User = z.infer<typeof userSchema>;
export type Car = z.infer<typeof carSchema>;
export type CarDraft = z.infer<typeof carDraftSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewDraft = z.infer<typeof reviewDraftSchema>;
export type Dispute = z.infer<typeof disputeSchema>;
export type DisputeDraft = z.infer<typeof disputeDraftSchema>;
export type Announcement = z.infer<typeof announcementSchema>;
export type AnnouncementDraft = z.infer<typeof announcementDraftSchema>;
export type Session = z.infer<typeof sessionSchema>;
