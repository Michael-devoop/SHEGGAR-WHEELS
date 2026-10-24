import type { Metadata } from "next";

import AdminUserDetail from "@/components/admin/AdminUserDetail";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <AdminUserDetail userId={id} />
    </div>
 
  );
}
