/**
 * Car reads.
 *
 * The seed dataset is the source of truth until the browser store is seeded
 * (see `src/lib/storage/init.ts`). The accessor shape stays the same either
 * way, so callers do not change when the store takes over.
 */
import { seedCars } from "@/data/seed";
import type { Car } from "@/types";

/** Every car, newest listing first. */
export function listCars(): Car[] {
  return [...seedCars].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

/** The car with this id, or null when there is no such car. */
export function getCarById(id: string): Car | null {
  return seedCars.find((car) => car.id === id) ?? null;
}

/** The cars a given owner has listed. */
export function listCarsByOwner(ownerId: string): Car[] {
  return seedCars.filter((car) => car.ownerId === ownerId);
}
