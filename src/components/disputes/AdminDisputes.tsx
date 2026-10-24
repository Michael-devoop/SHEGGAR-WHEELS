"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { useBookings } from "@/hooks/useBookings";
import { useDisputes } from "@/hooks/useDisputes";
import { resolveDispute } from "@/lib/actions/disputeActions";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Dispute } from "@/types";

function DisputeRow({ dispute }: { dispute: Dispute }) {
  const bookings = useBookings();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const booking = bookings.find((entry) => entry.id === dispute.bookingId);
  const car = booking ? getCarById(booking.carId) : null;
  const openedBy = getUserById(dispute.openedBy);
  const resolvedBy = dispute.resolvedBy
    ? getUserById(dispute.resolvedBy)
    : null;
  const open = dispute.status === "open";

  function handleResolve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = resolveDispute(dispute.id, notes);
    if (!result.ok) setError(result.error);
  }

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{dispute.reason}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {car ? `${car.make} ${car.model}` : "Car no longer listed"} ·{" "}
            {booking
              ? `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`
              : dispute.bookingId}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Opened by {openedBy?.name ?? dispute.openedBy} on{" "}
            {formatDateTime(dispute.createdAt)}
          </p>
        </div>
        <span
          className={
            open
              ? "rounded-pill bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning"
              : "rounded-pill bg-success-bg px-2.5 py-1 text-xs font-semibold text-success"
          }
        >
          {open ? "Open" : "Resolved"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink">
        {dispute.description}
      </p>

      <Link
        href={`/admin/disputes/`}
        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
      >
        Full details
      </Link>

      {dispute.resolutionNotes ? (
        <div className="mt-3 rounded-md bg-surface-2 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Resolution
          </p>
          <p className="mt-1 text-sm text-ink">{dispute.resolutionNotes}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {resolvedBy?.name ?? "Admin"}
            {dispute.resolvedAt
              ? ` · ${formatDateTime(dispute.resolvedAt)}`
              : ""}
          </p>
        </div>
      ) : null}

      {open ? (
        <form onSubmit={handleResolve} className="mt-3 border-t border-border pt-3">
          <label
            htmlFor={`notes-${dispute.id}`}
            className="text-sm font-medium text-ink"
          >
            Resolution notes
          </label>
          <textarea
            id={`notes-${dispute.id}`}
            required
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="What did you decide, and why?"
          />

          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-2 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Resolve dispute
          </button>
        </form>
      ) : null}
    </li>
  );
}

export default function AdminDisputes() {
  const disputes = useDisputes();
  const open = disputes.filter((dispute) => dispute.status === "open");
  const resolved = disputes.filter((dispute) => dispute.status === "resolved");

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Disputes
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Both sides can see the notes. Resolving a dispute releases the booking
          from the disputed state.
        </p>
      </header>

      <section aria-labelledby="open" className="mt-6">
        <h2
          id="open"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          Open ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
            No open disputes.
          </p>
        ) : (
          <ul role="list" className="mt-3 grid gap-3">
            {open.map((dispute) => (
              <DisputeRow key={dispute.id} dispute={dispute} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="resolved" className="mt-8">
        <h2
          id="resolved"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          Resolved ({resolved.length})
        </h2>
        {resolved.length === 0 ? (
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
            Nothing resolved yet.
          </p>
        ) : (
          <ul role="list" className="mt-3 grid gap-3">
            {resolved.map((dispute) => (
              <DisputeRow key={dispute.id} dispute={dispute} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
