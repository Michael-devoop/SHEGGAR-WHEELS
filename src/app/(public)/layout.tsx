import type { ReactNode } from "react";
import { Car, House, LogIn, UserPlus } from "lucide-react";
import GooeyNav from "@/components/layout/GooeyNav";
import Navbar from "@/components/layout/Navbar";
import SessionMenu from "@/components/auth/SessionMenu";
import { SITE_NAME } from "@/lib/seo/site";

/**
 * The mobile tab bar.
 *
 * On a phone this is the primary navigation, so the header links are hidden
 * below lg and the tab bar takes over. From lg up the header nav and the
 * footer cover the same ground and the tab bar is removed.
 */
const MOBILE_NAV = [
  { href: "/", label: "Home", icon: <House className="size-5" /> },
  { href: "/cars", label: "Cars", icon: <Car className="size-5" /> },
  { href: "/signin", label: "Sign in", icon: <LogIn className="size-5" /> },
  { href: "/signup", label: "Join", icon: <UserPlus className="size-5" /> },
];

/**
 * Public surface: browsing, authentication and marketing pages.
 *
 * `<main id="main">` lives here so the skip link has a single, stable target
 * for every route in this group.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame app-frame--bottom-nav">
      <Navbar
        hideNavBelowLg
        brand={SITE_NAME}
        items={[{ href: "/cars", label: "Browse cars" }]}
        actions={<SessionMenu />}
      />

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="mt-12 border-t border-border bg-surface">
        <div className="shell flex flex-col gap-2 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{SITE_NAME} — peer-to-peer car rental in Addis Ababa.</p>
          <p>Demo build. Data is simulated and saved in this browser.</p>
        </div>
      </footer>

      {/* Mobile bottom navigation. */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div className="border-t border-border bg-bg/95 pt-1.5 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <GooeyNav items={MOBILE_NAV} label="Sections" className="shell" />
        </div>
      </div>
    </div>
  );
}
