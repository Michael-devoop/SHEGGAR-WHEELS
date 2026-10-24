import type { Metadata } from "next";

import OwnerBookingRequests from "@/components/bookings/OwnerBookingRequests";

export const metadata: Metadata = {
  title: "Car bookings",
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
      <OwnerBookingRequests carId={id} />
    </div>
  );
}
