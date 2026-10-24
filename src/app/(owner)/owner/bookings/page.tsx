import type { Metadata } from "next";

import OwnerBookingRequests from "@/components/bookings/OwnerBookingRequests";

export const metadata: Metadata = {
  title: "Booking requests",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <OwnerBookingRequests />
    </div>
  );
}
