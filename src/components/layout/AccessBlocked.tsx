import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";

/**
 * The screen shown when a signed-in account cannot enter a surface.
 *
 * It always offers a way out — the account's own home, or a sign-out — so a
 * wrong-role or suspended account is never stuck on a blank page.
 */
export default function AccessBlocked({
  title = "You cannot open this page",
  message,
  homeHref = "/",
  homeLabel = "Back to home",
  showSignOut = true,
}: {
  title?: string;
  message: string;
  homeHref?: string;
  homeLabel?: string;
  showSignOut?: boolean;
}) {
  return (
    <div className="shell py-10 sm:py-14">
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Access blocked
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{message}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={homeHref}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            {homeLabel}
          </Link>
          {showSignOut ? <SignOutButton /> : null}
        </div>
      </div>
    </div>
  );
}
