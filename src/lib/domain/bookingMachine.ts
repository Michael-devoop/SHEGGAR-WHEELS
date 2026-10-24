/**
 * The booking status machine.
 *
 * One table describes every legal move, who may make it, and what the status
 * becomes. The actions layer calls `transition` instead of writing statuses
 * directly, so an impossible state cannot be reached by a UI shortcut.
 *
 * Payment follows the rental lifecycle:
 * - acceptance holds the renter's money,
 * - completion releases it to the owner,
 * - cancelling a held booking refunds it.
 */
import type {
  Booking,
  BookingStatus,
  ISODateTime,
  PaymentStatus,
  Result,
  Role,
} from "@/types";

export const BOOKING_EVENTS = [
  "accept",
  "decline",
  "cancel",
  "start",
  "complete",
  "review",
  "dispute",
  "resolve",
] as const;

export type BookingEvent = (typeof BOOKING_EVENTS)[number];

export interface BookingTransition {
  from: BookingStatus;
  event: BookingEvent;
  to: BookingStatus;
  roles: readonly Role[];
}

export const BOOKING_TRANSITIONS: readonly BookingTransition[] = [
  { from: "requested", event: "accept", to: "confirmed", roles: ["owner"] },
  { from: "requested", event: "decline", to: "declined", roles: ["owner"] },
  { from: "requested", event: "cancel", to: "cancelled", roles: ["renter"] },
  {
    from: "confirmed",
    event: "start",
    to: "in_progress",
    roles: ["renter", "owner"],
  },
  {
    from: "confirmed",
    event: "cancel",
    to: "cancelled",
    roles: ["renter", "owner"],
  },
  {
    from: "in_progress",
    event: "complete",
    to: "completed",
    roles: ["renter", "owner"],
  },
  {
    from: "in_progress",
    event: "dispute",
    to: "disputed",
    roles: ["renter", "owner"],
  },
  {
    from: "completed",
    event: "review",
    to: "reviewed",
    roles: ["renter"],
  },
  {
    from: "completed",
    event: "dispute",
    to: "disputed",
    roles: ["renter", "owner"],
  },
  {
    from: "reviewed",
    event: "dispute",
    to: "disputed",
    roles: ["renter", "owner"],
  },
  { from: "disputed", event: "resolve", to: "resolved", roles: ["admin"] },
];

const findRule = (from: BookingStatus, event: BookingEvent) =>
  BOOKING_TRANSITIONS.find(
    (rule) => rule.from === from && rule.event === event,
  );

/** The status this event leads to, or null when it does not apply. */
export function nextBookingStatus(
  from: BookingStatus,
  event: BookingEvent,
): BookingStatus | null {
  return findRule(from, event)?.to ?? null;
}

/** Whether this role may fire this event on a booking in this status. */
export function canTransition(
  from: BookingStatus,
  event: BookingEvent,
  role: Role,
): boolean {
  return findRule(from, event)?.roles.includes(role) ?? false;
}

/** Events the given role can fire right now, in table order. */
export function bookingEventsFor(
  status: BookingStatus,
  role: Role,
): BookingEvent[] {
  return BOOKING_TRANSITIONS.filter(
    (rule) => rule.from === status && rule.roles.includes(role),
  ).map((rule) => rule.event);
}

const paymentAfter = (
  booking: Booking,
  event: BookingEvent,
): PaymentStatus => {
  if (event === "accept") return "held";
  if (event === "complete") return "paid";
  if (event === "cancel" && booking.paymentStatus === "held") return "refunded";
  return booking.paymentStatus;
};

/**
 * Applies an event to a booking without mutating it.
 *
 * The caller persists the returned booking. A refused move comes back as a
 * user-safe `Result` error rather than an exception.
 */
export function transition(
  booking: Booking,
  event: BookingEvent,
  role: Role,
  at: ISODateTime = new Date().toISOString(),
): Result<Booking> {
  const rule = findRule(booking.status, event);
  if (!rule) {
    return {
      ok: false,
      error: `A ${booking.status.replace("_", " ")} booking cannot ${event}.`,
    };
  }

  if (!rule.roles.includes(role)) {
    return {
      ok: false,
      error: `Only ${rule.roles.join(" or ")} can ${event} this booking.`,
    };
  }

  return {
    ok: true,
    data: {
      ...booking,
      status: rule.to,
      paymentStatus: paymentAfter(booking, event),
      updatedAt: at,
    },
  };
}
