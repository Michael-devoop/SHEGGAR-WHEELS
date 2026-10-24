"use client";

import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { useBookings } from "@/hooks/useBookings";
import { useCars } from "@/hooks/useCars";
import { useDisputes } from "@/hooks/useDisputes";
import { useCurrentUser } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUsers";
import { getCarById } from "@/lib/data/cars";
import { formatDate, formatETB } from "@/lib/format";

export default function AdminOverview() {
  const { user, hydrated } = useCurrentUser();
  const users = useUsers();
  const cars = useCars();
  const bookings = useBookings();
  const disputes = useDisputes();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading the admin overview…
      </p>
    );
  }

  const pendingCars = cars.filter((car) => car.status === "pending");
  const approvedCars = cars.filter((car) => car.status === "approved");
  const openDisputes = disputes.filter(
    (dispute) => dispute.status === "open",
  );
  const suspended = users.filter((entry) => entry.status === "suspended");
  const completed = bookings.filter(
    (booking) =>
      booking.status === "completed" || booking.status === "reviewed",
  );
  const gross = completed.reduce((sum, booking) => sum + booking.total, 0);
  const recent = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const stats = [
    {
      label: "Pending listings",
      value: pendingCars.length,
      href: "/admin/listings",
      note: pendingCars.length ? "Waiting for review" : "Queue is clear",
    },
    {
      label: "Open disputes",
      value: openDisputes.length,
      href: "/admin/disputes",
      note: openDisputes.length ? "Needs a decision" : "Nothing open",
    },
    {
      label: "Accounts",
      value: users.length,
      href: "/admin/users",
      note: `${suspended.length} suspended`,
    },
    {
      label: "Completed trips",
      value: completed.length,
      href: "/admin/bookings",
      note: `${formatETB(gross)} gross`,
    },
  ];

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Admin overview
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {user?.name ? `Signed in as ${user.name}. ` : ""}
          The marketplace at a glance.
        </p>
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              {stat.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
              {stat.value}
            </dd>
            <p className="mt-1 text-xs text-ink-muted">{stat.note}</p>
            <Link
              href={stat.href}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
            >
              Open
            </Link>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <section aria-labelledby="recent">
          <h2
            id="recent"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Recent bookings
          </h2>
          {recent.length === 0 ? (
            <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
              No bookings yet.
            </p>
          ) : (
            <ul role="list" className="mt-3 grid gap-2">
              {recent.map((booking) => {
                const car = getCarById(booking.carId);
                return (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {car ? `${car.make} ${car.model}` : "Car removed"}
                        <span className="ml-2 font-normal text-ink-muted">
                          {booking.id}
                        </span>
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatDate(booking.startDate)} →{" "}
                        {formatDate(booking.endDate)} ·{" "}
                        {formatETB(booking.total)}
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted">
            Marketplace
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Approved cars</dt>
              <dd className="font-semibold text-ink">{approvedCars.length}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">All cars</dt>
              <dd className="font-semibold text-ink">{cars.length}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">All bookings</dt>
              <dd className="font-semibold text-ink">{bookings.length}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">All disputes</dt>
              <dd className="font-semibold text-ink">{disputes.length}</dd>
            </div>
          </dl>
          <Link
            href="/admin/reports"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            View reports
          </Link>
        </aside>
      </div>
    </div>
  );
}
