"use client";

import { useRouter } from "next/navigation";

import { signOutAction } from "@/lib/actions/authActions";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        signOutAction();
        router.replace("/");
        router.refresh();
      }}
      className={
        className ??
        "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
      }
    >
      Sign out
    </button>
  );
}
