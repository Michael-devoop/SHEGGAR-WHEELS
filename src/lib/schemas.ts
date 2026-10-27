/**
 * Runtime schemas for every stored entity.
 *
 * Types in `src/types/index.ts` are inferred from these, so the shape used
 * at runtime and the shape used by TypeScript cannot drift.
 *
 * Stored values are untrusted: always parse them through these schemas
 * before use (see `src/lib/storage/storage.ts`).
 */
import { z } from "zod";

import {
  BOOKING_STATUSES,
  CAR_STATUSES,
  DISPUTE_STATUSES,
  NEIGHBOURHOODS,
  PAYMENT_STATUSES,
  ROLES,
  TRANSMISSIONS,
  USER_STATUSES,
} from "@/lib/constants";

/** Calendar date, `YYYY-MM-DD`. */
export const isoDateSchema = z.iso.date();

/** Full ISO 8601 timestamp. */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const roleSchema = z.enum(ROLES);
export const userStatusSchema = z.enum(USER_STATUSES);
export const carStatusSchema = z.enum(CAR_STATUSES);
export const transmissionSchema = z.enum(TRANSMISSIONS);
export const bookingStatusSchema = z.enum(BOOKING_STATUSES);
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);
export const disputeStatusSchema = z.enum(DISPUTE_STATUSES);

const id = z.string().trim().min(1, "Required");
const nonNegativeMoney = z.number().int().nonnegative();
const positiveMoney = z.number().int().positive();
const shortText = z.string().trim().min(1, "Required");

export const userSchema = z.object({
  id,
  name: z.string().trim().min(2, "Too short"),
  email: z.email(),
  phone: z.string().trim().min(7, "Too short"),
  roles: z.array(roleSchema).min(1),
  status: userStatusSchema,
  createdAt: isoDateTimeSchema,
});

export const carSchema = z.object({
  id,
  ownerId: id,
  make: shortText,
  model: shortText,
  year: z.number().int().min(1950).max(2100),
  transmission: transmissionSchema,
  seats: z.number().int().min(1).max(12),
  city: shortText,
  neighbourhood: shortText,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  pricePerDay: positiveMoney,
  photos: z.array(shortText).min(1),
  description: shortText,
  slug: z
    .string()
    .trim()
    .max(200)
    .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/)
    .optional(),
  status: carStatusSchema,
  unavailableDates: z.array(isoDateSchema),
  createdAt: isoDateTimeSchema,
});

/**
 * The fields an owner controls. Identity, photos, owner and moderation state
 * are derived by the action, never accepted from the form.
 */
export const carDraftSchema = z.object({
  make: z.string().trim().min(1, "Enter the make").max(40),
  model: z.string().trim().min(1, "Enter the model").max(40),
  year: z.coerce
    .number()
    .int("Use a whole year")
    .min(1950, "Year must be 1950 or later")
    .max(2100, "Year must be 2100 or earlier"),
  transmission: transmissionSchema,
  seats: z.coerce.number().int().min(1).max(12),
  neighbourhood: z.enum(NEIGHBOURHOODS),
  pricePerDay: z.coerce
    .number()
    .int("Use whole birr")
    .min(100, "Minimum is 100 birr a day")
    .max(100_000, "Maximum is 100,000 birr a day"),
  description: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters")
    .max(600, "Keep it under 600 characters"),
});

export const bookingSchema = z
  .object({
    id,
    carId: id,
    renterId: id,
    ownerId: id,
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    days: z.number().int().min(1),
    /** Snapshot of the car price at booking time. */
    pricePerDay: positiveMoney,
    subtotal: nonNegativeMoney,
    fee: nonNegativeMoney,
    total: nonNegativeMoney,
    paymentStatus: paymentStatusSchema,
    status: bookingStatusSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const reviewSchema = z.object({
  id,
  bookingId: id,
  carId: id,
  renterId: id,
  ownerId: id,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Required"),
  ownerReply: z.string().trim().min(1).optional(),
  createdAt: isoDateTimeSchema,
});

export const disputeSchema = z.object({
  id,
  bookingId: id,
  openedBy: id,
  reason: shortText,
  description: z.string().trim().min(1, "Required"),
  status: disputeStatusSchema,
  resolutionNotes: z.string().trim().min(1).optional(),
  resolvedBy: id.optional(),
  createdAt: isoDateTimeSchema,
  resolvedAt: isoDateTimeSchema.optional(),
});

export const announcementSchema = z.object({
  id,
  title: shortText,
  message: z.string().trim().min(1, "Required"),
  active: z.boolean(),
  createdAt: isoDateTimeSchema,
  createdBy: id,
});

export const announcementDraftSchema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters").max(80, "Keep it under 80 characters"),
  message: z.string().trim().min(10, "Write at least 10 characters").max(600, "Keep it under 600 characters"),
});

export const sessionSchema = z.object({
  userId: id,
  signedInAt: isoDateTimeSchema,
});

/** The fields a renter controls when reviewing a completed trip. */
export const reviewDraftSchema = z.object({
  bookingId: z.string().trim().min(1, "Required"),
  rating: z.coerce
    .number()
    .int("Choose a whole star")
    .min(1, "Choose a rating")
    .max(5, "Maximum is five stars"),
  comment: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters")
    .max(600, "Keep it under 600 characters"),
});

/** The fields a renter or owner controls when opening a dispute. */
export const disputeDraftSchema = z.object({
  bookingId: z.string().trim().min(1, "Required"),
  reason: z
    .string()
    .trim()
    .min(3, "Say what the problem is")
    .max(80, "Keep the summary under 80 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters")
    .max(1_000, "Keep it under 1000 characters"),
});
