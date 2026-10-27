import type { Metadata } from "next";
import { Suspense } from "react";

import CarAvailability from "@/components/cars/CarAvailability";
import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Availability",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function AvailabilityContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <CarAvailability carId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="owner">
      <Suspense fallback={<DetailRouteLoading label="Loading availability…" />}>
        <AvailabilityContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
