import Link from "next/link";

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
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

const FIELD =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";
const LABEL = "text-sm font-medium text-ink";

/**
 * Catalogue filters as a plain GET form.
 *
 * The form works without JavaScript and keeps the active search in the URL,
 * so a filtered view can be linked to and refreshed. The page does the
 * filtering on the server.
 */
export default function CarFilters({ query }: { query: CatalogueQuery }) {
  const active = Boolean(
    query.q || query.neighbourhood || query.transmission || query.maxPrice,
  );

  return (
    <form
      action="/cars"
      method="get"
      className="grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-1"
    >
      <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted">
          Filter cars
        </h2>
        {active ? (
          <Link
            href="/cars"
            className="text-sm font-medium text-ink underline underline-offset-4"
          >
            Clear
          </Link>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="q" className={LABEL}>
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query.q}
          placeholder="Make, model or feature"
          className={FIELD}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="neighbourhood" className={LABEL}>
          Neighbourhood
        </label>
        <select
          id="neighbourhood"
          name="neighbourhood"
          defaultValue={query.neighbourhood}
          className={FIELD}
        >
          <option value="">All neighbourhoods</option>
          {NEIGHBOURHOODS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="transmission" className={LABEL}>
          Transmission
        </label>
        <select
          id="transmission"
          name="transmission"
          defaultValue={query.transmission}
          className={FIELD}
        >
          <option value="">Any transmission</option>
          {TRANSMISSIONS.map((type) => (
            <option key={type} value={type}>
              {type === "automatic" ? "Automatic" : "Manual"}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="maxPrice" className={LABEL}>
          Max price per day (ETB)
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

      <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
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

      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 sm:col-span-2 lg:col-span-1"
      >
        Apply filters
      </button>
    </form>
  );
}
