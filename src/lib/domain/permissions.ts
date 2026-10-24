/**
 * Role and status rules.
 *
 * Pure functions: every route guard, navigation item and server action can
 * ask the same questions and get the same answer. A user may hold more than
 * one role, so access is a membership test, never equality.
 */
import type { Role, User } from "@/types";

type WithRoles = Pick<User, "roles">;
type WithAccess = Pick<User, "roles" | "status">;

/** The account is active. Suspended accounts keep their data but lose access. */
export function isActive(user: Pick<User, "status"> | null): boolean {
  return user?.status === "active";
}

/** The account holds this role. A signed-out visitor holds no roles. */
export function hasRole(user: WithRoles | null, role: Role): boolean {
  return user?.roles.includes(role) ?? false;
}

/** The account may enter this surface: active and holding the area's role. */
export function canAccessArea(
  user: WithAccess | null,
  area: Role,
): boolean {
  return isActive(user) && hasRole(user, area);
}

/**
 * The surface to land on after sign-in.
 *
 * Admin first, then owner, then renter: the narrowest surface a user can
 * reach is the safest default, and an admin still has their own dashboard.
 */
export function homeForUser(user: WithRoles | null): string {
  if (hasRole(user, "admin")) return "/admin";
  if (hasRole(user, "owner")) return "/owner";
  if (hasRole(user, "renter")) return "/renter/dashboard";
  return "/signin";
}
