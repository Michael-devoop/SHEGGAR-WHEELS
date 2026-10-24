/**
 * Sanitises a post-sign-in redirect.
 *
 * `?next=` is user input. Accept only a path on this site: a leading slash,
 * no protocol-relative `//`, no backslashes (some browsers treat them as
 * slashes), and nothing that resolves off-origin. Anything else falls back.
 */
const BASE = "https://sheggar.invalid";

export function safeReturnPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || value.includes("\u0000")) return fallback;

  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
