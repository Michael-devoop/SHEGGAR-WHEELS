/**
 * Catalogue search, filtering and pagination.
 *
 * Pure functions over an array of cars, so the public page can render on the
 * server from URL parameters and the rules can be tested without a browser.
 * Only approved listings are ever returned.
 */
import {
  NEIGHBOURHOODS,
  PAGE_SIZE,
  TRANSMISSIONS,
} from "@/lib/constants";
import type { Car, Transmission } from "@/types";

export const CATALOGUE_SORTS = ["newest", "price-asc", "price-desc"] as const;

export type CatalogueSort = (typeof CATALOGUE_SORTS)[number];

export interface CatalogueQuery {
  q: string;
  neighbourhood: string;
  transmission: Transmission | "";
  maxPrice: number | null;
  sort: CatalogueSort;
  page: number;
}

export interface CatalogueResult {
  cars: Car[];
  total: number;
  page: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

/** Reads a query string into a safe, fully-defaulted catalogue query. */
export function parseCatalogueQuery(params: RawParams): CatalogueQuery {
  const neighbourhood = NEIGHBOURHOODS.find(
    (entry) => entry === first(params.neighbourhood).trim(),
  );
  const transmission = TRANSMISSIONS.find(
    (entry) => entry === first(params.transmission).trim(),
  );

  const rawMax = Number(first(params.maxPrice).trim());
  const maxPrice =
    Number.isFinite(rawMax) && rawMax > 0 ? Math.floor(rawMax) : null;

  const sort =
    CATALOGUE_SORTS.find((entry) => entry === first(params.sort).trim()) ??
    "newest";

  const rawPage = Math.floor(Number(first(params.page).trim()));

  return {
    q: first(params.q).trim(),
    neighbourhood: neighbourhood ?? "",
    transmission: transmission ?? "",
    maxPrice,
    sort,
    page: Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1,
  };
}

const newestFirst = (a: Car, b: Car): number =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id);

const byPrice =
  (direction: 1 | -1) =>
  (a: Car, b: Car): number =>
    (a.pricePerDay - b.pricePerDay) * direction || newestFirst(a, b);

/** Applies every filter, sorts the matches and returns one page. */
export function searchCars(
  cars: readonly Car[],
  query: CatalogueQuery,
): CatalogueResult {
  const needle = query.q.toLowerCase();

  const matches = cars
    .filter((car) => car.status === "approved")
    .filter((car) => (query.neighbourhood ? car.neighbourhood === query.neighbourhood : true))
    .filter((car) => (query.transmission ? car.transmission === query.transmission : true))
    .filter((car) => (query.maxPrice === null ? true : car.pricePerDay <= query.maxPrice))
    .filter((car) =>
      needle
        ? [car.make, car.model, car.neighbourhood, car.description]
            .join(" ")
            .toLowerCase()
            .includes(needle)
        : true,
    );

  matches.sort(
    query.sort === "price-asc"
      ? byPrice(1)
      : query.sort === "price-desc"
        ? byPrice(-1)
        : newestFirst,
  );

  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;

  return {
    cars: matches.slice(start, start + PAGE_SIZE),
    total,
    page,
    pageCount,
    hasNext: page < pageCount,
    hasPrevious: page > 1,
  };
}
