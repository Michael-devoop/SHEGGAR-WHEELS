import type { Metadata } from "next";

import AdminReports from "@/components/admin/AdminReports";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <AdminReports />
    </div>
  );
}
