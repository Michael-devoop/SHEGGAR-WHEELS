import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import CheckoutForm from "@/components/bookings/CheckoutForm";
import RoleGuard from "@/components/layout/RoleGuard";
import { getCarById } from "@/lib/data/cars";
import { parseCatalogueDateRange } from "@/lib/domain/catalogue";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Request a booking",
  robots: { index: false, follow: false },
};

function CheckoutLoading() {
  return (
    <div
      className="shell py-8 sm:py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading checkout…</span>
      <div className="h-9 w-56 animate-pulse rounded-md bg-surface-2" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-96 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-64 animate-pulse rounded-lg bg-surface-2" />
      </div>
    </div>
  );
}

async function CheckoutContent({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const raw = params.carId;
  const carId = Array.isArray(raw) ? raw[0] : raw;
  const car = carId ? getCarById(carId) : null;
  const dates = parseCatalogueDateRange(params);

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
      <CheckoutForm
        car={car}
        initialStartDate={dates.startDate}
        initialEndDate={dates.endDate}
      />
    </div>
  );
}

export default function Page(props: CheckoutPageProps) {
  return (
    <RoleGuard area="renter">
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
