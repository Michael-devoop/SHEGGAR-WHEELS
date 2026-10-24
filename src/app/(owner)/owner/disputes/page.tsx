import type { Metadata } from "next";

import OwnerDisputes from "@/components/disputes/OwnerDisputes";

export const metadata: Metadata = {
  title: "Disputes",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <OwnerDisputes />
    </div>
  );
}
