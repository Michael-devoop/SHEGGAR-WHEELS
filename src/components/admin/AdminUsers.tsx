"use client";

import { useState } from "react";
import Link from "next/link";

import { useCurrentUser } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUsers";
import { setUserStatus } from "@/lib/actions/adminActions";
import { formatDate } from "@/lib/format";
import type { User } from "@/types";

function UserRow({
  user,
  isSelf,
  error,
  onStatus,
}: {
  user: User;
  isSelf: boolean;
  error: string | null;
  onStatus: (id: string, status: "active" | "suspended") => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const suspended = user.status === "suspended";

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            <Link
              href={`/admin/users/`}
              className="underline underline-offset-4"
            >
              {user.name}
            </Link>
            {isSelf ? (
              <span className="ml-2 text-xs font-normal text-ink-muted">
                (you)
              </span>
            ) : null}
          </p>
          <p className="text-sm text-ink-muted">{user.email}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {user.roles.join(", ")} · joined {formatDate(user.createdAt)}
          </p>
        </div>
        <span
          className={
            suspended
              ? "rounded-pill bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger"
              : "rounded-pill bg-success-bg px-2.5 py-1 text-xs font-semibold text-success"
          }
        >
          {suspended ? "Suspended" : "Active"}
        </span>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {!isSelf ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {confirming ? (
            <>
              <p className="self-center text-sm text-ink">
                Suspend {user.name}?
              </p>
              <button
                type="button"
                onClick={() => onStatus(user.id, "suspended")}
                className="inline-flex min-h-11 items-center rounded-md bg-danger-solid px-4 text-sm font-semibold text-danger-solid-text transition-opacity hover:opacity-90"
              >
                Yes, suspend
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                Keep
              </button>
            </>
          ) : suspended ? (
            <button
              type="button"
              onClick={() => onStatus(user.id, "active")}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Reactivate account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Suspend account
            </button>
          )}
        </div>
      ) : null}
    </li>
  );
}

export default function AdminUsers() {
  const { user, hydrated } = useCurrentUser();
  const users = useUsers();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading accounts…
      </p>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? users.filter(
        (entry) =>
          entry.name.toLowerCase().includes(needle) ||
          entry.email.toLowerCase().includes(needle),
      )
    : users;

  function handleStatus(id: string, status: "active" | "suspended") {
    setError(null);
    const result = setUserStatus(id, status);
    if (!result.ok) setError({ id, message: result.error });
  }

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Suspend an account to block new actions. Existing bookings and reviews
          stay on record.
        </p>
      </header>

      <div className="mt-5 max-w-sm space-y-1.5">
        <label htmlFor="user-search" className="text-sm font-medium text-ink">
          Search accounts
        </label>
        <input
          id="user-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
          placeholder="Name or email"
        />
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        {visible.length} {visible.length === 1 ? "account" : "accounts"}
      </p>

      {visible.length === 0 ? (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
          No accounts match that search.
        </p>
      ) : (
        <ul role="list" className="mt-3 grid gap-3">
          {visible.map((entry) => (
            <UserRow
              key={entry.id}
              user={entry}
              isSelf={entry.id === user?.id}
              error={error?.id === entry.id ? error.message : null}
              onStatus={handleStatus}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
