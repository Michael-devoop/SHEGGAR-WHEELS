import type { Metadata } from "next";
import { Suspense } from "react";

import AdminDisputeDetail from "@/components/disputes/AdminDisputeDetail";
import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Dispute",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function DisputeContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <AdminDisputeDetail disputeId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="admin">
      <Suspense fallback={<DetailRouteLoading label="Loading dispute…" />}>
        <DisputeContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
