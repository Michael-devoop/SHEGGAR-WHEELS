import type { Metadata } from "next";
import Link from "next/link";

import CarForm from "@/components/cars/CarForm";

export const metadata: Metadata = {
  title: "List a new car",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="shell py-8 sm:py-10">
      <Link
        href="/owner/cars"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> My cars
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        List a new car
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        An admin reviews every new listing before it appears in the catalogue.
      </p>
      <div className="mt-6">
        <CarForm />
      </div>
    </div>
  );
}
