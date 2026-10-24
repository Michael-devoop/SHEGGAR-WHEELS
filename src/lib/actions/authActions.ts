/**
 * Sign-in, sign-up and sign-out.
 *
 * This is a demo: there are no passwords and no server. An account is the
 * email on a stored user record, and the session is a sessionStorage entry.
 * The functions still validate their input and return a `Result`, so the UI
 * has one error path and never has to catch.
 */
import { findUserByEmail, listUsers } from "@/lib/data/users";
import { newId } from "@/lib/ids";
import { userSchema } from "@/lib/schemas";
import { STORAGE_KEYS } from "@/lib/constants";
import { readSession, signIn, signOut } from "@/lib/storage/session";
import { localStore } from "@/lib/storage/storage";
import type { Result, Role, User } from "@/types";

export interface SignUpInput {
  name: string;
  email: string;
  phone: string;
  roles: Role[];
}

/** Creates an active account. Does not sign the user in. */
export function createUser(input: SignUpInput): Result<User> {
  if (findUserByEmail(input.email)) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const candidate = {
    id: newId("usr"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    roles: input.roles,
    status: "active" as const,
    createdAt: new Date().toISOString(),
  };

  const parsed = userSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  const next = [...listUsers(), parsed.data];
  if (!localStore.writeJson(STORAGE_KEYS.users, next)) {
    return {
      ok: false,
      error: "Could not save your account. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: parsed.data };
}

/** Signs in by email. Unknown and suspended accounts get the same clear error. */
export function signInWithEmail(email: string): Result<User> {
  const user = findUserByEmail(email);
  if (!user) return { ok: false, error: "No account with that email." };
  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended." };
  }

  signIn(user.id);
  if (readSession()?.userId !== user.id) {
    return {
      ok: false,
      error: "Could not start a session. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: user };
}

/** Ends the session. Safe to call when signed out. */
export function signOutAction(): void {
  signOut();
}
