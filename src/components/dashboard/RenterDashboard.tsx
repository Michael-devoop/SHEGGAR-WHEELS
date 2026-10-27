"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import DashboardBookingsTable from "@/components/dashboard/DashboardBookingsTable";
import {
  DetailStat,
  MiniStat,
  PrimaryStat,
  StatsBento,
  TrendStat,
} from "@/components/dashboard/DashboardStats";
import { useBookings } from "@/hooks/useBookings";
import { useReviews } from "@/hooks/useReviews";
import { useCurrentUser } from "@/hooks/useSession";
import { getCarById } from "@/lib/data/cars";
import {
  averageRating,
  buildMonthlyActivity,
  isPaidEarnedBooking,
} from "@/lib/domain/dashboardStats";
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
  const tripsTaken = mine.filter(isPaidEarnedBooking);
  const activity = buildMonthlyActivity(
    tripsTaken.map((booking) => booking.endDate),
  );
  const rating = averageRating(myReviews.map((review) => review.rating));
  const next = upcoming[0];
  const nextCar = next ? getCarById(next.carId) : null;
  const carLabel = nextCar
    ? `${nextCar.make} ${nextCar.model}`
    : "your trip";

  let nextDescription =
    "No upcoming trips. Browse approved cars and send a request.";
  if (next?.status === "in_progress") {
    nextDescription = `In progress: ${carLabel} returns ${formatDate(
      next.endDate,
    )}.`;
  } else if (next?.status === "requested") {
    nextDescription = `Requested: ${carLabel} for ${formatDate(
      next.startDate,
    )}.`;
  } else if (next) {
    nextDescription = `Next up: ${carLabel} starts ${formatDate(
      next.startDate,
    )}.`;
  }

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

      <StatsBento>
        <PrimaryStat
          label="Upcoming trips"
          value={upcoming.length}
          description={nextDescription}
        />
        <TrendStat
          href="/renter/bookings"
          label="Trips taken"
          value={tripsTaken.length}
          points={activity}
          note={`Last 8 months · ${mine.length} total ${
            mine.length === 1 ? "booking" : "bookings"
          }`}
        />
        <MiniStat label="Reviews written" value={myReviews.length} />
        <DetailStat
          href="/renter/bookings"
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
            rating === null
              ? "Rate a completed trip"
              : "Average rating you gave"
          }
        />
      </StatsBento>

      <DashboardBookingsTable
        className="mt-8"
        variant="renter"
        bookings={upcoming}
        empty={
          <>
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
          </>
        }
      />

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
