import type { Metadata } from "next";
import { Suspense } from "react";

import TripTracker from "@/components/bookings/TripTracker";
import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Track trip",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function TripContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <TripTracker bookingId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="renter">
      <Suspense fallback={<DetailRouteLoading label="Loading trip…" />}>
        <TripContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
