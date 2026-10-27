"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import OpenDisputeForm from "@/components/disputes/OpenDisputeForm";
import StarRating from "@/components/reviews/StarRating";
import AccessBlocked from "@/components/layout/AccessBlocked";
import { useCurrentUser } from "@/hooks/useSession";
import { useBookings } from "@/hooks/useBookings";
import { useReviews } from "@/hooks/useReviews";
import { cancelBooking } from "@/lib/actions/bookingActions";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { canTransition } from "@/lib/domain/bookingMachine";
import { carPath } from "@/lib/domain/carSlug";
import { formatDate, formatDays, formatETB } from "@/lib/format";
import { paymentStatusLabel } from "@/lib/status";
import type { Role } from "@/types";

const PAYMENT_NOTE: Record<string, string> = {
  unpaid: "Nothing has been charged. The owner reviews the request first.",
  held: "The amount is held and is released to the owner when the trip completes.",
  paid: "The owner has been paid for this trip.",
  refunded: "The held amount was refunded.",
};

export default function BookingDetail({ bookingId }: { bookingId: string }) {
  const { user, hydrated } = useCurrentUser();
  const bookings = useBookings();
  const reviews = useReviews();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const booking = bookings.find((entry) => entry.id === bookingId) ?? null;

  const role: Role | null =
    booking && user
      ? booking.renterId === user.id
        ? "renter"
        : booking.ownerId === user.id
          ? "owner"
          : null
      : null;

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading this booking…
      </p>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Booking not found
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          This booking does not exist in this browser, or it belongs to another
          account.
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

  if (!role) {
    return (
      <AccessBlocked
        title="This booking belongs to someone else"
        message="You can only open bookings that you requested or that are for your own car."
        homeHref="/renter/bookings"
        homeLabel="My bookings"
      />
    );
  }

  const car = getCarById(booking.carId);
  const owner = getUserById(booking.ownerId);
  const canCancel = canTransition(booking.status, "cancel", role);
  const review = reviews.find((entry) => entry.bookingId === booking.id);

  function handleCancel() {
    if (!booking) return;
    setError(null);
    const result = cancelBooking(booking.id);
    setConfirming(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div>
      <Link
        href="/renter/bookings"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> My bookings
      </Link>

      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {car ? `${car.make} ${car.model}` : "Booking"}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Booking {booking.id} · created {formatDate(booking.createdAt)}
          </p>

          <section aria-labelledby="trip" className="mt-6">
            <h2 id="trip" className="text-sm font-bold uppercase tracking-widest text-ink-muted">
              Your trip
            </h2>

            <div className="mt-3 grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">Pickup</p>
                  <p className="text-sm font-medium text-ink">
                    {formatDate(booking.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">Return</p>
                  <p className="text-sm font-medium text-ink">
                    {formatDate(booking.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">Pickup point</p>
                  <p className="text-sm font-medium text-ink">
                    {car ? `${car.neighbourhood}, ${car.city}` : "Car no longer listed"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {role === "renter" &&
          (booking.status === "confirmed" ||
            booking.status === "in_progress") ? (
            <Link
              href={`/renter/bookings/${booking.id}/track`}
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Track this trip
            </Link>
          ) : null}

          {car ? (
            <section aria-labelledby="car" className="mt-6">
              <h2 id="car" className="text-sm font-bold uppercase tracking-widest text-ink-muted">
                The car
              </h2>
              <div className="mt-3 flex gap-4 rounded-lg border border-border bg-surface p-3">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-surface-2">
                  <Image
                    src={car.photos[0]}
                    alt={`${car.make} ${car.model}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {car.make} {car.model}{" "}
                    <span className="font-normal text-ink-muted">{car.year}</span>
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {car.transmission === "automatic" ? "Automatic" : "Manual"} ·{" "}
                    {car.seats} seats
                  </p>
                  {car.status === "approved" ? (
                    <Link
                      href={carPath(car)}
                      className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
                    >
                      View the listing
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {owner ? (
            <p className="mt-6 text-sm text-ink-muted">
              Owner: <span className="font-medium text-ink">{owner.name}</span>
            </p>
          ) : null}

          {review ? (
            <section aria-labelledby="your-review" className="mt-6">
              <h2
                id="your-review"
                className="text-sm font-bold uppercase tracking-widest text-ink-muted"
              >
                Your review
              </h2>
              <div className="mt-3 rounded-lg border border-border bg-surface p-4">
                <StarRating rating={review.rating} />
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {review.comment}
                </p>
                {review.ownerReply ? (
                  <blockquote className="mt-3 border-l-2 border-border pl-3">
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {review.ownerReply}
                    </p>
                    <footer className="mt-1 text-xs text-ink-muted">
                      — {owner?.name ?? "Owner"}
                    </footer>
                  </blockquote>
                ) : null}
              </div>
            </section>
          ) : role === "renter" && booking.status === "completed" ? (
            <Link
              href={`/renter/bookings/${booking.id}/review`}
              className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Leave a review
            </Link>
          ) : null}

          <OpenDisputeForm booking={booking} role={role} />
        </div>

        <aside className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted">
            Price
          </h2>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">
                {formatETB(booking.pricePerDay)} × {formatDays(booking.days)}
              </dt>
              <dd className="font-medium text-ink">{formatETB(booking.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Platform fee</dt>
              <dd className="font-medium text-ink">{formatETB(booking.fee)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-bold text-ink">{formatETB(booking.total)}</dd>
            </div>
          </dl>

          <p className="mt-4 rounded-md bg-surface-2 px-3 py-2 text-sm text-ink">
            {paymentStatusLabel(booking.paymentStatus)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {PAYMENT_NOTE[booking.paymentStatus]}
          </p>

          {error ? (
            <p role="alert" className="mt-4 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {canCancel ? (
            confirming ? (
              <div className="mt-4 rounded-md border border-border bg-bg p-3">
                <p className="text-sm font-medium text-ink">
                  Cancel this booking?
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  The dates are released and any held payment is refunded.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex min-h-11 items-center rounded-md bg-danger-solid px-4 text-sm font-semibold text-danger-solid-text transition-opacity hover:opacity-90"
                  >
                    Yes, cancel booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                  >
                    Keep booking
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                Cancel booking
              </button>
            )
          ) : booking.status === "cancelled" ? (
            <p className="mt-4 text-sm text-ink-muted">
              This booking was cancelled and no longer holds the car.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
