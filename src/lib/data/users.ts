/**
 * User reads.
 *
 * The seed dataset is the source of truth until the browser store is seeded
 * (see `src/lib/storage/init.ts`); after that the stored collection wins, so
 * accounts created on the sign-up screen are visible everywhere.
 */
import { z } from "zod";

import { seedUsers } from "@/data/seed";
import { STORAGE_KEYS } from "@/lib/constants";
import { userSchema } from "@/lib/schemas";
import { localStore } from "@/lib/storage/storage";
import type { User } from "@/types";

const usersGuard = (value: unknown): boolean =>
  z.array(userSchema).safeParse(value).success;

/** Every user, seeded or created in this browser. */
export function listUsers(): User[] {
  return (
    localStore.readJson<User[] | null>(STORAGE_KEYS.users, null, {
      guard: usersGuard,
    }) ?? seedUsers
  );
}

/** The user with this id, or null when there is no such user. */
export function getUserById(id: string): User | null {
  return listUsers().find((user) => user.id === id) ?? null;
}

/** Case-insensitive lookup used by sign-in and the duplicate-email check. */
export function findUserByEmail(email: string): User | null {
  const needle = email.trim().toLowerCase();
  if (!needle) return null;
  return listUsers().find((user) => user.email.toLowerCase() === needle) ?? null;
}
