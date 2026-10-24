import type { Metadata } from "next";

import CarAvailability from "@/components/cars/CarAvailability";

export const metadata: Metadata = {
  title: "Availability",
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
      <CarAvailability carId={id} />
    </div>
  );
}
