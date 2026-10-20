import Link from "next/link";

/**
 * Shared 404 content.
 *
 * It does NOT render a `<main>`: the group layouts already provide
 * `main#main`, and the root not-found page adds its own.
 */
export default function NotFoundPanel({
  title = "We could not find that page",
  body = "The link may be out of date, or the listing may have been taken down by its owner.",
  actionHref = "/",
  actionLabel = "Back to home",
}: {
  title?: string;
  body?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
        404
      </p>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-md text-sm text-ink-muted">{body}</p>
      <Link
        href={actionHref}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
