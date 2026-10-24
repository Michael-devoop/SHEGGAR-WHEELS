import type { Metadata } from "next";

import BookingDetail from "@/components/bookings/BookingDetail";

export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <BookingDetail bookingId={id} />
    </div>
  );
}
