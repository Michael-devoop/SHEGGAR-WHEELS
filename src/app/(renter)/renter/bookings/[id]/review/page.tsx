import type { Metadata } from "next";
import { Suspense } from "react";

import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";
import ReviewForm from "@/components/reviews/ReviewForm";

export const metadata: Metadata = {
  title: "Leave a review",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function ReviewContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <ReviewForm bookingId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="renter">
      <Suspense fallback={<DetailRouteLoading label="Loading review form…" />}>
        <ReviewContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
