"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import DashboardBookingsTable from "@/components/dashboard/DashboardBookingsTable";
import {
  DetailStat,
  MiniStat,
  PrimaryStat,
  StatsBento,
  TrendStat,
} from "@/components/dashboard/DashboardStats";
import { useBookings } from "@/hooks/useBookings";
import { useCars } from "@/hooks/useCars";
import { useDisputes } from "@/hooks/useDisputes";
import { useCurrentUser } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUsers";
import {
  buildMonthlyActivity,
  isPaidEarnedBooking,
} from "@/lib/domain/dashboardStats";
import { formatETB } from "@/lib/format";

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
  const completed = bookings.filter(isPaidEarnedBooking);
  const gross = completed.reduce((sum, booking) => sum + booking.total, 0);
  const recent = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const activity = buildMonthlyActivity(
    bookings.map((booking) => booking.createdAt),
  );

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

      <StatsBento>
        <PrimaryStat
          label="Gross bookings"
          value={formatETB(gross)}
          description={`${completed.length} completed ${
            completed.length === 1 ? "trip" : "trips"
          } across ${bookings.length} ${
            bookings.length === 1 ? "booking" : "bookings"
          }.`}
        />
        <TrendStat
          href="/admin/bookings"
          label="Bookings"
          value={bookings.length}
          points={activity}
          note="All bookings, last 8 months"
        />
        <MiniStat
          href="/admin/listings"
          label="Pending listings"
          value={pendingCars.length}
          note={pendingCars.length ? "Waiting for review" : "Queue is clear"}
        />
        <DetailStat
          href="/admin/disputes"
          icon={
            <AlertTriangle
              className={
                openDisputes.length
                  ? "size-5 text-warning"
                  : "size-5 text-muted-foreground"
              }
            />
          }
          title={`${openDisputes.length} open ${
            openDisputes.length === 1 ? "dispute" : "disputes"
          }`}
          note={openDisputes.length ? "Needs a decision" : "Nothing open"}
        />
      </StatsBento>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <DashboardBookingsTable
          className="min-w-0"
          variant="admin"
          bookings={recent}
          empty={
            <p className="text-sm text-ink-muted">
              No bookings yet. New bookings will appear here.
            </p>
          }
        />

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
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">All accounts</dt>
              <dd className="font-semibold text-ink">{users.length}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Suspended</dt>
              <dd className="font-semibold text-ink">{suspended.length}</dd>
            </div>
          </dl>
          <Link
            href="/admin/reports"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            View reports
          </Link>
          <Link
            href="/admin/users"
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Manage users
          </Link>
        </aside>
      </div>
    </div>
  );
}
