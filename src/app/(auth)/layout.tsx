import type { ReactNode } from "react";

/**
 * Auth surface: sign-in and sign-up pages.
 * Clean, full-bleed viewport wrapper.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh w-full">{children}</div>;
}
