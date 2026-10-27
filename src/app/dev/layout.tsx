import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Demo data",
  robots: { index: false, follow: false },
};

export default function DevLayout({ children }: { children: ReactNode }) {
  return children;
}
