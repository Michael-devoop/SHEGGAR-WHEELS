import type { Metadata } from "next";
import { Suspense } from "react";

import CarFilters from "@/components/cars/CarFilters";
import CatalogueResults from "@/components/cars/CatalogueResults";
import { listBookings } from "@/lib/data/bookings";
import { listCars } from "@/lib/data/cars";
import { parseCatalogueQuery } from "@/lib/domain/catalogue";
import { SITE_LOCALE, SITE_NAME } from "@/lib/seo/site";

const CARS_TITLE = "Browse cars";
const CARS_DESCRIPTION =
  "Approved cars for rent in Addis Ababa, filtered by trip dates, neighbourhood, transmission and daily price.";

export const metadata: Metadata = {
  title: CARS_TITLE,
  description: CARS_DESCRIPTION,
  alternates: { canonical: "/cars" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/cars",
    title: `${CARS_TITLE} | ${SITE_NAME}`,
    description: CARS_DESCRIPTION,
  },
};

type CarsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function CarsLoading() {
  return (
    <div
      className="shell py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading cars…</span>
      {/* Header skeleton */}
      <div className="h-10 w-80 animate-pulse rounded-xl bg-zinc-100" />
      <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-zinc-100" />
      {/* Grid skeleton */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        <div className="h-[500px] animate-pulse rounded-2xl bg-zinc-100" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

async function CarsContent({ searchParams }: CarsPageProps) {
  const params = await searchParams;
  const query = parseCatalogueQuery(params);

  return (
    <div className="shell py-10">
      {/* Page header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Browse cars
        </h1>
        <p className="mt-2 text-base text-zinc-500">
          Every listing is verified. One price, no hidden fees — the platform
          fee is already included.
        </p>
      </header>

      {/* Main grid: filters sidebar + results */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="lg:sticky lg:top-24">
          <CarFilters query={query} />
        </aside>

        <CatalogueResults
          query={query}
          initialCars={listCars()}
          initialBookings={listBookings()}
        />
      </div>
    </div>
  );
}

export default function Page(props: CarsPageProps) {
  return (
    <Suspense fallback={<CarsLoading />}>
      <CarsContent {...props} />
    </Suspense>
  );
}
