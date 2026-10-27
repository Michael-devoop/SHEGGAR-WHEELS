import type { Metadata } from "next";

import BookingHistory from "@/components/bookings/BookingHistory";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="renter">
      <div className="shell py-8 sm:py-10">
        <BookingHistory />
      </div>
    </RoleGuard>
  );
}
