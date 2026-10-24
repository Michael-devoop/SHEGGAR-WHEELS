import type { Metadata } from "next";

import OwnerCars from "@/components/cars/OwnerCars";

export const metadata: Metadata = {
  title: "My cars",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <OwnerCars />
    </div>
  );
}
