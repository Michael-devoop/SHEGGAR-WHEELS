"use client";

import Image from "next/image";
import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { useBookings } from "@/hooks/useBookings";
import { useReviews } from "@/hooks/useReviews";
import { useCurrentUser } from "@/hooks/useSession";
import { getCarById } from "@/lib/data/cars";
import { formatDate, formatETB } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types";

const UPCOMING: readonly BookingStatus[] = [
  "requested",
  "confirmed",
  "in_progress",
];

const today = (): string => new Date().toISOString().slice(0, 10);

function TripCard({ booking }: { booking: Booking }) {
  const car = getCarById(booking.carId);

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-4">
        {car ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface-2">
            <Image
              src={car.photos[0]}
              alt={`${car.make} ${car.model}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">
              {car ? `${car.make} ${car.model}` : "Car no longer listed"}
            </p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ·{" "}
            {formatETB(booking.total)}
          </p>
          <Link
            href={`/renter/bookings/${booking.id}`}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
          >
            View booking
          </Link>
        </div>
      </div>
    </li>
  );
}

export default function RenterDashboard() {
  const { user, hydrated } = useCurrentUser();
  const bookings = useBookings();
  const reviews = useReviews();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading your dashboard…
      </p>
    );
  }

  const mine = user
    ? bookings.filter((booking) => booking.renterId === user.id)
    : [];
  const upcoming = mine
    .filter(
      (booking) =>
        UPCOMING.includes(booking.status) && booking.endDate >= today(),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = mine
    .filter((booking) => !UPCOMING.includes(booking.status))
    .slice(0, 3);
  const myReviews = user
    ? reviews.filter((review) => review.renterId === user.id)
    : [];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Your trips"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your requests, upcoming trips and past rentals in one place.
          </p>
        </div>
        <Link
          href="/cars"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Find a car
        </Link>
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Upcoming
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">
            {upcoming.length}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Trips taken
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">
            {
              mine.filter((booking) =>
                ["completed", "reviewed"].includes(booking.status),
              ).length
            }
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Reviews written
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">
            {myReviews.length}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="upcoming" className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="upcoming"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Upcoming trips
          </h2>
          <Link
            href="/renter/bookings"
            className="text-sm font-medium text-ink underline underline-offset-4"
          >
            All bookings
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="mt-3 rounded-lg border border-border bg-surface p-6">
            <p className="font-semibold text-ink">No upcoming trips.</p>
            <p className="mt-1 text-sm text-ink-muted">
              Browse approved cars and send a request; the owner confirms it.
            </p>
            <Link
              href="/cars"
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Browse cars
            </Link>
          </div>
        ) : (
          <ul role="list" className="mt-3 grid gap-3">
            {upcoming.map((booking) => (
              <TripCard key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section aria-labelledby="past" className="mt-8">
          <h2
            id="past"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Recent history
          </h2>
          <ul role="list" className="mt-3 grid gap-3">
            {past.map((booking) => (
              <TripCard key={booking.id} booking={booking} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
