import type { Metadata } from "next";

import AdminBookings from "@/components/admin/AdminBookings";

export const metadata: Metadata = {
  title: "Bookings",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <AdminBookings />
    </div>
  );
}
