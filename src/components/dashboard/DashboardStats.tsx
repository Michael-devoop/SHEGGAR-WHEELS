import Link from "next/link";
import type { ReactNode } from "react";

const LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground";

const CARD_LINK =
  "transition-colors hover:border-foreground/20 hover:bg-surface-sunken";

type HrefProps = {
  href?: string;
};

function CardFrame({
  href,
  label,
  className,
  children,
}: HrefProps & {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {href ? (
        <Link
          href={href}
          aria-label={label}
          className="absolute inset-0 z-10 rounded-xl"
        />
      ) : null}
    </div>
  );
}

/** Bento shell: one hero, one trend card and two smaller cards. */
export function StatsBento({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="dashboard-stats" className="mt-6">
      <h2 id="dashboard-stats" className="sr-only">
        Key stats
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
        {children}
      </div>
    </section>
  );
}

export function PrimaryStat({
  label,
  value,
  description,
  meta,
}: {
  label: string;
  value: ReactNode;
  description: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-80 flex-col justify-between overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground sm:p-8 md:col-span-2 lg:col-span-3 lg:row-span-2 lg:p-10">
      <div
        aria-hidden="true"
        className="dashboard-stripes pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="relative">
        <span className="inline-flex rounded-pill border border-on-primary/15 bg-on-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-primary/70">
          {label}
        </span>
        <p className="mt-6 text-4xl leading-none font-bold tracking-tighter text-on-primary tabular-nums sm:text-5xl xl:text-6xl">
          {value}
        </p>
      </div>

      <div className="relative mt-8">
        <p className="max-w-xs text-sm leading-relaxed text-on-primary/70">
          {description}
        </p>
        {meta ? (
          <p className="mt-3 text-xs font-medium text-on-primary/60">{meta}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TrendStat({
  label,
  value,
  points,
  note,
  href,
}: {
  label: string;
  value: ReactNode;
  points: readonly number[];
  note?: ReactNode;
} & HrefProps) {
  const max = Math.max(...points, 1);
  const linkLabel = `${label}: ${String(value)}${note ? `. ${String(note)}` : ""}`;

  return (
    <CardFrame
      href={href}
      label={linkLabel}
      className={`flex min-h-36 items-center justify-between gap-6 rounded-xl border border-border bg-muted p-6 sm:p-8 md:col-span-2 lg:col-span-3 ${
        href ? CARD_LINK : ""
      }`}
    >
      <div className="min-w-0">
        <p className={LABEL}>{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {note ? (
          <p className="mt-2 text-xs leading-snug text-muted-foreground">
            {note}
          </p>
        ) : null}
      </div>

      <div aria-hidden="true" className="flex h-16 shrink-0 items-end gap-1">
        {points.map((point, index) => (
          <span
            key={index}
            className={`w-1.5 rounded-pill bg-foreground ${
              point === 0 ? "opacity-20" : ""
            }`}
            style={{
              height:
                point === 0
                  ? "2px"
                  : `${Math.max(8, (point / max) * 100)}%`,
            }}
          />
        ))}
      </div>

      <p className="sr-only">
        Monthly activity for the last {points.length} months:{" "}
        {points.join(", ")}.
      </p>
    </CardFrame>
  );
}

export function MiniStat({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
} & HrefProps) {
  return (
    <CardFrame
      href={href}
      label={`${label}: ${String(value)}${note ? `. ${String(note)}` : ""}`}
      className={`flex min-h-36 flex-col justify-center rounded-xl border border-border bg-card p-6 text-center md:col-span-1 ${
        href ? CARD_LINK : ""
      }`}
    >
      <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className={`mt-1 ${LABEL}`}>{label}</p>
      {note ? (
        <p className="mt-2 text-xs leading-snug text-muted-foreground">{note}</p>
      ) : null}
    </CardFrame>
  );
}

export function DetailStat({
  icon,
  title,
  note,
  href,
}: {
  icon: ReactNode;
  title: ReactNode;
  note: ReactNode;
} & HrefProps) {
  return (
    <CardFrame
      href={href}
      label={`${String(title)}. ${String(note)}`}
      className={`flex min-h-36 items-center gap-4 rounded-xl border border-border bg-muted p-6 md:col-span-1 lg:col-span-2 ${
        href ? CARD_LINK : ""
      }`}
    >
      <div
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-background text-foreground shadow-sm"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-base leading-tight font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">{note}</p>
      </div>
    </CardFrame>
  );
}
