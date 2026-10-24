"use client";

/**
 * Throwaway data inspector (milestone 4).
 *
 * Seeds the browser stores on first read, shows one count per collection and
 * the raw JSON of the first user. Removed in milestone 20.
 */
import { useSyncExternalStore } from "react";
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
import { ensureSeeded } from "@/lib/storage/init";
import { localStore } from "@/lib/storage/storage";

const collections = [
  { label: "Users", key: STORAGE_KEYS.users, schema: z.array(userSchema) },
  { label: "Cars", key: STORAGE_KEYS.cars, schema: z.array(carSchema) },
  { label: "Bookings", key: STORAGE_KEYS.bookings, schema: z.array(bookingSchema) },
  { label: "Reviews", key: STORAGE_KEYS.reviews, schema: z.array(reviewSchema) },
  { label: "Disputes", key: STORAGE_KEYS.disputes, schema: z.array(disputeSchema) },
  {
    label: "Announcements",
    key: STORAGE_KEYS.announcements,
    schema: z.array(announcementSchema),
  },
] as const;

interface Snapshot {
  counts: Record<string, number>;
  sample: string;
}

const EMPTY = JSON.stringify({ counts: {}, sample: "" } satisfies Snapshot);

let cached: string | null = null;

function getSnapshot(): string {
  if (cached) return cached;

  ensureSeeded();
  const counts: Record<string, number> = {};
  for (const collection of collections) {
    counts[collection.label] = localStore.readList(collection.key, {
      guard: (value) => collection.schema.safeParse(value).success,
    }).length;
  }

  cached = JSON.stringify({
    counts,
    sample: JSON.stringify(getSeeds().users[0], null, 2),
  } satisfies Snapshot);
  return cached;
}

function getServerSnapshot(): string {
  return EMPTY;
}

function subscribe(): () => void {
  return () => {};
}

export default function DevDataPage() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = snapshot !== EMPTY;
  const { counts, sample }: Snapshot = JSON.parse(snapshot);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Demo data</h1>
        <p className="text-sm text-muted-foreground">
          Development only. Seeding runs once; clearing a key restores only
          that collection on the next load.
        </p>
      </div>

      {ready ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.key} className="rounded-lg border p-4">
              <dt className="text-xs text-muted-foreground">{collection.label}</dt>
              <dd className="text-2xl font-semibold">
                {counts[collection.label]}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Seeding…</p>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Sample user</h2>
        <pre className="overflow-x-auto rounded-lg bg-surface-sunken p-4 text-xs">
          {sample}
        </pre>
      </section>
    </main>
  );
}
