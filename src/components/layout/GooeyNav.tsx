"use client";

import { usePathname } from "next/navigation";
import GooeyNavCore from "@/components/GooeyNav";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GooeyNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
}

/**
 * Mobile navigation using the exact WebGL GooeyNav component from React Bits.
 *
 * Automatically tracks the Next.js active pathname and provides client-side
 * navigation with dynamic fluid droplet animations.
 */
export default function GooeyNav({
  items,
  label = "Primary Navigation",
  className,
}: {
  items: GooeyNavItem[];
  label?: string;
  className?: string;
}) {
  const pathname = usePathname();

  // Match the active item to the URL pathname
  const pathIndex = items.findIndex((item) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  const activeIndex = pathIndex >= 0 ? pathIndex : 0;

  return (
    <nav
      aria-label={label}
      className={cn("relative flex items-center justify-center", className)}
    >
      <GooeyNavCore
        items={items}
        activeIndex={activeIndex}
        theme="dark"
        size="sm"
        color="#f59e0b"
        activeTextColor="#09090b"
        particleCount={14}
        animationTime={500}
        gooeyness={0.65}
        wobble={0.4}
        frame={true}
        className="shadow-2xl"
      />
    </nav>
  );
}
