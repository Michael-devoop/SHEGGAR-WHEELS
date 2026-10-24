import type { Metadata } from "next";
import Link from "next/link";

import CheckoutForm from "@/components/bookings/CheckoutForm";
import { getCarById } from "@/lib/data/cars";

export const metadata: Metadata = {
  title: "Request a booking",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.carId;
  const carId = Array.isArray(raw) ? raw[0] : raw;
  const car = carId ? getCarById(carId) : null;

  if (!car) {
    return (
      <div className="shell py-10">
        <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Car not found
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            This listing does not exist. It may have been removed by its owner.
          </p>
          <Link
            href="/cars"
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Browse cars
          </Link>
        </div>
      </div>
    );
  }

  if (car.status !== "approved") {
    return (
      <div className="shell py-10">
        <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Not open for booking
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            This car is not accepting requests right now. Approved listings are
            the only ones you can book.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/cars"
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Browse cars
            </Link>
            <Link
              href={`/cars/${car.id}`}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              View the listing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-8 sm:py-10">
      <CheckoutForm car={car} />
    </div>
  );
}
