import type { Metadata } from "next";

import ReviewForm from "@/components/reviews/ReviewForm";

export const metadata: Metadata = {
  title: "Leave a review",
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
      <ReviewForm bookingId={id} />
    </div>
  );
}
