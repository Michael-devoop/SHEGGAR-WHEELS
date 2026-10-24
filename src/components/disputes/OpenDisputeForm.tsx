"use client";

import { useState, type FormEvent } from "react";

import { useDisputes } from "@/hooks/useDisputes";
import { openDispute } from "@/lib/actions/disputeActions";
import { canTransition } from "@/lib/domain/bookingMachine";
import type { Booking, Role } from "@/types";

const REASONS = [
  "Vehicle condition",
  "Late return",
  "Payment",
  "Other",
] as const;

export default function OpenDisputeForm({
  booking,
  role,
}: {
  booking: Booking;
  role: Role;
}) {
  const disputes = useDisputes();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]>(
    "Vehicle condition",
  );
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const existing = disputes.find(
    (dispute) => dispute.bookingId === booking.id,
  );
  const allowed = canTransition(booking.status, "dispute", role);

  if (existing) {
    return (
      <section aria-labelledby="dispute" className="mt-6">
        <h2
          id="dispute"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          Dispute
        </h2>
        <div className="mt-3 rounded-lg border border-border bg-surface p-4">
          <p className="font-semibold text-ink">{existing.reason}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {existing.description}
          </p>
          {existing.resolutionNotes ? (
            <div className="mt-3 rounded-md bg-surface-2 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Resolution
              </p>
              <p className="mt-1 text-sm text-ink">
                {existing.resolutionNotes}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-warning">
              Waiting for an admin to review this dispute.
            </p>
          )}
        </div>
      </section>
    );
  }

  if (!allowed) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = openDispute({
      bookingId: booking.id,
      reason,
      description,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setDescription("");
  }

  return (
    <section aria-labelledby="dispute" className="mt-6">
      <h2
        id="dispute"
        className="text-sm font-bold uppercase tracking-widest text-ink-muted"
      >
        Problem with this trip?
      </h2>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="mt-3 rounded-lg border border-border bg-surface p-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="dispute-reason" className="text-sm font-medium text-ink">
              What is the problem?
            </label>
            <select
              id="dispute-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as (typeof REASONS)[number])
              }
              className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            >
              {REASONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 space-y-1.5">
            <label
              htmlFor="dispute-description"
              className="text-sm font-medium text-ink"
            >
              What happened?
            </label>
            <textarea
              id="dispute-description"
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
              placeholder="Give the admin the facts and any dates or amounts that matter."
            />
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-md bg-danger-solid px-4 text-sm font-semibold text-danger-solid-text transition-opacity hover:opacity-90"
            >
              Open dispute
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-muted">
            If something went wrong, open a dispute. An admin reviews it, and
            both sides can see the outcome.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Report a problem
          </button>
        </>
      )}
    </section>
  );
}
