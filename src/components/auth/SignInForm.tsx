"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { signInWithEmail } from "@/lib/actions/authActions";
import { homeForUser } from "@/lib/domain/permissions";
import { safeReturnPath } from "@/lib/domain/safeReturnPath";

/**
 * Sign-in by email.
 *
 * There are no passwords in this demo. Seeded accounts are listed as one-tap
 * fills so a reviewer can reach every surface without remembering addresses.
 */
const DEMO_ACCOUNTS = [
  { email: "marta@example.com", label: "Owner + renter" },
  { email: "yonas@example.com", label: "Renter" },
  { email: "selam@example.com", label: "Admin" },
] as const;

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = signInWithEmail(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    const target = safeReturnPath(
      searchParams.get("next"),
      homeForUser(result.data),
    );
    router.replace(target);
    router.refresh();
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Enter the email on your account. This demo does not use passwords.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "signin-error" : undefined}
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="you@example.com"
          />
        </div>

        {error ? (
          <p id="signin-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Sign in
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Demo accounts
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setError(null);
              }}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-bg px-3 text-sm text-ink transition-colors hover:bg-surface-2"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
