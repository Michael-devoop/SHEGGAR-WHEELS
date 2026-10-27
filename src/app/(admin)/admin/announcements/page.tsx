import type { Metadata } from "next";

import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="admin">
      <div className="shell py-8 sm:py-10">
        <AdminAnnouncements />
      </div>
    </RoleGuard>
  );
}
