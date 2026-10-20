"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Global error boundary. It replaces the root layout, so it renders its own
 * `<html>` and `<body>` and imports the global stylesheet itself.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="shell flex flex-col items-start gap-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
            Something broke
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            The app hit an unexpected error
          </h1>
          <p className="max-w-md text-sm text-ink-muted">
            The details are in the browser console. Reloading usually clears
            it.
          </p>
          {error.digest ? (
            <p className="text-xs text-ink-muted">Reference: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
