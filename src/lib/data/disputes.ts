/**
 * Dispute reads.
 *
 * Seeded disputes until the browser store holds a collection; stored
 * disputes win from then on. Most recent first.
 */
import { z } from "zod";

import { seedDisputes } from "@/data/seed";
import { STORAGE_KEYS } from "@/lib/constants";
import { disputeSchema } from "@/lib/schemas";
import { localStore } from "@/lib/storage/storage";
import type { Dispute } from "@/types";

const disputesGuard = (value: unknown): boolean =>
  z.array(disputeSchema).safeParse(value).success;

const newestFirst = (a: Dispute, b: Dispute): number =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
  a.id.localeCompare(b.id);

export function listDisputes(): Dispute[] {
  const stored = localStore.readJson<Dispute[] | null>(
    STORAGE_KEYS.disputes,
    null,
    { guard: disputesGuard },
  );

  return [...(stored ?? seedDisputes)].sort(newestFirst);
}

/** The dispute attached to a booking, when one exists. */
export function getDisputeForBooking(bookingId: string): Dispute | null {
  return (
    listDisputes().find((dispute) => dispute.bookingId === bookingId) ?? null
  );
}

/** Disputes opened by a user, most recent first. */
export function listDisputesByUser(userId: string): Dispute[] {
  return listDisputes().filter((dispute) => dispute.openedBy === userId);
}

/** Disputes still waiting for an admin decision. */
export function listOpenDisputes(): Dispute[] {
  return listDisputes().filter((dispute) => dispute.status === "open");
}
