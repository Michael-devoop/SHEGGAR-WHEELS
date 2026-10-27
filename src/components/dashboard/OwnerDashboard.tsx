"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import CarStatusBadge from "@/components/cars/CarStatusBadge";
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
import { useReviews } from "@/hooks/useReviews";
import { useCurrentUser } from "@/hooks/useSession";
import {
  averageRating,
  buildMonthlyActivity,
  isPaidEarnedBooking,
} from "@/lib/domain/dashboardStats";
import { formatETB } from "@/lib/format";

const ACTIVE = ["confirmed", "in_progress"] as const;

export default function OwnerDashboard() {
  const { user, hydrated } = useCurrentUser();
  const cars = useCars();
  const bookings = useBookings();
  const reviews = useReviews();

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
  const earned = received.filter(isPaidEarnedBooking);
  const earnings = earned.reduce((sum, booking) => sum + booking.total, 0);
  const live = mine.filter((car) => car.status === "approved").length;
  const waiting = mine.filter(
    (car) => car.status === "pending" || car.status === "rejected",
  ).length;
  const completedTrips = earned.length;
  const requestActivity = buildMonthlyActivity(
    received.map((booking) => booking.createdAt),
  );
  const ownerReviews = user
    ? reviews.filter((review) => review.ownerId === user.id)
    : [];
  const rating = averageRating(ownerReviews.map((review) => review.rating));

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

      <StatsBento>
        <PrimaryStat
          label="Lifetime earnings"
          value={formatETB(earnings)}
          description={`${completedTrips} completed ${
            completedTrips === 1 ? "trip" : "trips"
          } paid out to you.`}
          meta={`${active.length} active ${
            active.length === 1 ? "trip" : "trips"
          } on the road now.`}
        />
        <TrendStat
          href="/owner/bookings"
          label="New requests"
          value={requests.length}
          points={requestActivity}
          note={`Last 8 months · ${active.length} active · ${received.length} total`}
        />
        <MiniStat
          href="/owner/cars"
          label="Live listings"
          value={live}
          note={
            waiting > 0
              ? `${waiting} ${waiting === 1 ? "needs" : "need"} attention`
              : mine.length === 0
                ? "List your first car"
                : "All approved"
          }
        />
        <DetailStat
          href="/owner/reviews"
          icon={
            <Star
              className={
                rating === null
                  ? "size-5 text-muted-foreground"
                  : "size-5 fill-highlight text-highlight"
              }
            />
          }
          title={
            rating === null ? "No reviews yet" : `${rating.toFixed(1)} / 5.0`
          }
          note={
            ownerReviews.length === 0
              ? "Reviews appear after trips"
              : `${ownerReviews.length} ${
                  ownerReviews.length === 1 ? "review" : "reviews"
                }`
          }
        />
      </StatsBento>

      <div className="mt-8 space-y-8">
        <DashboardBookingsTable
          variant="owner"
          bookings={requests}
          empty={
            <>
              <p className="font-semibold text-ink">No new requests.</p>
              <p className="mt-1 text-sm text-ink-muted">
                Booking requests appear here for you to accept or decline.
              </p>
            </>
          }
        />

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
            <ul role="list" className="mt-3 grid gap-3 sm:grid-cols-2">
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
