import type { Metadata } from "next";

import AdminAnnouncements from "@/components/admin/AdminAnnouncements";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <AdminAnnouncements />
    </div>
  );
}
