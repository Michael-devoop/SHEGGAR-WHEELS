/**
 * Admin account actions.
 *
 * Suspension is reversible and never deletes the account, so the user's
 * bookings and reviews keep their history. An admin cannot suspend their own
 * account, which avoids an accidental lockout in the demo.
 */
import { STORAGE_KEYS } from "@/lib/constants";
import { getUserById, listUsers } from "@/lib/data/users";
import { hasRole } from "@/lib/domain/permissions";
import { readSession } from "@/lib/storage/session";
import { localStore } from "@/lib/storage/storage";
import type { Result, User, UserStatus } from "@/types";

export function setUserStatus(
  userId: string,
  status: UserStatus,
): Result<User> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage accounts." };
  }

  const admin = getUserById(session.userId);
  if (!admin || admin.status === "suspended" || !hasRole(admin, "admin")) {
    return { ok: false, error: "Only admins can manage accounts." };
  }

  if (userId === admin.id) {
    return { ok: false, error: "You cannot change your own account status." };
  }

  const users = listUsers();
  const existing = users.find((user) => user.id === userId);
  if (!existing) {
    return { ok: false, error: "That account could not be found." };
  }

  if (existing.status === status) {
    return { ok: true, data: existing };
  }

  const updated: User = { ...existing, status };
  const next = users.map((user) => (user.id === userId ? updated : user));

  if (!localStore.writeJson(STORAGE_KEYS.users, next)) {
    return {
      ok: false,
      error: "Could not save the account. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: updated };
}
