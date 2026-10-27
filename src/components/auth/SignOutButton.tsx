"use client";

import { signOutAction } from "@/lib/actions/authActions";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        signOutAction();
        window.location.replace("/signin");
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
