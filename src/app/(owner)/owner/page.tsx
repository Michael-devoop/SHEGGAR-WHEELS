import type { Metadata } from "next";

import OwnerDashboard from "@/components/dashboard/OwnerDashboard";

export const metadata: Metadata = {
  title: "Owner overview",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <OwnerDashboard />
    </div>
  );
}
