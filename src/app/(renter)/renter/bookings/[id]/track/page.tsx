import type { Metadata } from "next";

import TripTracker from "@/components/bookings/TripTracker";

export const metadata: Metadata = {
  title: "Track trip",
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
      <TripTracker bookingId={id} />
    </div>
  );
}
