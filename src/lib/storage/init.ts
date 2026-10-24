/**
 * First-run seeding and demo reset.
 *
 * `ensureSeeded` is additive: it writes a collection only when the key is
 * absent or unreadable, so edits made in the demo survive a reload. Clearing
 * one key restores that one collection and leaves the rest alone.
 *
 * `resetDemoData` is the explicit overwrite used by the admin reset control.
 *
 * Both are safe to call from a client effect and harmless on the server
 * (writes are refused there by the store client).
 */
import { z } from "zod";

import { getSeeds } from "@/data/seed";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  announcementSchema,
  bookingSchema,
  carSchema,
  disputeSchema,
  reviewSchema,
  userSchema,
} from "@/lib/schemas";
import { localStore, type StoreClient } from "./storage";

interface Collection<T> {
  key: string;
  seed: T[];
  schema: z.ZodType<T[]>;
}

function collections(): Collection<unknown>[] {
  const seeds = getSeeds();
  return [
    { key: STORAGE_KEYS.users, seed: seeds.users, schema: z.array(userSchema) },
    { key: STORAGE_KEYS.cars, seed: seeds.cars, schema: z.array(carSchema) },
    {
      key: STORAGE_KEYS.bookings,
      seed: seeds.bookings,
      schema: z.array(bookingSchema),
    },
    {
      key: STORAGE_KEYS.reviews,
      seed: seeds.reviews,
      schema: z.array(reviewSchema),
    },
    {
      key: STORAGE_KEYS.disputes,
      seed: seeds.disputes,
      schema: z.array(disputeSchema),
    },
    {
      key: STORAGE_KEYS.announcements,
      seed: seeds.announcements,
      schema: z.array(announcementSchema),
    },
  ];
}

/** Writes every collection that is missing or fails validation. */
export function ensureSeeded(store: StoreClient = localStore): void {
  for (const collection of collections()) {
    const existing = store.readJson<unknown[] | null>(collection.key, null, {
      guard: (value) => collection.schema.safeParse(value).success,
    });
    if (existing === null) store.writeJson(collection.key, collection.seed);
  }
}

/** Restores the demo dataset exactly as shipped. */
export function resetDemoData(store: StoreClient = localStore): void {
  for (const collection of collections()) {
    store.writeJson(collection.key, collection.seed);
  }
}
