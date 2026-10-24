import type { Metadata } from "next";

import AdminDisputes from "@/components/disputes/AdminDisputes";

export const metadata: Metadata = {
  title: "Disputes",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <AdminDisputes />
    </div>
  );
}
