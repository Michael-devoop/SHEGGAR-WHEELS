import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import RoleGuard from "@/components/layout/RoleGuard";
import SessionMenu from "@/components/auth/SessionMenu";

const NAV = [
  { href: "/owner", label: "Overview" },
  { href: "/owner/bookings", label: "Bookings" },
  { href: "/owner/cars", label: "My cars" },
  { href: "/owner/earnings", label: "Earnings" },
  { href: "/owner/reviews", label: "Reviews" },
  { href: "/owner/disputes", label: "Disputes" },
];

/** Owner surface. Access is enforced by `RoleGuard`. */
export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <Navbar
        brand="Sheggar Wheels"
        brandHref="/owner"
        items={NAV}
        actions={<SessionMenu />}
      />
      <main id="main" className="flex-1">
        <RoleGuard area="owner">{children}</RoleGuard>
      </main>
    </div>
  );
}
