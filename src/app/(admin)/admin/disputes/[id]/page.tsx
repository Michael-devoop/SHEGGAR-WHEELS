import type { Metadata } from "next";

import AdminDisputeDetail from "@/components/disputes/AdminDisputeDetail";

export const metadata: Metadata = {
  title: "Dispute",
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
      <AdminDisputeDetail disputeId={id} />
    </div>
  );
}
