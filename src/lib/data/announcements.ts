/**
 * Announcement reads.
 *
 * The admin surface is the only writer; the public banner reads the active
 * rows. Seed announcements are the fallback until the browser store is seeded.
 */
import { z } from "zod";

import { seedAnnouncements } from "@/data/seed";
import { STORAGE_KEYS } from "@/lib/constants";
import { announcementSchema } from "@/lib/schemas";
import { localStore } from "@/lib/storage/storage";
import type { Announcement } from "@/types";

const announcementsGuard = (value: unknown): boolean =>
  z.array(announcementSchema).safeParse(value).success;

/** Every announcement, newest first. */
export function listAnnouncements(): Announcement[] {
  const stored = localStore.readJson<Announcement[] | null>(
    STORAGE_KEYS.announcements,
    null,
    { guard: announcementsGuard },
  );
  return [...(stored ?? seedAnnouncements)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/** Active announcements for the public banner. */
export function listActiveAnnouncements(): Announcement[] {
  return listAnnouncements().filter((announcement) => announcement.active);
}
