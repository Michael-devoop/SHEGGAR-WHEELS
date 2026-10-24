"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createUser, signInWithEmail } from "@/lib/actions/authActions";
import { homeForUser } from "@/lib/domain/permissions";
import type { Role } from "@/types";

/**
 * Account creation.
 *
 * One email, one account. A user may rent, list a car, or both; admin is not
 * self-service. The new account is written to the browser store and signed in
 * immediately, then sent to the surface its roles unlock.
 */
export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roles, setRoles] = useState<Role[]>(["renter"]);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(role: Role, checked: boolean) {
    setRoles((current) =>
      checked
        ? [...new Set([...current, role])]
        : current.filter((entry) => entry !== role),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (roles.length === 0) {
      setError("Choose at least one: rent cars, list a car, or both.");
      return;
    }

    const created = createUser({ name, email, phone, roles });
    if (!created.ok) {
      setError(created.error);
      return;
    }

    const signedIn = signInWithEmail(created.data.email);
    if (!signedIn.ok) {
      setError(signedIn.error);
      return;
    }

    router.replace(homeForUser(signedIn.data));
    router.refresh();
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        No password and no payment details. This is a simulated marketplace.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="Hanna Girma"
          />
        </div>

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
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-ink">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="+251911234567"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink">I want to</legend>
          {(
            [
              { role: "renter", label: "Rent a car" },
              { role: "owner", label: "List my car" },
            ] as const
          ).map((option) => (
            <label
              key={option.role}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-3 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={roles.includes(option.role)}
                onChange={(event) =>
                  toggleRole(option.role, event.target.checked)
                }
                className="size-4 accent-primary"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
