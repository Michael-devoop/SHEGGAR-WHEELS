"use client";

import { useState } from "react";
import Link from "next/link";

import { useBookings } from "@/hooks/useBookings";
import { useCars } from "@/hooks/useCars";
import { useCurrentUser } from "@/hooks/useSession";
import { toggleUnavailableDate } from "@/lib/actions/carActions";
import { formatDate } from "@/lib/format";

const BLOCKING = new Set(["requested", "confirmed", "in_progress", "disputed"]);
const DAY_MS = 86_400_000;
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const nextDate = (iso: string): string =>
  new Date(Date.parse(iso) + DAY_MS).toISOString().slice(0, 10);

const monthKey = (iso: string): string => iso.slice(0, 7);

export default function CarAvailability({ carId }: { carId: string }) {
  const { user, hydrated } = useCurrentUser();
  const cars = useCars();
  const bookings = useBookings();
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading availability…
      </p>
    );
  }

  const car = cars.find((entry) => entry.id === carId);
  if (!car || !user || car.ownerId !== user.id) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Car not found
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          You can only manage availability for your own cars.
        </p>
        <Link
          href="/owner/cars"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          My cars
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.parse(today) + 59 * DAY_MS)
    .toISOString()
    .slice(0, 10);

  const booked = new Set<string>();
  for (const booking of bookings) {
    if (booking.carId !== carId || !BLOCKING.has(booking.status)) continue;
    const last =
      booking.startDate === booking.endDate
        ? nextDate(booking.endDate)
        : booking.endDate;
    for (let date = booking.startDate; date < last; date = nextDate(date)) {
      booked.add(date);
    }
  }

  const blocked = new Set(car.unavailableDates);
  const days: string[] = [];
  for (let date = today; date <= end; date = nextDate(date)) days.push(date);

  const months = new Map<string, string[]>();
  for (const date of days) {
    const key = monthKey(date);
    const bucket = months.get(key) ?? [];
    bucket.push(date);
    months.set(key, bucket);
  }

  function toggle(date: string) {
    setError(null);
    const result = toggleUnavailableDate(carId, date);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/owner/cars/${car.id}/bookings`}
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> Bookings for this car
      </Link>

      <header className="mt-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Availability
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {car.make} {car.model} · {car.neighbourhood}, {car.city}. Tap a free
          night to block it; tap a blocked night to open it again.
        </p>
      </header>

      <ul role="list" className="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-sm border border-border bg-surface" />
          Open
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-sm bg-neutral-bg" />
          Blocked by you
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-sm bg-warning-bg" />
          Booked
        </li>
      </ul>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-5 space-y-6">
        {[...months.entries()].map(([key, dates]) => {
          const first = dates[0];
          const [year, month] = key.split("-").map(Number);
          const label = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric", timeZone: "UTC" },
          );
          const leading = (new Date(Date.parse(first)).getUTCDay() + 6) % 7;

          return (
            <section key={key} aria-label={label}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted">
                {label}
              </h2>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {DAY_LABELS.map((day) => (
                  <span
                    key={day}
                    aria-hidden="true"
                    className="py-1 text-center text-xs font-medium text-ink-muted"
                  >
                    {day}
                  </span>
                ))}
                {Array.from({ length: leading }, (_, index) => (
                  <span key={`blank-${index}`} aria-hidden="true" />
                ))}
                {dates.map((date) => {
                  const isBooked = booked.has(date);
                  const isBlocked = blocked.has(date);
                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={isBooked}
                      aria-pressed={isBlocked}
                      aria-label={`${formatDate(date)}${
                        isBooked
                          ? ", booked"
                          : isBlocked
                            ? ", blocked"
                            : ", open"
                      }`}
                      onClick={() => toggle(date)}
                      className={
                        isBooked
                          ? "min-h-11 rounded-md bg-warning-bg text-sm font-semibold text-warning opacity-70"
                          : isBlocked
                            ? "min-h-11 rounded-md bg-neutral-bg text-sm font-semibold text-neutral transition-colors hover:opacity-80"
                            : "min-h-11 rounded-md border border-border bg-surface text-sm text-ink transition-colors hover:bg-surface-2"
                      }
                    >
                      {Number(date.slice(8))}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
