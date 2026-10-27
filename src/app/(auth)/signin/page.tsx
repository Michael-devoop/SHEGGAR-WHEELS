import type { Metadata } from "next";
import { Suspense } from "react";

import SignInForm from "@/components/auth/SignInForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Sign in · Sheggar Wheels",
  description: "Sign in to your Sheggar Wheels account.",
};

export default function Page() {
  return (
    <AuthShell
      imageSrc="/images/cars/car-07.jpg"
      badgeText="Verified Vehicles · Addis Ababa"
      headline="Drive the car you desire, anywhere in Addis."
      quote="Booking was effortless. The car was spotless, insured, and waiting for me in Bole within minutes."
      author="Dawit M. · Verified Renter"
      perks={["No deposit lockup", "Verified hosts", "24/7 roadside assist"]}
    >
      <Suspense
        fallback={
          <div role="status" className="py-8 text-center text-sm text-zinc-400">
            Loading sign in…
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
