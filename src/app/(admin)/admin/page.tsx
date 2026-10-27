import type { Metadata } from "next";

import AdminOverview from "@/components/admin/AdminOverview";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="admin">
      <div className="shell py-8 sm:py-10">
        <AdminOverview />
      </div>
    </RoleGuard>
  );
}
