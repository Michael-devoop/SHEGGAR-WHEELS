"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

import CarCard from "@/components/cars/CarCard";
import { PAGE_SIZE, STORAGE_KEYS } from "@/lib/constants";
import { listBookings } from "@/lib/data/bookings";
import { listCars } from "@/lib/data/cars";
import {
  averageRatingForCar,
  listReviewsForCar,
} from "@/lib/data/reviews";
import {
  hasCatalogueDateRange,
  searchCars,
  type CatalogueQuery,
} from "@/lib/domain/catalogue";
import { formatDate } from "@/lib/format";
import { localStore } from "@/lib/storage/storage";
import type { Booking, Car } from "@/types";

const subscribeCars = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.cars, () => onChange());

const subscribeBookings = (onChange: () => void): (() => void) =>
  localStore.subscribe(STORAGE_KEYS.bookings, () => onChange());

const getCarsSnapshot = (): string => JSON.stringify(listCars());

const getBookingsSnapshot = (): string => JSON.stringify(listBookings());

function catalogueHref(query: CatalogueQuery, page: number): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.neighbourhood) params.set("neighbourhood", query.neighbourhood);
  if (query.transmission) params.set("transmission", query.transmission);
  if (query.maxPrice !== null) params.set("maxPrice", String(query.maxPrice));
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));

  const search = params.toString();
  return search ? `/cars?${search}` : "/cars";
}

function carHref(car: Car, query: CatalogueQuery): string {
  if (!hasCatalogueDateRange(query)) return `/cars/${car.id}`;

  const params = new URLSearchParams({
    startDate: query.startDate,
    endDate: query.endDate,
  });
  return `/cars/${car.id}?${params.toString()}`;
}

/**
 * Catalogue results.
 *
 * The server renders the seeded approved cars for search engines. After
 * hydration the same component reads the browser store, so a listing that an
 * owner created and an admin approved appears without a rebuild.
 */
export default function CatalogueResults({
  query,
  initialCars,
  initialBookings,
}: {
  query: CatalogueQuery;
  initialCars: Car[];
  initialBookings: Booking[];
}) {
  const carsRaw = useSyncExternalStore(
    subscribeCars,
    getCarsSnapshot,
    () => JSON.stringify(initialCars),
  );
  const bookingsRaw = useSyncExternalStore(
    subscribeBookings,
    getBookingsSnapshot,
    () => JSON.stringify(initialBookings),
  );
  const cars = JSON.parse(carsRaw) as Car[];
  const bookings = JSON.parse(bookingsRaw) as Booking[];
  const result = searchCars(cars, query, bookings);
  const datesActive = hasCatalogueDateRange(query);

  const firstOnPage = result.total === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
  const lastOnPage = (result.page - 1) * PAGE_SIZE + result.cars.length;

  return (
    <section aria-labelledby="results">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="results" className="text-xl font-bold tracking-tight text-zinc-900">
          {result.total === 0
            ? "No cars match"
            : datesActive
              ? `${result.total} car${result.total === 1 ? "" : "s"} free for your dates`
              : `${result.total} car${result.total === 1 ? "" : "s"} available`}
        </h2>
        {result.total > 0 ? (
          <p className="text-sm text-zinc-400" aria-live="polite">
            Showing {firstOnPage}–{lastOnPage} of {result.total}
          </p>
        ) : null}
      </div>

      {datesActive ? (
        <p className="mt-1 text-sm text-ink-muted">
          Free from {formatDate(query.startDate)} to {formatDate(query.endDate)}
        </p>
      ) : null}

      {result.cars.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-zinc-900">No cars found</p>
          <p className="mt-1 text-sm text-zinc-500">
            {datesActive
              ? "Try different dates, a wider price range or another neighbourhood."
              : "Try a wider price range or another neighbourhood."}
          </p>
          <Link
            href="/cars"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <ul role="list" className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {result.cars.map((car) => {
            const reviews = listReviewsForCar(car.id);
            return (
              <li key={car.id}>
                <CarCard
                  car={car}
                  rating={averageRatingForCar(car.id)}
                  reviewCount={reviews.length}
                  href={carHref(car, query)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {result.pageCount > 1 ? (
        <nav
          aria-label="Catalogue pages"
          className="mt-8 flex items-center justify-center gap-1 border-t border-border pt-6"
        >
          {/* Previous */}
          {result.hasPrevious ? (
            <Link
              href={catalogueHref(query, result.page - 1)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              aria-label="Previous page"
            >
              ←
            </Link>
          ) : (
            <span className="inline-flex size-10 items-center justify-center rounded-lg text-sm text-ink-muted/40">
              ←
            </span>
          )}

          {/* Page numbers */}
          {Array.from({ length: result.pageCount }, (_, i) => i + 1)
            .filter((p) => {
              if (p === 1 || p === result.pageCount) return true;
              if (Math.abs(p - result.page) <= 1) return true;
              return false;
            })
            .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                acc.push("ellipsis");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex size-10 items-center justify-center text-sm text-ink-muted"
                >
                  …
                </span>
              ) : (
                <Link
                  key={item}
                  href={catalogueHref(query, item)}
                  aria-current={item === result.page ? "page" : undefined}
                  className={`inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    item === result.page
                      ? "bg-zinc-900 text-white"
                      : "border border-border text-ink hover:bg-surface-2"
                  }`}
                >
                  {item}
                </Link>
              )
            )}

          {/* Next */}
          {result.hasNext ? (
            <Link
              href={catalogueHref(query, result.page + 1)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              aria-label="Next page"
            >
              →
            </Link>
          ) : (
            <span className="inline-flex size-10 items-center justify-center rounded-lg text-sm text-ink-muted/40">
              →
            </span>
          )}
        </nav>
      ) : null}
    </section>
  );
}
