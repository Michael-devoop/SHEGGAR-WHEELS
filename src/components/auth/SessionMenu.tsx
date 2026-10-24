"use client";

import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";
import { useCurrentUser } from "@/hooks/useSession";
import { homeForUser } from "@/lib/domain/permissions";

const signedOutActions = (
  <>
    <Link
      href="/signin"
      className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
    >
      Sign in
    </Link>
    <Link
      href="/signup"
      className="inline-flex min-h-11 items-center rounded-md bg-primary px-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
    >
      Join free
    </Link>
  </>
);

export default function SessionMenu() {
  const { session, user, hydrated } = useCurrentUser();

  if (!hydrated || !session) return <>{signedOutActions}</>;

  return (
    <>
      <Link
        href={homeForUser(user)}
        className="inline-flex min-h-11 max-w-40 items-center truncate rounded-md px-3 text-sm font-medium text-ink transition-colors hover:bg-surface"
      >
        {user?.name ?? "Dashboard"}
      </Link>
      <SignOutButton />
    </>
  );
}
