"use client";

import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import StatusTimeline from "@/components/bookings/StatusTimeline";
import { useBookings } from "@/hooks/useBookings";
import { useCurrentUser } from "@/hooks/useSession";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { formatDate } from "@/lib/format";

export default function TripTracker({ bookingId }: { bookingId: string }) {
  const { user, hydrated } = useCurrentUser();
  const bookings = useBookings();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading this trip…
      </p>
    );
  }

  const booking = bookings.find((entry) => entry.id === bookingId);
  if (!booking || !user || booking.renterId !== user.id) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Trip not found
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          You can only track trips that you booked.
        </p>
        <Link
          href="/renter/bookings"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          My bookings
        </Link>
      </div>
    );
  }

  const car = getCarById(booking.carId);
  const owner = getUserById(booking.ownerId);

  return (
    <div className="max-w-2xl">
      <Link
        href={`/renter/bookings/${booking.id}`}
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> Booking details
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {car ? `${car.make} ${car.model}` : "Your trip"}
        </h1>
        <BookingStatusBadge status={booking.status} />
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
        {car ? ` · pickup in ${car.neighbourhood}` : ""}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-start">
        <section
          aria-labelledby="progress"
          className="rounded-lg border border-border bg-surface p-4"
        >
          <h2
            id="progress"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Progress
          </h2>
          <div className="mt-4">
            <StatusTimeline booking={booking} />
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted">
            Key details
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs text-ink-muted">Owner</dt>
              <dd className="font-medium text-ink">
                {owner?.name ?? "Not available"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Pickup</dt>
              <dd className="font-medium text-ink">
                {car ? `${car.neighbourhood}, ${car.city}` : "Not available"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Days</dt>
              <dd className="font-medium text-ink">
                {booking.days} {booking.days === 1 ? "day" : "days"}
              </dd>
            </div>
          </dl>
          <Link
            href={`/renter/bookings/${booking.id}`}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Booking details
          </Link>
        </aside>
      </div>
    </div>
  );
}
