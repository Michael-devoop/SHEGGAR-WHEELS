"use client";

import { useState } from "react";
import Image from "next/image";

import CarStatusBadge from "@/components/cars/CarStatusBadge";
import { useCars } from "@/hooks/useCars";
import { moderateCar } from "@/lib/actions/carActions";
import { getUserById } from "@/lib/data/users";
import { formatDate, formatETB } from "@/lib/format";
import type { Car } from "@/types";

function ListingRow({
  car,
  error,
  onDecision,
}: {
  car: Car;
  error: string | null;
  onDecision: (id: string, decision: "approve" | "reject") => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const owner = getUserById(car.ownerId);
  const reviewable = car.status === "pending" || car.status === "rejected";

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface-2">
          <Image
            src={car.photos[0]}
            alt={`${car.make} ${car.model}`}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">
              {car.make} {car.model}{" "}
              <span className="font-normal text-ink-muted">{car.year}</span>
            </h3>
            <CarStatusBadge status={car.status} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {owner?.name ?? "Unknown owner"} · {car.neighbourhood}, {car.city} ·{" "}
            {formatETB(car.pricePerDay)} / day
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Listed {formatDate(car.createdAt)} · {car.seats} seats ·{" "}
            {car.transmission}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{car.description}</p>

          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {reviewable ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              {confirming ? (
                <>
                  <p className="self-center text-sm text-ink">
                    Reject this listing?
                  </p>
                  <button
                    type="button"
                    onClick={() => onDecision(car.id, "reject")}
                    className="inline-flex min-h-11 items-center rounded-md bg-danger-solid px-4 text-sm font-semibold text-danger-solid-text transition-opacity hover:opacity-90"
                  >
                    Yes, reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                  >
                    Keep
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onDecision(car.id, "approve")}
                    className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function AdminListings() {
  const cars = useCars();
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );

  const queue = cars.filter(
    (car) => car.status === "pending" || car.status === "rejected",
  );
  const decided = cars.filter(
    (car) => car.status !== "pending" && car.status !== "rejected",
  );

  function handleDecision(id: string, decision: "approve" | "reject") {
    setError(null);
    const result = moderateCar(id, decision);
    if (!result.ok) setError({ id, message: result.error });
  }

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Listing moderation
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Approve listings before they reach the catalogue, or reject the ones
          that are not ready.
        </p>
      </header>

      <section aria-labelledby="queue" className="mt-6">
        <h2
          id="queue"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          Waiting for review ({queue.length})
        </h2>
        {queue.length === 0 ? (
          <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
            Nothing is waiting. New submissions appear here.
          </p>
        ) : (
          <ul role="list" className="mt-3 grid gap-3">
            {queue.map((car) => (
              <ListingRow
                key={car.id}
                car={car}
                error={error?.id === car.id ? error.message : null}
                onDecision={handleDecision}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="decided" className="mt-8">
        <h2
          id="decided"
          className="text-sm font-bold uppercase tracking-widest text-ink-muted"
        >
          Listings ({decided.length})
        </h2>
        <ul role="list" className="mt-3 grid gap-3">
          {decided.map((car) => (
            <ListingRow
              key={car.id}
              car={car}
              error={error?.id === car.id ? error.message : null}
              onDecision={handleDecision}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
