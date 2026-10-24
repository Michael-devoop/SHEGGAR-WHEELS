/**
 * Dispute actions.
 *
 * Either party can escalate a trip that has started. The booking moves to
 * `disputed` at the same time, so an owner cannot complete a trip that is
 * under review. Only an admin can resolve it.
 */
import { hasRole } from "@/lib/domain/permissions";
import { canTransition, transition } from "@/lib/domain/bookingMachine";
import { STORAGE_KEYS } from "@/lib/constants";
import { listBookings } from "@/lib/data/bookings";
import { listDisputes } from "@/lib/data/disputes";
import { getUserById } from "@/lib/data/users";
import { newId } from "@/lib/ids";
import { disputeDraftSchema, disputeSchema } from "@/lib/schemas";
import { readSession } from "@/lib/storage/session";
import { localStore } from "@/lib/storage/storage";
import type { Dispute, DisputeDraft, Result, Role } from "@/types";

export function openDispute(input: DisputeDraft): Result<Dispute> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to report a problem." };
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

  const parsed = disputeDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  const bookings = listBookings();
  const booking = bookings.find((entry) => entry.id === parsed.data.bookingId);
  if (!booking) {
    return { ok: false, error: "That booking could not be found." };
  }

  const role: Role | null =
    booking.renterId === user.id
      ? "renter"
      : booking.ownerId === user.id
        ? "owner"
        : null;

  if (!role) {
    return { ok: false, error: "Only the renter or the owner can report a problem." };
  }

  if (!canTransition(booking.status, "dispute", role)) {
    return {
      ok: false,
      error: "This trip cannot be disputed in its current state.",
    };
  }

  const disputes = listDisputes();
  if (disputes.some((dispute) => dispute.bookingId === booking.id)) {
    return { ok: false, error: "This booking already has a dispute." };
  }

  const moved = transition(booking, "dispute", role);
  if (!moved.ok) return moved;

  const candidate: Dispute = {
    id: newId("dsp"),
    bookingId: booking.id,
    openedBy: user.id,
    reason: parsed.data.reason,
    description: parsed.data.description,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  const dispute = disputeSchema.safeParse(candidate);
  if (!dispute.success) {
    return {
      ok: false,
      error: dispute.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  const nextBookings = bookings.map((entry) =>
    entry.id === booking.id ? moved.data : entry,
  );

  if (!localStore.writeJson(STORAGE_KEYS.bookings, nextBookings)) {
    return {
      ok: false,
      error: "Could not update the booking. Browser storage is unavailable.",
    };
  }

  if (!localStore.writeJson(STORAGE_KEYS.disputes, [...disputes, dispute.data])) {
    localStore.writeJson(STORAGE_KEYS.bookings, bookings);
    return {
      ok: false,
      error: "Could not save the dispute. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: dispute.data };
}

/** Admin decision that closes an open dispute. */
export function resolveDispute(
  disputeId: string,
  resolutionNotes: string,
): Result<Dispute> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to resolve disputes." };
  }

  const user = getUserById(session.userId);
  if (!user || user.status === "suspended" || !hasRole(user, "admin")) {
    return { ok: false, error: "Only admins can resolve disputes." };
  }

  const notes = resolutionNotes.trim();
  if (notes.length < 10 || notes.length > 1_000) {
    return { ok: false, error: "Write 10–1000 characters explaining the outcome." };
  }

  const disputes = listDisputes();
  const existing = disputes.find((dispute) => dispute.id === disputeId);
  if (!existing) {
    return { ok: false, error: "That dispute could not be found." };
  }

  if (existing.status !== "open") {
    return { ok: false, error: "This dispute is already resolved." };
  }

  const bookings = listBookings();
  const booking = bookings.find((entry) => entry.id === existing.bookingId);
  if (!booking) {
    return { ok: false, error: "The booking for this dispute is missing." };
  }

  const moved = transition(booking, "resolve", "admin");
  if (!moved.ok) return moved;

  const resolved: Dispute = {
    ...existing,
    status: "resolved",
    resolutionNotes: notes,
    resolvedBy: user.id,
    resolvedAt: new Date().toISOString(),
  };

  const nextDisputes = disputes.map((dispute) =>
    dispute.id === disputeId ? resolved : dispute,
  );
  const nextBookings = bookings.map((entry) =>
    entry.id === booking.id ? moved.data : entry,
  );

  if (!localStore.writeJson(STORAGE_KEYS.disputes, nextDisputes)) {
    return {
      ok: false,
      error: "Could not save the decision. Browser storage is unavailable.",
    };
  }

  if (!localStore.writeJson(STORAGE_KEYS.bookings, nextBookings)) {
    localStore.writeJson(STORAGE_KEYS.disputes, disputes);
    return {
      ok: false,
      error: "Could not update the booking. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: resolved };
}
