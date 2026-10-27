import type { Metadata } from "next";

import RenterDashboard from "@/components/dashboard/RenterDashboard";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Renter dashboard",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="renter">
      <div className="shell py-8 sm:py-10">
        <RenterDashboard />
      </div>
    </RoleGuard>
  );
}
