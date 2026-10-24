"use client";

import Link from "next/link";

import { useBookings } from "@/hooks/useBookings";
import { useDisputes } from "@/hooks/useDisputes";
import { useCurrentUser } from "@/hooks/useSession";
import { getCarById } from "@/lib/data/cars";
import { formatDate } from "@/lib/format";

export default function OwnerDisputes() {
  const { user, hydrated } = useCurrentUser();
  const disputes = useDisputes();
  const bookings = useBookings();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading disputes…
      </p>
    );
  }

  if (!user) return null;

  const mine = disputes
    .map((dispute) => ({
      dispute,
      booking: bookings.find((entry) => entry.id === dispute.bookingId),
    }))
    .filter((entry) => entry.booking?.ownerId === user.id)
    .sort((a, b) => b.dispute.createdAt.localeCompare(a.dispute.createdAt));

  const open = mine.filter((entry) => entry.dispute.status === "open").length;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Disputes
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Problems a renter or you raised on one of your trips. An admin decides
          the outcome.
        </p>
      </header>

      <p className="mt-4 text-sm text-ink-muted">
        {mine.length} {mine.length === 1 ? "dispute" : "disputes"} · {open} open
      </p>

      {mine.length === 0 ? (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
          No disputes on your trips.
        </p>
      ) : (
        <ul role="list" className="mt-3 grid gap-3">
          {mine.map(({ dispute, booking }) => {
            const car = booking ? getCarById(booking.carId) : null;
            return (
              <li
                key={dispute.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {car ? `${car.make} ${car.model}` : "Trip"}{" "}
                      <span className="font-normal text-ink-muted">
                        · {dispute.reason}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Opened {formatDate(dispute.createdAt)}
                      {booking ? ` · booking ${booking.id}` : ""}
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
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink">
                  {dispute.description}
                </p>

                {dispute.resolutionNotes ? (
                  <div className="mt-3 rounded-md bg-surface-2 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                      Admin decision
                    </p>
                    <p className="mt-1 text-sm text-ink">
                      {dispute.resolutionNotes}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-warning">
                    Waiting for an admin to review this dispute.
                  </p>
                )}

                {booking ? (
                  <Link
                    href="/owner/bookings"
                    className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
                  >
                    Open booking
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
