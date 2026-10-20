/**
 * User reads.
 *
 * The seed dataset is the source of truth until the browser store is seeded
 * (see `src/lib/storage/init.ts`).
 */
import { seedUsers } from "@/data/seed";
import type { User } from "@/types";

export function listUsers(): User[] {
  return seedUsers;
}

/** The user with this id, or null when there is no such user. */
export function getUserById(id: string): User | null {
  return seedUsers.find((user) => user.id === id) ?? null;
}
