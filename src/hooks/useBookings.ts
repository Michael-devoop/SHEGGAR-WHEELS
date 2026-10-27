"use client";

/**
 * Cached bookings with background polling.
 *
 * A storage write invalidates this query immediately; the poll covers changes
 * that arrive without a subscription event.
 */
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { listBookings } from "@/lib/data/bookings";
import { queryKeys } from "@/lib/queryKeys";
import type { Booking } from "@/types";

export function useBookings(): Booking[] {
  return useCollectionQuery(queryKeys.bookings, listBookings);
}
