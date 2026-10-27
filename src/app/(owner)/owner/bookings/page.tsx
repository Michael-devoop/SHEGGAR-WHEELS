import type { Metadata } from "next";

import OwnerBookingRequests from "@/components/bookings/OwnerBookingRequests";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Booking requests",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="owner">
      <div className="shell py-8 sm:py-10">
        <OwnerBookingRequests />
      </div>
    </RoleGuard>
  );
}
