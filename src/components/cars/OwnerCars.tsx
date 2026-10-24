"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import CarStatusBadge from "@/components/cars/CarStatusBadge";
import { useCurrentUser } from "@/hooks/useSession";
import { useCars } from "@/hooks/useCars";
import { setCarPublished } from "@/lib/actions/carActions";
import { formatETB } from "@/lib/format";

export default function OwnerCars() {
  const { user, hydrated } = useCurrentUser();
  const cars = useCars();
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );

  const mine = user ? cars.filter((car) => car.ownerId === user.id) : [];

  function togglePublished(id: string, published: boolean) {
    setError(null);
    const result = setCarPublished(id, published);
    if (!result.ok) setError({ id, message: result.error });
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            My cars
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            List a car, keep its details current, and pause it when it is off
            the road.
          </p>
        </div>
        <Link
          href="/owner/cars/new"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          List a car
        </Link>
      </header>

      {!hydrated ? (
        <p role="status" className="mt-6 text-sm text-ink-muted">
          Loading your cars…
        </p>
      ) : mine.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <p className="font-semibold text-ink">No cars listed yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            A new listing is reviewed by an admin before it appears in the
            catalogue.
          </p>
          <Link
            href="/owner/cars/new"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            List your first car
          </Link>
        </div>
      ) : (
        <ul role="list" className="mt-6 grid gap-3">
          {mine.map((car) => (
            <li
              key={car.id}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start gap-4">
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

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-ink">
                      {car.make} {car.model}{" "}
                      <span className="font-normal text-ink-muted">
                        {car.year}
                      </span>
                    </h2>
                    <CarStatusBadge status={car.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {car.neighbourhood}, {car.city} ·{" "}
                    {formatETB(car.pricePerDay)} / day
                  </p>
                  {car.status === "pending" ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      Waiting for admin review.
                    </p>
                  ) : null}
                  {car.status === "rejected" ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      Edit the details and save to resubmit it.
                    </p>
                  ) : null}

                  {error?.id === car.id ? (
                    <p role="alert" className="mt-2 text-sm text-danger">
                      {error.message}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Link
                      href={`/owner/cars/${car.id}/edit`}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/owner/cars/${car.id}/bookings`}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
                    >
                      Bookings
                    </Link>
                    {car.status === "approved" || car.status === "inactive" ? (
                      <button
                        type="button"
                        onClick={() =>
                          togglePublished(car.id, car.status === "inactive")
                        }
                        className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                      >
                        {car.status === "inactive"
                          ? "Publish again"
                          : "Pause listing"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
