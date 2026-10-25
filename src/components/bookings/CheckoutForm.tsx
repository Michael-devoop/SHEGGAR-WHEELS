"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";

import { createBooking } from "@/lib/actions/bookingActions";
import { listBookingsForCar } from "@/lib/data/bookings";
import {
  isCarAvailable,
  isValidDateRange,
} from "@/lib/domain/availability";
import { quoteForCar } from "@/lib/domain/pricing";
import { formatDays, formatETB } from "@/lib/format";
import { useCurrentUser } from "@/hooks/useSession";
import type { Car, ISODate } from "@/types";

const MS_PER_DAY = 86_400_000;

const isoOffset = (days: number): ISODate =>
  new Date(Date.now() + days * MS_PER_DAY).toISOString().slice(0, 10);

const FIELD =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

/**
 * Date picker, live quote and request submission for one car.
 *
 * Availability and price are recomputed on every date change with the same
 * pure functions the action uses, so the preview cannot disagree with what is
 * saved. The action still re-checks everything.
 */
export default function CheckoutForm({
  car,
  initialStartDate = "",
  initialEndDate = "",
}: {
  car: Car;
  initialStartDate?: ISODate | "";
  initialEndDate?: ISODate | "";
}) {
  const router = useRouter();
  const { user, hydrated } = useCurrentUser();
  const hasInitialDates = isValidDateRange(initialStartDate, initialEndDate);
  const [startDate, setStartDate] = useState<ISODate>(() =>
    hasInitialDates ? initialStartDate : isoOffset(1),
  );
  const [endDate, setEndDate] = useState<ISODate>(() =>
    hasInitialDates ? initialEndDate : isoOffset(3),
  );
  const [error, setError] = useState<string | null>(null);

  const today = isoOffset(0);
  const valid = isValidDateRange(startDate, endDate);
  const available =
    valid && isCarAvailable(car, listBookingsForCar(car.id), startDate, endDate);
  const pricing = valid ? quoteForCar(car, startDate, endDate) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = createBooking({ carId: car.id, startDate, endDate });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/renter/bookings/${result.data.id}`);
    router.refresh();
  }

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Checking your session…
      </p>
    );
  }

  if (user && user.id === car.ownerId) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          This is your own car
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          You cannot request a booking for a car you own. Manage its calendar
          from the owner workspace instead.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/owner/cars/${car.id}/availability`}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Manage availability
          </Link>
          <Link
            href={`/cars/${car.id}`}
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Back to the listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
      <div>
        <Link
          href={`/cars/${car.id}`}
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> Back to the car
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Request this car
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Choose your dates, review the price, and send a request. Nothing is
          charged until the owner accepts.
        </p>

        <div className="mt-6 flex gap-4 rounded-lg border border-border bg-surface p-3">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-surface-2">
            <Image
              src={car.photos[0]}
              alt={`${car.make} ${car.model}`}
              fill
              sizes="96px"
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink">
              {car.make} {car.model}{" "}
              <span className="font-normal text-ink-muted">{car.year}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              {car.neighbourhood}, {car.city}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {formatETB(car.pricePerDay)} per day
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="text-sm font-medium text-ink">
                Pickup date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                min={today}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={FIELD}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="endDate" className="text-sm font-medium text-ink">
                Return date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                min={startDate || today}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <p
            aria-live="polite"
            className={
              valid
                ? available
                  ? "text-sm font-medium text-success"
                  : "text-sm font-medium text-danger"
                : "text-sm text-ink-muted"
            }
          >
            {!valid
              ? "Choose a return date on or after the pickup date."
              : available
                ? "Available for these dates."
                : "The car is not available for these dates."}
          </p>

          {pricing ? (
            <dl className="space-y-2 rounded-lg border border-border bg-surface p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">
                  {formatETB(car.pricePerDay)} × {formatDays(pricing.days)}
                </dt>
                <dd className="font-medium text-ink">
                  {formatETB(pricing.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Platform fee</dt>
                <dd className="font-medium text-ink">
                  {formatETB(pricing.fee)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-bold text-ink">{formatETB(pricing.total)}</dd>
              </div>
            </dl>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!valid || !available}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Send request
          </button>

          <p className="flex items-start gap-2 text-xs text-ink-muted">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            Free cancellation until the owner confirms. The fee is already
            included in the total.
          </p>
        </form>
      </div>
    </div>
  );
}
