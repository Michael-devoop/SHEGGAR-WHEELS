"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import AccessBlocked from "@/components/layout/AccessBlocked";
import { useCurrentUser } from "@/hooks/useSession";
import { hasRole, homeForUser, isActive } from "@/lib/domain/permissions";
import type { Role } from "@/types";

/**
 * Client-side gate for a protected route group.
 *
 * The demo has no server session, so the check runs in the browser. Signed-out
 * visitors are redirected to sign-in with a `next` path; signed-in users who
 * lack the role, or are suspended, get an explanation instead of a redirect
 * loop.
 */
export default function RoleGuard({
  area,
  children,
}: {
  area: Role;
  children: ReactNode;
}) {
  const { session, user, hydrated } = useCurrentUser();
  const router = useRouter();

  const signedOut = hydrated && !session;

  useEffect(() => {
    if (!signedOut) return;
    const current = `${window.location.pathname}${window.location.search}`;
    router.replace(`/signin?next=${encodeURIComponent(current)}`);
  }, [signedOut, router]);

  if (!hydrated) {
    return (
      <p role="status" className="shell py-10 text-sm text-ink-muted">
        Checking your session…
      </p>
    );
  }

  if (!session) {
    return (
      <p role="status" className="shell py-10 text-sm text-ink-muted">
        Redirecting to sign in…
      </p>
    );
  }

  if (!user) {
    return (
      <AccessBlocked
        title="Account not found"
        message="Your session points to an account that no longer exists. Sign out and sign in again."
      />
    );
  }

  if (!isActive(user)) {
    return (
      <AccessBlocked
        title="Account suspended"
        message="This account has been suspended, so the workspace is unavailable. Contact an administrator if you think this is a mistake."
      />
    );
  }

  if (!hasRole(user, area)) {
    return (
      <AccessBlocked
        title="Wrong account for this area"
        message={`You are signed in as ${user.name}, which does not have the ${area} role.`}
        homeHref={homeForUser(user)}
        homeLabel="Go to my dashboard"
      />
    );
  }

  return <>{children}</>;
}
