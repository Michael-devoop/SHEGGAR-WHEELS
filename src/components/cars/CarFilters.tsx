import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import {
  NEIGHBOURHOODS,
  TRANSMISSIONS,
} from "@/lib/constants";
import {
  CATALOGUE_SORTS,
  type CatalogueQuery,
} from "@/lib/domain/catalogue";

const SORT_LABEL: Record<(typeof CATALOGUE_SORTS)[number], string> = {
  newest: "Newest first",
  "price-asc": "Price: low → high",
  "price-desc": "Price: high → low",
};

const FIELD =
  "min-h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-200";
const LABEL = "text-xs font-semibold uppercase tracking-wider text-zinc-400";

export default function CarFilters({ query }: { query: CatalogueQuery }) {
  const active = Boolean(
    query.q ||
      query.neighbourhood ||
      query.transmission ||
      query.maxPrice ||
      query.startDate ||
      query.endDate,
  );

  return (
    <form
      action="/cars"
      method="get"
      className="grid gap-5 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-zinc-900">Filters</h2>
        </div>
        {active ? (
          <Link
            href="/cars"
            className="text-xs font-medium text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-900"
          >
            Clear all
          </Link>
        ) : null}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label htmlFor="q" className={LABEL}>
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Make, model or feature"
            className={`${FIELD} pl-9`}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="space-y-2">
            <label htmlFor="startDate" className={LABEL}>
              Pickup
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={query.startDate}
              aria-describedby="date-hint"
              className={FIELD}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="endDate" className={LABEL}>
              Return
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={query.endDate}
              min={query.startDate || undefined}
              aria-describedby="date-hint"
              className={FIELD}
            />
          </div>
        </div>
        <p id="date-hint" className="text-[11px] text-zinc-400">
          Add both dates to see only free cars.
        </p>
      </div>

      {/* Neighbourhood */}
      <div className="space-y-2">
        <label htmlFor="neighbourhood" className={LABEL}>
          Area
        </label>
        <select
          id="neighbourhood"
          name="neighbourhood"
          defaultValue={query.neighbourhood}
          className={FIELD}
        >
          <option value="">All areas</option>
          {NEIGHBOURHOODS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <label htmlFor="transmission" className={LABEL}>
          Transmission
        </label>
        <select
          id="transmission"
          name="transmission"
          defaultValue={query.transmission}
          className={FIELD}
        >
          <option value="">Any</option>
          {TRANSMISSIONS.map((type) => (
            <option key={type} value={type}>
              {type === "automatic" ? "Automatic" : "Manual"}
            </option>
          ))}
        </select>
      </div>

      {/* Max price */}
      <div className="space-y-2">
        <label htmlFor="maxPrice" className={LABEL}>
          Max price / day
        </label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          defaultValue={query.maxPrice ?? ""}
          placeholder="Any price"
          className={FIELD}
        />
      </div>

      {/* Sort */}
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <label htmlFor="sort" className={LABEL}>
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={query.sort}
          className={FIELD}
        >
          {CATALOGUE_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABEL[sort]}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 sm:col-span-2 lg:col-span-1"
      >
        Apply filters
      </button>
    </form>
  );
}
