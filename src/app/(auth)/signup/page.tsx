import type { Metadata } from "next";

import SignUpForm from "@/components/auth/SignUpForm";
import AuthShell from "@/components/auth/AuthShell";
import { SITE_LOCALE, SITE_NAME } from "@/lib/seo/site";

const SIGN_UP_DESCRIPTION =
  "Join Sheggar Wheels to rent or list verified cars in Addis Ababa.";

export const metadata: Metadata = {
  title: "Create an account",
  description: SIGN_UP_DESCRIPTION,
  alternates: { canonical: "/signup" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/signup",
    title: `Create an account | ${SITE_NAME}`,
    description: SIGN_UP_DESCRIPTION,
  },
};

export default function Page() {
  return (
    <AuthShell
      imageSrc="/images/cars/car-01.jpg"
      badgeText="Join Sheggar Wheels"
      headline="Rent verified cars or earn by sharing yours."
      quote="Turn your parked car into steady income or find reliable wheels for your next road trip across Ethiopia."
      author="Join 1,200+ members in Addis Ababa"
      perks={["Fast verification", "Instant payouts", "Complete insurance"]}
    >
      <SignUpForm />
    </AuthShell>
  );
}
