"use client";

import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import CarStatusBadge from "@/components/cars/CarStatusBadge";
import { useBookings } from "@/hooks/useBookings";
import { useCars } from "@/hooks/useCars";
import { useCurrentUser } from "@/hooks/useSession";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { formatDate, formatETB } from "@/lib/format";
import type { Booking } from "@/types";

const ACTIVE = ["confirmed", "in_progress"] as const;

function RequestRow({ booking }: { booking: Booking }) {
  const car = getCarById(booking.carId);
  const renter = getUserById(booking.renterId);

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="min-w-0">
        <p className="font-semibold text-ink">
          {car ? `${car.make} ${car.model}` : "Car no longer listed"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {renter?.name ?? "A renter"} · {formatDate(booking.startDate)} →{" "}
          {formatDate(booking.endDate)} · {formatETB(booking.subtotal)}
        </p>
      </div>
      <BookingStatusBadge status={booking.status} />
    </li>
  );
}

export default function OwnerDashboard() {
  const { user, hydrated } = useCurrentUser();
  const cars = useCars();
  const bookings = useBookings();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading your overview…
      </p>
    );
  }

  const mine = user ? cars.filter((car) => car.ownerId === user.id) : [];
  const carIds = new Set(mine.map((car) => car.id));
  const received = user
    ? bookings.filter(
        (booking) => booking.ownerId === user.id && carIds.has(booking.carId),
      )
    : [];
  const requests = received.filter((booking) => booking.status === "requested");
  const active = received.filter((booking) =>
    ACTIVE.includes(booking.status as (typeof ACTIVE)[number]),
  );
  const earnings = received
    .filter((booking) =>
      ["completed", "reviewed", "resolved"].includes(booking.status),
    )
    .reduce((sum, booking) => sum + booking.subtotal, 0);
  const live = mine.filter((car) => car.status === "approved").length;
  const waiting = mine.filter(
    (car) => car.status === "pending" || car.status === "rejected",
  ).length;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Your business"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your cars, requests and earnings at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/owner/bookings"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Booking requests
          </Link>
          <Link
            href="/owner/cars/new"
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            List a car
          </Link>
        </div>
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            New requests
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">
            {requests.length}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Active trips
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">{active.length}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Live listings
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">{live}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Earnings
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">
            {formatETB(earnings)}
          </dd>
        </div>
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="requests">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="requests"
              className="text-sm font-bold uppercase tracking-widest text-ink-muted"
            >
              Waiting for you
            </h2>
            <Link
              href="/owner/bookings"
              className="text-sm font-medium text-ink underline underline-offset-4"
            >
              All requests
            </Link>
          </div>

          {requests.length === 0 ? (
            <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
              No new requests. Booking requests appear here for you to accept or
              decline.
            </p>
          ) : (
            <ul role="list" className="mt-3 grid gap-3">
              {requests.slice(0, 3).map((booking) => (
                <RequestRow key={booking.id} booking={booking} />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="fleet">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="fleet"
              className="text-sm font-bold uppercase tracking-widest text-ink-muted"
            >
              Your fleet
            </h2>
            <Link
              href="/owner/cars"
              className="text-sm font-medium text-ink underline underline-offset-4"
            >
              Manage cars
            </Link>
          </div>

          {mine.length === 0 ? (
            <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
              You have not listed a car yet.
            </p>
          ) : (
            <ul role="list" className="mt-3 grid gap-3">
              {mine.slice(0, 4).map((car) => (
                <li
                  key={car.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-4"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {car.make} {car.model}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {formatETB(car.pricePerDay)} / day · {car.neighbourhood}
                    </p>
                  </div>
                  <CarStatusBadge status={car.status} />
                </li>
              ))}
            </ul>
          )}

          {waiting > 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              {waiting} {waiting === 1 ? "listing needs" : "listings need"}{" "}
              attention before they can go live.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
