"use client";

import Link from "next/link";

import { useBookings } from "@/hooks/useBookings";
import { useCurrentUser } from "@/hooks/useSession";
import { formatETB } from "@/lib/format";

const EARNED = new Set(["completed", "reviewed"]);
const UPCOMING = new Set(["confirmed", "in_progress"]);

export default function OwnerEarnings() {
  const { user, hydrated } = useCurrentUser();
  const bookings = useBookings();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading earnings…
      </p>
    );
  }

  if (!user) return null;

  const mine = bookings.filter((booking) => booking.ownerId === user.id);
  const earned = mine.filter((booking) => EARNED.has(booking.status));
  const upcoming = mine.filter((booking) => UPCOMING.has(booking.status));

  const total = earned.reduce((sum, booking) => sum + booking.total, 0);
  const upcomingTotal = upcoming.reduce(
    (sum, booking) => sum + booking.total,
    0,
  );

  const byMonth = new Map<string, { total: number; trips: number }>();
  for (const booking of earned) {
    const key = booking.endDate.slice(0, 7);
    const bucket = byMonth.get(key) ?? { total: 0, trips: 0 };
    bucket.total += booking.total;
    bucket.trips += 1;
    byMonth.set(key, bucket);
  }
  const months = [...byMonth.entries()].sort(([a], [b]) => b.localeCompare(a));

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Earnings
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Completed trips only. Cancelled, declined and open disputes are not
            counted.
          </p>
        </div>
        <Link
          href="/owner/bookings"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          Manage bookings
        </Link>
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Earned
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {formatETB(total)}
          </dd>
          <p className="mt-1 text-xs text-ink-muted">
            {earned.length} completed {earned.length === 1 ? "trip" : "trips"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Upcoming
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {formatETB(upcomingTotal)}
          </dd>
          <p className="mt-1 text-xs text-ink-muted">
            {upcoming.length} booked {upcoming.length === 1 ? "trip" : "trips"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Average trip
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {formatETB(earned.length ? total / earned.length : 0)}
          </dd>
          <p className="mt-1 text-xs text-ink-muted">Across completed trips</p>
        </div>
      </dl>

      <section aria-labelledby="by-month" className="mt-8">
        <h2
          id="by-month"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          By month
        </h2>

        {months.length === 0 ? (
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
            No completed trips yet. Earnings appear here when a trip is marked
            complete.
          </p>
        ) : (
          <table className="mt-3 w-full border-collapse text-sm">
            <caption className="sr-only">
              Earnings from completed trips, by return month
            </caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-ink-muted">
                <th scope="col" className="py-2 font-semibold">
                  Month
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Trips
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Earned
                </th>
              </tr>
            </thead>
            <tbody>
              {months.map(([key, bucket]) => {
                const [year, month] = key.split("-").map(Number);
                const label = new Date(year, month - 1, 1).toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" },
                );
                return (
                  <tr key={key} className="border-b border-border last:border-0">
                    <th scope="row" className="py-3 text-left font-medium text-ink">
                      {label}
                    </th>
                    <td className="py-3 text-ink-muted">{bucket.trips}</td>
                    <td className="py-3 text-right font-semibold text-ink">
                      {formatETB(bucket.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
