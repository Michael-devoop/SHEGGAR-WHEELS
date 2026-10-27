import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * Public surface: browsing, authentication and marketing pages.
 *
 * `<main id="main">` lives here so the skip link has a single, stable target
 * for every route in this group.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <Header />

      <main id="main" className="flex-1 pt-16">
        {children}
      </main>

      <Footer />
    </div>
  );
}

