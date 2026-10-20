/**
 * Site-wide SEO configuration.
 *
 * The canonical origin is resolved once, defensively: a malformed
 * `NEXT_PUBLIC_SITE_URL` must not crash the build, it must degrade to the
 * local origin and stay loud in the metadata.
 */

export const SITE_NAME = "Sheggar Wheels";

export const SITE_DESCRIPTION =
  "Rent a car from someone who actually drives it. Browse cars from local owners across Addis Ababa and book your next trip in a few taps.";

export const SITE_LOCALE = "en_ET";

const FALLBACK_SITE_URL = "http://localhost:3000";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return FALLBACK_SITE_URL;
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    console.warn(
      `[seo] Ignoring invalid NEXT_PUBLIC_SITE_URL: ${JSON.stringify(raw)}. Falling back to ${FALLBACK_SITE_URL}.`,
    );
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

/** Absolute URL helper, so metadata never emits relative paths. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
