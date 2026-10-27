"use client";

/** Cached disputes with background polling. */
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { listDisputes } from "@/lib/data/disputes";
import { queryKeys } from "@/lib/queryKeys";
import type { Dispute } from "@/types";

export function useDisputes(): Dispute[] {
  return useCollectionQuery(queryKeys.disputes, listDisputes);
}
