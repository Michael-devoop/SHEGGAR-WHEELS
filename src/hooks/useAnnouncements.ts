"use client";

/** Cached announcements with background polling, newest first. */
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { listAnnouncements } from "@/lib/data/announcements";
import { queryKeys } from "@/lib/queryKeys";
import type { Announcement } from "@/types";

export function useAnnouncements(): Announcement[] {
  return useCollectionQuery(queryKeys.announcements, listAnnouncements);
}
