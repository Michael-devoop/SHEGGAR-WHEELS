import type { Metadata } from "next";

import AdminListings from "@/components/cars/AdminListings";

export const metadata: Metadata = {
  title: "Listing moderation",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <AdminListings />
    </div>
  );
}
