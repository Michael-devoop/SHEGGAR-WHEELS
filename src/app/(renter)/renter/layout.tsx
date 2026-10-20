import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";

const NAV = [
  { href: "/renter/dashboard", label: "Dashboard" },
  { href: "/renter/bookings", label: "My bookings" },
];

/** Renter surface. Access rules are enforced in the auth phase. */
export default function RenterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <Navbar brand="Sheggar Wheels" brandHref="/renter/dashboard" items={NAV} />
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
