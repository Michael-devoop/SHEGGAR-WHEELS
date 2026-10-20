/**
 * Single source of truth for domain constants.
 *
 * Every status, role and enum-like value lives here exactly once. Types in
 * `src/types/index.ts` are derived from these arrays, so a value can never
 * exist in one place and be missing in another.
 *
 * Rules:
 * - Arrays are `as const` so `(typeof X)[number]` yields a literal union.
 * - Display labels and colours live in the design system, not here.
 */

/** localStorage / sessionStorage keys. Bump the suffix on a breaking shape change. */
export const STORAGE_KEYS = {
  users: "sw_users_v1",
  cars: "sw_cars_v1",
  bookings: "sw_bookings_v1",
  reviews: "sw_reviews_v1",
  disputes: "sw_disputes_v1",
  announcements: "sw_announcements_v1",
  session: "sw_session_v1", // sessionStorage
  checkoutDraft: "sw_checkout_draft_v1", // sessionStorage
} as const;

export const ROLES = ["renter", "owner", "admin"] as const;

export const USER_STATUSES = ["active", "suspended"] as const;

export const CAR_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "inactive",
] as const;

export const TRANSMISSIONS = ["automatic", "manual"] as const;

export const BOOKING_STATUSES = [
  "requested",
  "confirmed",
  "in_progress",
  "completed",
  "reviewed",
  "declined",
  "cancelled",
  "disputed",
  "resolved",
] as const;

export const PAYMENT_STATUSES = ["unpaid", "held", "paid", "refunded"] as const;

export const DISPUTE_STATUSES = ["open", "resolved"] as const;

/** Mock platform commission, applied on top of the rental subtotal. */
export const PLATFORM_FEE_RATE = 0.1;

/** Listings per page on the catalogue grid. */
export const PAGE_SIZE = 9;

/** ISO 4217 code for Ethiopian Birr. */
export const CURRENCY = "ETB";

/** Addis Ababa neighbourhoods covered by the marketplace. */
export const NEIGHBOURHOODS = [
  "Bole",
  "Piassa",
  "CMC",
  "Kazanchis",
  "Sarbet",
  "Megenagna",
  "Ayat",
  "Summit",
] as const;
