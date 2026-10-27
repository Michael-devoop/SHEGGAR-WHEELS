import { STORAGE_KEYS } from "@/lib/constants";

/**
 * TanStack Query keys for browser-backed collections.
 *
 * The storage key is part of the query key so the data-sync bridge can
 * invalidate exactly one collection when that key changes.
 */
export const queryKeys = {
  users: ["storage", STORAGE_KEYS.users] as const,
  cars: ["storage", STORAGE_KEYS.cars] as const,
  bookings: ["storage", STORAGE_KEYS.bookings] as const,
  reviews: ["storage", STORAGE_KEYS.reviews] as const,
  disputes: ["storage", STORAGE_KEYS.disputes] as const,
  announcements: ["storage", STORAGE_KEYS.announcements] as const,
} as const;

export type CollectionQueryKey = (typeof queryKeys)[keyof typeof queryKeys];
