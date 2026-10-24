import type { Metadata } from "next";

import CarFilters from "@/components/cars/CarFilters";
import CatalogueResults from "@/components/cars/CatalogueResults";
import { listCars } from "@/lib/data/cars";
import { parseCatalogueQuery } from "@/lib/domain/catalogue";

export const metadata: Metadata = {
  title: "Browse cars",
  description:
    "Approved cars for rent in Addis Ababa, filtered by neighbourhood, transmission and daily price.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseCatalogueQuery(params);

  return (
    <div className="shell py-8 sm:py-10">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Cars in Addis Ababa
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Every listing is approved before it appears. Only the owner&apos;s
          price, with the platform fee included.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="lg:sticky lg:top-20">
          <CarFilters query={query} />
        </aside>

        <CatalogueResults query={query} initialCars={listCars()} />
      </div>
    </div>
  );
}
