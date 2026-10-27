import type { Metadata } from "next";

import AdminReports from "@/components/admin/AdminReports";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="admin">
      <div className="shell py-8 sm:py-10">
        <AdminReports />
      </div>
    </RoleGuard>
  );
}
