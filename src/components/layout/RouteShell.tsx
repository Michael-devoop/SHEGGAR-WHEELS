import Link from "next/link";

/**
 * Scaffold surface for routes that are scheduled but not built yet.
 *
 * It exists so the planned route map stays navigable and the project compiles
 * while later phases land. Every route that uses it gets replaced by the real
 * screen; nothing links to a placeholder in the finished product.
 */
export default function RouteShell({
  title,
  area,
  description,
}: {
  title: string;
  area: string;
  description?: string;
}) {
  return (
    <div className="shell py-10 sm:py-14">
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {area}
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {description ??
            "This screen is scheduled for a later build phase. The route and its access rules are already in place."}
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
