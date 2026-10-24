import type { Metadata } from "next";

import OwnerReviews from "@/components/reviews/OwnerReviews";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <OwnerReviews />
    </div>
  );
}
