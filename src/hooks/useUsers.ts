"use client";

/**
 * Cached users with background polling.
 *
 * Only admin screens read this hook; public pages resolve one user at a time
 * through `getUserById`.
 */
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { listUsers } from "@/lib/data/users";
import { queryKeys } from "@/lib/queryKeys";
import type { User } from "@/types";

export function useUsers(): User[] {
  return useCollectionQuery(queryKeys.users, listUsers);
}
