import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import NavLinks, { NavList, type NavItem } from "./NavLinks";

/**
 * Top navigation used by every route group.
 *
 * Server component. The active-page marker needs the pathname, which is a
 * client value, so the links stream in behind a Suspense boundary while a
 * static list holds the space.
 */
export default function Navbar({
  items,
  actions,
  brandHref = "/",
  brand = "Sheggar Wheels",
}: {
  items: NavItem[];
  actions?: ReactNode;
  brandHref?: string;
  brand?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className="shell flex flex-wrap items-center gap-x-3 py-1">
        <Link
          href={brandHref}
          className="order-1 flex min-h-11 shrink-0 items-center gap-2 text-base font-bold tracking-tight text-ink"
        >
          <span aria-hidden="true" className="size-2.5 rounded-pill bg-accent" />
          {brand}
        </Link>

        {/* On phones the nav wraps onto its own scrollable row so the brand
            and account actions never squeeze it out of view. */}
        <nav
          aria-label="Main"
          className="order-3 w-full overflow-x-auto lg:order-2 lg:w-auto lg:flex-1"
        >
          <Suspense fallback={<NavList items={items} />}>
            <NavLinks items={items} />
          </Suspense>
        </nav>

        {actions ? (
          <div className="order-2 ml-auto flex shrink-0 items-center gap-2 lg:order-3">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
