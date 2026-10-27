import type { Metadata } from "next";
import { Suspense } from "react";

import AdminUserDetail from "@/components/admin/AdminUserDetail";
import DetailRouteLoading from "@/components/layout/DetailRouteLoading";
import RoleGuard from "@/components/layout/RoleGuard";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function AccountContent({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="shell py-8 sm:py-10">
      <AdminUserDetail userId={id} />
    </div>
  );
}

export default function Page(props: PageProps) {
  return (
    <RoleGuard area="admin">
      <Suspense fallback={<DetailRouteLoading label="Loading account…" />}>
        <AccountContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
