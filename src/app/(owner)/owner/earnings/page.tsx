import type { Metadata } from "next";

import OwnerEarnings from "@/components/dashboard/OwnerEarnings";

export const metadata: Metadata = {
  title: "Earnings",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <OwnerEarnings />
    </div>
  );
}
