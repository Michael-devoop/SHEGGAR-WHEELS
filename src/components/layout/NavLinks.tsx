"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Static list of nav links, without the active state.
 *
 * Used as the Suspense fallback while the pathname-aware version streams in,
 * so the header is never empty on first paint.
 */
export function NavList({
  items,
  activeHref,
}: {
  items: NavItem[];
  activeHref?: string;
}) {
  return (
    <ul role="list" className="flex items-center gap-1">
      {items.map((item) => {
        const active = activeHref === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-flex min-h-11 items-center rounded-md bg-surface px-3 text-sm font-semibold text-ink"
                  : "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Nav links with the current page marked via `aria-current`.
 *
 * `usePathname` is a client hook, so this component must sit inside a
 * Suspense boundary or the route cannot be prerendered.
 */
export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // Exact match, or a nested route ("/admin" is not active on "/admin/users").
  const activeHref = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.href;

  return <NavList items={items} activeHref={activeHref} />;
}
