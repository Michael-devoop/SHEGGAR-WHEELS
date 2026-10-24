"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { useBookings } from "@/hooks/useBookings";
import { useDisputes } from "@/hooks/useDisputes";
import { useCurrentUser } from "@/hooks/useSession";
import { resolveDispute } from "@/lib/actions/disputeActions";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { formatDate, formatDateTime, formatETB } from "@/lib/format";

export default function AdminDisputeDetail({ disputeId }: { disputeId: string }) {
  const { hydrated } = useCurrentUser();
  const disputes = useDisputes();
  const bookings = useBookings();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading the dispute…
      </p>
    );
  }

  const dispute = disputes.find((entry) => entry.id === disputeId);
  if (!dispute) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Dispute not found
        </h1>
        <Link
          href="/admin/disputes"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Dispute queue
        </Link>
      </div>
    );
  }

  const booking = bookings.find((entry) => entry.id === dispute.bookingId);
  const car = booking ? getCarById(booking.carId) : null;
  const renter = booking ? getUserById(booking.renterId) : null;
  const owner = booking ? getUserById(booking.ownerId) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = resolveDispute(disputeId, notes);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotes("");
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/disputes"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> Dispute queue
      </Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {dispute.reason}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {car ? `${car.make} ${car.model}` : "Trip"} · opened{" "}
            {formatDateTime(dispute.createdAt)}
          </p>
        </div>
        <span
          className={
            dispute.status === "open"
              ? "rounded-pill bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning"
              : "rounded-pill bg-success-bg px-2.5 py-1 text-xs font-semibold text-success"
          }
        >
          {dispute.status === "open" ? "Open" : "Resolved"}
        </span>
      </header>

      <section aria-labelledby="claim" className="mt-6 rounded-lg border border-border bg-surface p-4">
        <h2
          id="claim"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          What was reported
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {dispute.description}
        </p>
      </section>

      {booking ? (
        <section aria-labelledby="trip-facts" className="mt-4 rounded-lg border border-border bg-surface p-4">
          <h2
            id="trip-facts"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Trip facts
          </h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-muted">Booking</dt>
              <dd className="font-medium text-ink">{booking.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Dates</dt>
              <dd className="font-medium text-ink">
                {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Total</dt>
              <dd className="font-medium text-ink">{formatETB(booking.total)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Payment</dt>
              <dd className="font-medium capitalize text-ink">
                {booking.paymentStatus}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Renter</dt>
              <dd className="font-medium text-ink">
                {renter?.name ?? "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Owner</dt>
              <dd className="font-medium text-ink">{owner?.name ?? "Unknown"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {dispute.status === "open" ? (
        <section aria-labelledby="decide" className="mt-4 rounded-lg border border-border bg-surface p-4">
          <h2
            id="decide"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Decision
          </h2>
          <form onSubmit={handleSubmit} className="mt-3">
            <label htmlFor="resolution" className="text-sm font-medium text-ink">
              What did you decide?
            </label>
            <textarea
              id="resolution"
              required
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
              placeholder="Explain the outcome to both sides. Both parties can read this."
            />
            {error ? (
              <p role="alert" className="mt-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-3 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Resolve dispute
            </button>
          </form>
        </section>
      ) : (
        <section aria-labelledby="outcome" className="mt-4 rounded-lg border border-border bg-surface p-4">
          <h2
            id="outcome"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Outcome
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            {dispute.resolutionNotes}
          </p>
          {dispute.resolvedAt ? (
            <p className="mt-2 text-xs text-ink-muted">
              Resolved {formatDateTime(dispute.resolvedAt)}
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}
