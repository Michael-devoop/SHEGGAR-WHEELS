"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { activeNavHref, type NavItem } from "@/lib/nav";

export type { NavItem } from "@/lib/nav";

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
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-flex min-h-11 items-center rounded-md border border-border bg-surface-muted px-3 text-sm font-semibold text-ink"
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

  // Longest match wins ("/admin" is not active on "/admin/users").
  const activeHref = activeNavHref(items, pathname);

  // Keep the current page visible in the horizontally scrolling mobile nav.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const link = document.querySelector<HTMLAnchorElement>(
        'header nav a[aria-current="page"]',
      );
      const scroller = link?.closest("nav");
      if (!link || !scroller) return;

      const linkRect = link.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const target =
        scroller.scrollLeft +
        linkRect.left -
        scrollerRect.left -
        (scroller.clientWidth - linkRect.width) / 2;

      scroller.scrollTo({ left: Math.max(0, target), behavior: "auto" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return <NavList items={items} activeHref={activeHref} />;
}
