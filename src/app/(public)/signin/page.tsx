import { Suspense } from "react";

import SignInForm from "@/components/auth/SignInForm";

export default function Page() {
  return (
    <div className="shell py-10 sm:py-14">
      <Suspense
        fallback={
          <p role="status" className="text-sm text-ink-muted">
            Loading sign in…
          </p>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
