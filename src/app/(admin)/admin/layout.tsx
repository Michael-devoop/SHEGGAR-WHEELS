import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import SessionMenu from "@/components/auth/SessionMenu";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/reports", label: "Reports" },
];

/** Admin surface. Access is enforced by `RoleGuard`. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <Navbar
        brand="Sheggar Wheels"
        brandHref="/admin"
        items={NAV}
        actions={<SessionMenu />}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
