import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import RoleGuard from "@/components/layout/RoleGuard";
import SessionMenu from "@/components/auth/SessionMenu";

const NAV = [
  { href: "/renter/dashboard", label: "Dashboard" },
  { href: "/renter/bookings", label: "My bookings" },
];

/** Renter surface. Access is enforced by `RoleGuard`. */
export default function RenterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <Navbar
        brand="Sheggar Wheels"
        brandHref="/renter/dashboard"
        items={NAV}
        actions={<SessionMenu />}
      />
      <main id="main" className="flex-1">
        <RoleGuard area="renter">{children}</RoleGuard>
      </main>
    </div>
  );
}
