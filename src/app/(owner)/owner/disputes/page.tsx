import type { Metadata } from "next";

import OwnerDisputes from "@/components/disputes/OwnerDisputes";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Disputes",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <RoleGuard area="owner">
      <div className="shell py-8 sm:py-10">
        <OwnerDisputes />
      </div>
    </RoleGuard>
  );
}
