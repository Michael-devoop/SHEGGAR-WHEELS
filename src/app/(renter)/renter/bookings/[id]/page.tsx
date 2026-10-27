import type { Metadata } from "next";
import { Suspense } from "react";

import BookingDetail from "@/components/bookings/BookingDetail";
import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function BookingContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <BookingDetail bookingId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="renter">
      <Suspense fallback={<DetailRouteLoading label="Loading booking…" />}>
        <BookingContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
