"use client";

/** Cached reviews with background polling. */
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { listReviews } from "@/lib/data/reviews";
import { queryKeys } from "@/lib/queryKeys";
import type { Review } from "@/types";

export function useReviews(): Review[] {
  return useCollectionQuery(queryKeys.reviews, listReviews);
}
