import type { Metadata } from "next";

import CarEditor from "@/components/cars/CarEditor";

export const metadata: Metadata = {
  title: "Edit car",
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
      <CarEditor carId={id} />
    </div>
  );
}
