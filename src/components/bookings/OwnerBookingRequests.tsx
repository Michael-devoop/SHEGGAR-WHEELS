"use client";

import { useState } from "react";
import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { useCurrentUser } from "@/hooks/useSession";
import { useBookings } from "@/hooks/useBookings";
import {
  respondToBooking,
  type OwnerBookingEvent,
} from "@/lib/actions/bookingActions";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { bookingEventsFor } from "@/lib/domain/bookingMachine";
import { carPath } from "@/lib/domain/carSlug";
import { formatDate, formatETB } from "@/lib/format";
import { paymentStatusLabel } from "@/lib/status";
import type { Booking, BookingStatus } from "@/types";

const OWNER_ACTIONS: readonly OwnerBookingEvent[] = [
  "accept",
  "decline",
  "start",
  "complete",
];

const ACTION_LABEL: Record<OwnerBookingEvent, string> = {
  accept: "Accept request",
  decline: "Decline",
  start: "Mark picked up",
  complete: "Mark returned",
  dispute: "Open dispute",
};

const ACTIVE_STATUSES: readonly BookingStatus[] = ["confirmed", "in_progress"];

function ActionButtons({
  booking,
  onAction,
  confirming,
  setConfirming,
}: {
  booking: Booking;
  onAction: (event: OwnerBookingEvent) => void;
  confirming: OwnerBookingEvent | null;
  setConfirming: (event: OwnerBookingEvent | null) => void;
}) {
  const events = bookingEventsFor(booking.status, "owner").filter(
    (event): event is OwnerBookingEvent =>
      OWNER_ACTIONS.includes(event as OwnerBookingEvent),
  );

  if (events.length === 0) return null;

  if (confirming === "decline") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-ink">Decline this request?</p>
        <button
          type="button"
          onClick={() => onAction("decline")}
          className="inline-flex min-h-11 items-center rounded-md bg-danger-solid px-4 text-sm font-semibold text-danger-solid-text transition-opacity hover:opacity-90"
        >
          Yes, decline
        </button>
        <button
          type="button"
          onClick={() => setConfirming(null)}
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          Keep
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {events.map((event) =>
        event === "decline" ? (
          <button
            key={event}
            type="button"
            onClick={() => setConfirming(event)}
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            {ACTION_LABEL[event]}
          </button>
        ) : (
          <button
            key={event}
            type="button"
            onClick={() => onAction(event)}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            {ACTION_LABEL[event]}
          </button>
        ),
      )}
    </div>
  );
}

function RequestRow({
  booking,
  error,
  onAction,
}: {
  booking: Booking;
  error: string | null;
  onAction: (id: string, event: OwnerBookingEvent) => void;
}) {
  const [confirming, setConfirming] = useState<OwnerBookingEvent | null>(null);
  const car = getCarById(booking.carId);
  const renter = getUserById(booking.renterId);

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {car ? `${car.make} ${car.model} ${car.year}` : "Car no longer listed"}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {renter?.name ?? "A renter"} · {formatDate(booking.startDate)} →{" "}
            {formatDate(booking.endDate)} · {booking.days}{" "}
            {booking.days === 1 ? "day" : "days"}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {paymentStatusLabel(booking.paymentStatus)} · {formatETB(booking.total)} ·{" "}
            {booking.id}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <ActionButtons
          booking={booking}
          onAction={(event) => {
            setConfirming(null);
            onAction(booking.id, event);
          }}
          confirming={confirming}
          setConfirming={setConfirming}
        />
        {car?.status === "approved" ? (
          <Link
            href={carPath(car)}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
          >
            View listing
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export default function OwnerBookingRequests({ carId }: { carId?: string } = {}) {
  const { user, hydrated } = useCurrentUser();
  const bookings = useBookings();
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading booking requests…
      </p>
    );
  }

  const mine = user
    ? bookings.filter(
        (booking) =>
          booking.ownerId === user.id &&
          (carId === undefined || booking.carId === carId),
      )
    : [];
  const requested = mine.filter((booking) => booking.status === "requested");
  const active = mine.filter((booking) =>
    ACTIVE_STATUSES.includes(booking.status),
  );
  const history = mine.filter(
    (booking) =>
      booking.status !== "requested" && !ACTIVE_STATUSES.includes(booking.status),
  );

  function handleAction(id: string, event: OwnerBookingEvent) {
    setError(null);
    const result = respondToBooking(id, event);
    if (!result.ok) setError({ id, message: result.error });
  }

  const sections = [
    { id: "requests", title: "New requests", items: requested },
    { id: "active", title: "Active trips", items: active },
    { id: "history", title: "History", items: history },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Booking requests
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Accept or decline requests, then move a trip through pickup and
            return.
          </p>
        </div>
        <Link
          href="/owner/cars"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          My cars
        </Link>
      </header>

      {mine.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <p className="font-semibold text-ink">No bookings yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Requests for your cars will appear here as soon as renters send
            them.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {sections.map((section) =>
            section.items.length > 0 ? (
              <section key={section.id} aria-labelledby={section.id}>
                <h2
                  id={section.id}
                  className="text-sm font-bold uppercase tracking-widest text-ink-muted"
                >
                  {section.title} ({section.items.length})
                </h2>
                <ul role="list" className="mt-3 grid gap-3">
                  {section.items.map((booking) => (
                    <RequestRow
                      key={booking.id}
                      booking={booking}
                      error={error?.id === booking.id ? error.message : null}
                      onAction={handleAction}
                    />
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
