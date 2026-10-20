import { CURRENCY } from "@/lib/constants";

/**
 * Formatting helpers.
 *
 * Every date formatter pins `timeZone: "UTC"` on purpose: the server and the
 * browser then print the same text, which removes a whole class of hydration
 * mismatches. "2026-10-20" is always the same calendar day everywhere.
 */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const formatETB = (amount: number): string =>
  currencyFormatter.format(amount);

/** Format a number of days as "3 days" / "1 day". */
export const formatDays = (days: number): string =>
  `${days} ${days === 1 ? "day" : "days"}`;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/** Accepts "2026-10-20" or a full ISO timestamp. */
export const formatDate = (iso: string): string =>
  dateFormatter.format(new Date(iso));

/** Accepts a full ISO timestamp. */
export const formatDateTime = (iso: string): string =>
  dateTimeFormatter.format(new Date(iso));

/**
 * "3 hours ago" style formatting.
 *
 * Uses `Date.now()`, which is a request-time read — call it only from Client
 * Components after mount, never during server render.
 */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minutes = Math.round(diff / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");

  return rtf.format(Math.round(hours / 24), "day");
}

/** Truncate to a whole word, for card titles and list summaries. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
