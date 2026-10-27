/**
 * Public car URLs.
 *
 * Listings are addressed by a readable slug instead of the storage id, so
 * `/cars/toyota-corolla-2019-bole` is the canonical link. The old id form
 * still resolves for links shared before the change.
 */
import type { Car } from "@/types";

type CarName = Pick<
  Car,
  "id" | "make" | "model" | "year" | "neighbourhood" | "slug"
>;

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nameSlug(car: CarName): string {
  const name = [car.make, car.model]
    .map(slugify)
    .filter(Boolean)
    .join("-");

  if (!name) return car.id;

  return [name, String(car.year), car.neighbourhood]
    .map(slugify)
    .filter(Boolean)
    .join("-");
}

export function carSlug(car: CarName): string {
  return car.slug ?? nameSlug(car);
}

/**
 * A readable slug that cannot shadow another listing.
 *
 * The name alone can repeat (same model, year and neighbourhood), so the
 * second listing gets a numeric suffix and stores it on the car.
 */
export function uniqueCarSlug(
  car: CarName,
  cars: readonly CarName[],
): string {
  // An assigned slug is authoritative so edits never break shared links.
  const base = car.slug ?? nameSlug(car);
  const taken = new Set(
    cars
      .filter((other) => other.id !== car.id)
      .map((other) => carSlug(other)),
  );

  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function carPath(car: CarName): string {
  return `/cars/${carSlug(car)}`;
}

export function findCarBySlug(
  cars: readonly Car[],
  value: string,
): Car | null {
  const normalized = value.trim().toLowerCase();

  return (
    cars.find((car) => carSlug(car) === normalized) ??
    cars.find((car) => car.id === normalized) ??
    null
  );
}
