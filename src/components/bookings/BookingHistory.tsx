"use client";

import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { useCurrentUser } from "@/hooks/useSession";
import { useBookings } from "@/hooks/useBookings";
import { getCarById } from "@/lib/data/cars";
import { formatDate, formatETB } from "@/lib/format";
import { paymentStatusLabel } from "@/lib/status";
import type { Booking, BookingStatus } from "@/types";

const ACTIVE_STATUSES: readonly BookingStatus[] = [
  "requested",
  "confirmed",
  "in_progress",
  "disputed",
];

function BookingRow({ booking }: { booking: Booking }) {
  const car = getCarById(booking.carId);

  return (
    <Link
      href={`/renter/bookings/${booking.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="font-semibold text-ink">
          {car ? `${car.make} ${car.model} ${car.year}` : "Car no longer listed"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ·{" "}
          {booking.days} {booking.days === 1 ? "day" : "days"}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          {paymentStatusLabel(booking.paymentStatus)} · booking {booking.id}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <BookingStatusBadge status={booking.status} />
        <p className="text-sm font-bold text-ink">{formatETB(booking.total)}</p>
        <span aria-hidden="true" className="text-sm font-semibold text-ink">
          →
        </span>
      </div>
    </Link>
  );
}

export default function BookingHistory() {
  const { user, hydrated } = useCurrentUser();
  const bookings = useBookings();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading your bookings…
      </p>
    );
  }

  const mine = user
    ? bookings.filter((booking) => booking.renterId === user.id)
    : [];
  const active = mine.filter((booking) =>
    ACTIVE_STATUSES.includes(booking.status),
  );
  const past = mine.filter(
    (booking) => !ACTIVE_STATUSES.includes(booking.status),
  );

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            My bookings
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Requests you have sent, trips in progress and everything you have
            finished.
          </p>
        </div>
        <Link
          href="/cars"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          Browse cars
        </Link>
      </header>

      {mine.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <p className="font-semibold text-ink">No bookings yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Pick a car and choose your dates to send your first request.
          </p>
          <Link
            href="/cars"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Find a car
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <section aria-labelledby="active-bookings">
            <h2
              id="active-bookings"
              className="text-sm font-bold uppercase tracking-widest text-ink-muted"
            >
              Active ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Nothing active right now.
              </p>
            ) : (
              <ul role="list" className="mt-3 grid gap-3">
                {active.map((booking) => (
                  <li key={booking.id}>
                    <BookingRow booking={booking} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 ? (
            <section aria-labelledby="past-bookings">
              <h2
                id="past-bookings"
                className="text-sm font-bold uppercase tracking-widest text-ink-muted"
              >
                Past ({past.length})
              </h2>
              <ul role="list" className="mt-3 grid gap-3">
                {past.map((booking) => (
                  <li key={booking.id}>
                    <BookingRow booking={booking} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
