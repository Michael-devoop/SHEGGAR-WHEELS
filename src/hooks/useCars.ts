"use client";

/**
 * Cached cars with background polling.
 *
 * Owner and admin screens read through this hook; the public catalogue keeps
 * its server-seeded snapshot plus direct storage subscription.
 */
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { listCars } from "@/lib/data/cars";
import { queryKeys } from "@/lib/queryKeys";
import type { Car } from "@/types";

export function useCars(): Car[] {
  return useCollectionQuery(queryKeys.cars, listCars);
}
