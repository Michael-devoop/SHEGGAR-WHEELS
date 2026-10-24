"use client";

import Link from "next/link";

import CarForm from "@/components/cars/CarForm";
import CarStatusBadge from "@/components/cars/CarStatusBadge";
import AccessBlocked from "@/components/layout/AccessBlocked";
import { useCurrentUser } from "@/hooks/useSession";
import { useCars } from "@/hooks/useCars";

/**
 * Resolves the car from the browser store, so a listing created in this
 * browser can be edited before the seeded catalogue knows about it.
 */
export default function CarEditor({ carId }: { carId: string }) {
  const { user, hydrated } = useCurrentUser();
  const cars = useCars();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading this listing…
      </p>
    );
  }

  const car = cars.find((entry) => entry.id === carId);
  if (!car) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Listing not found
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          This car does not exist in this browser.
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

  if (!user || car.ownerId !== user.id) {
    return (
      <AccessBlocked
        title="This listing belongs to someone else"
        message="You can only edit cars that you have listed."
        homeHref="/owner/cars"
        homeLabel="My cars"
      />
    );
  }

  return (
    <div>
      <Link
        href="/owner/cars"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> My cars
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Edit {car.make} {car.model}
        </h1>
        <CarStatusBadge status={car.status} />
      </div>

      <div className="mt-6">
        <CarForm car={car} />
      </div>
    </div>
  );
}
