import type { Metadata } from "next";
import { Suspense } from "react";

import OwnerBookingRequests from "@/components/bookings/OwnerBookingRequests";
import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Car bookings",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function CarBookingsContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <OwnerBookingRequests carId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="owner">
      <Suspense fallback={<DetailRouteLoading label="Loading car bookings…" />}>
        <CarBookingsContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
