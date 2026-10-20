import Link from "next/link";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import { SITE_NAME } from "@/lib/seo/site";

/**
 * Public surface: browsing, authentication and marketing pages.
 *
 * `<main id="main">` lives here so the skip link has a single, stable target
 * for every route in this group.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <Navbar
        brand={SITE_NAME}
        items={[{ href: "/cars", label: "Browse cars" }]}
        actions={
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
        }
      />

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="mt-12 border-t border-border bg-surface">
        <div className="shell flex flex-col gap-2 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{SITE_NAME} — peer-to-peer car rental in Addis Ababa.</p>
          <p>Demo build. Data is simulated and resets on refresh.</p>
        </div>
      </footer>
    </div>
  );
}
