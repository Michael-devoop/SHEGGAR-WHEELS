import type { Metadata } from "next";
import { Suspense } from "react";

import CarEditor from "@/components/cars/CarEditor";
import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Edit car",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function EditCarContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <CarEditor carId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="owner">
      <Suspense fallback={<DetailRouteLoading label="Loading car editor…" />}>
        <EditCarContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
