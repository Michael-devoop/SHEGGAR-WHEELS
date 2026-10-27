import type { Metadata } from "next";

import AdminUsers from "@/components/admin/AdminUsers";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Accounts",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="admin">
      <div className="shell py-8 sm:py-10">
        <AdminUsers />
      </div>
    </RoleGuard>
  );
}
