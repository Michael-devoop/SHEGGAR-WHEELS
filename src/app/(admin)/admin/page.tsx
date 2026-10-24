import type { Metadata } from "next";

import AdminOverview from "@/components/admin/AdminOverview";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <AdminOverview />
    </div>
  );
}
