"use client";

import { useState } from "react";
import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import CarStatusBadge from "@/components/cars/CarStatusBadge";
import { useBookings } from "@/hooks/useBookings";
import { useCars } from "@/hooks/useCars";
import { useCurrentUser } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUsers";
import { setUserStatus } from "@/lib/actions/adminActions";
import { formatDate, formatETB } from "@/lib/format";

export default function AdminUserDetail({ userId }: { userId: string }) {
  const { user: current, hydrated } = useCurrentUser();
  const users = useUsers();
  const cars = useCars();
  const bookings = useBookings();
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading the account…
      </p>
    );
  }

  const account = users.find((entry) => entry.id === userId);
  if (!account) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Account not found
        </h1>
        <Link
          href="/admin/users"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          All accounts
        </Link>
      </div>
    );
  }

  const owned = cars.filter((car) => car.ownerId === account.id);
  const rented = bookings.filter(
    (booking) => booking.renterId === account.id,
  );
  const hosted = bookings.filter(
    (booking) => booking.ownerId === account.id,
  );
  const isSelf = current?.id === account.id;
  const suspended = account.status === "suspended";

  function changeStatus() {
    setError(null);
    const result = setUserStatus(
      account ? account.id : "",
      suspended ? "active" : "suspended",
    );
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/users"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> All accounts
      </Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {account.name}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {account.email} · {account.phone}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {account.roles.join(", ")} · joined {formatDate(account.createdAt)}
          </p>
        </div>
        <span
          className={
            suspended
              ? "rounded-pill bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger"
              : "rounded-pill bg-success-bg px-2.5 py-1 text-xs font-semibold text-success"
          }
        >
          {suspended ? "Suspended" : "Active"}
        </span>
      </header>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {!isSelf ? (
        <button
          type="button"
          onClick={changeStatus}
          className="mt-4 inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          {suspended ? "Reactivate account" : "Suspend account"}
        </button>
      ) : null}

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Cars
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">{owned.length}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Trips as renter
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">{rented.length}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Trips as owner
          </dt>
          <dd className="mt-1 text-2xl font-bold text-ink">{hosted.length}</dd>
        </div>
      </dl>

      <section aria-labelledby="owned-cars" className="mt-8">
        <h2
          id="owned-cars"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          Cars
        </h2>
        {owned.length === 0 ? (
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
            This account has not listed a car.
          </p>
        ) : (
          <ul role="list" className="mt-3 grid gap-2">
            {owned.map((car) => (
              <li
                key={car.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {car.make} {car.model}{" "}
                    <span className="font-normal text-ink-muted">
                      {car.neighbourhood}
                    </span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatETB(car.pricePerDay)} per day
                  </p>
                </div>
                <CarStatusBadge status={car.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="bookings" className="mt-8">
        <h2
          id="bookings"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          Recent bookings
        </h2>
        {rented.length + hosted.length === 0 ? (
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
            No bookings involve this account.
          </p>
        ) : (
          <ul role="list" className="mt-3 grid gap-2">
            {[...new Set([...rented, ...hosted])]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 8)
              .map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {booking.id}{" "}
                      <span className="font-normal text-ink-muted">
                        {booking.renterId === account.id ? "as renter" : "as owner"}
                      </span>
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatDate(booking.startDate)} →{" "}
                      {formatDate(booking.endDate)} · {formatETB(booking.total)}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
