"use client";

import { useState } from "react";
import Link from "next/link";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { useBookings } from "@/hooks/useBookings";
import { useCurrentUser } from "@/hooks/useSession";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { formatDate, formatETB } from "@/lib/format";
import type { BookingStatus } from "@/types";

const STATUS_OPTIONS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "reviewed", label: "Reviewed" },
  { value: "declined", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
  { value: "disputed", label: "Disputed" },
  { value: "resolved", label: "Resolved" },
];

export default function AdminBookings() {
  const { hydrated } = useCurrentUser();
  const bookings = useBookings();
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [query, setQuery] = useState("");

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading bookings…
      </p>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = bookings
    .filter((booking) => status === "all" || booking.status === status)
    .filter((booking) => {
      if (!needle) return true;
      const car = getCarById(booking.carId);
      const renter = getUserById(booking.renterId);
      return (
        booking.id.toLowerCase().includes(needle) ||
        (car ? `${car.make} ${car.model}`.toLowerCase().includes(needle) : false) ||
        (renter ? renter.name.toLowerCase().includes(needle) : false)
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Read-only oversight of every trip. Disputes are handled from the
          disputes queue.
        </p>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="space-y-1.5">
          <label htmlFor="booking-search" className="text-sm font-medium text-ink">
            Search
          </label>
          <input
            id="booking-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="Booking id, car or renter"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="booking-status" className="text-sm font-medium text-ink">
            Status
          </label>
          <select
            id="booking-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as BookingStatus | "all")
            }
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        {visible.length} {visible.length === 1 ? "booking" : "bookings"}
      </p>

      {visible.length === 0 ? (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
          No bookings match these filters.
        </p>
      ) : (
        <ul role="list" className="mt-3 grid gap-3">
          {visible.map((booking) => {
            const car = getCarById(booking.carId);
            const renter = getUserById(booking.renterId);
            const owner = getUserById(booking.ownerId);
            return (
              <li
                key={booking.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {car ? `${car.make} ${car.model}` : "Car removed"}
                      <span className="ml-2 font-normal text-ink-muted">
                        {booking.id}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {formatDate(booking.startDate)} →{" "}
                      {formatDate(booking.endDate)} · {booking.days}{" "}
                      {booking.days === 1 ? "day" : "days"}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Renter {renter?.name ?? "unknown"} · owner{" "}
                      {owner?.name ?? "unknown"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <BookingStatusBadge status={booking.status} />
                    <span className="text-sm font-semibold text-ink">
                      {formatETB(booking.total)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
                  {car ? (
                    <Link
                      href={`/cars/${car.id}`}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
                    >
                      View listing
                    </Link>
                  ) : null}
                  {booking.status === "disputed" ? (
                    <Link
                      href="/admin/disputes"
                      className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
                    >
                      Open dispute queue
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
