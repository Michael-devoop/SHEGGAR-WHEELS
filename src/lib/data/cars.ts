/**
 * Car reads.
 *
 * Seeded cars until the browser store holds a collection; stored cars win
 * from then on. Newest listing first, so catalogue and dashboards need no
 * extra sorting.
 */
import { z } from "zod";

import { seedCars } from "@/data/seed";
import { STORAGE_KEYS } from "@/lib/constants";
import { findCarBySlug } from "@/lib/domain/carSlug";
import { carSchema } from "@/lib/schemas";
import { localStore } from "@/lib/storage/storage";
import type { Car, CarStatus } from "@/types";

const carsGuard = (value: unknown): boolean =>
  z.array(carSchema).safeParse(value).success;

const newestFirst = (a: Car, b: Car): number =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
  a.id.localeCompare(b.id);

/** Every car, newest listing first. */
export function listCars(): Car[] {
  const stored = localStore.readJson<Car[] | null>(STORAGE_KEYS.cars, null, {
    guard: carsGuard,
  });

  return [...(stored ?? seedCars)].sort(newestFirst);
}

/** The car with this id, or null when there is no such car. */
export function getCarById(id: string): Car | null {
  return listCars().find((car) => car.id === id) ?? null;
}

/** The car at a public slug, with the old id form still accepted. */
export function getCarBySlug(slug: string): Car | null {
  return findCarBySlug(listCars(), slug);
}

/** The cars a given owner has listed, newest first. */
export function listCarsByOwner(ownerId: string): Car[] {
  return listCars().filter((car) => car.ownerId === ownerId);
}

/** Cars in one moderation state, newest first. */
export function listCarsByStatus(status: CarStatus): Car[] {
  return listCars().filter((car) => car.status === status);
}
