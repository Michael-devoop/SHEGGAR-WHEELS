/**
 * Site-wide SEO configuration.
 *
 * The canonical origin is resolved once, defensively: a malformed
 * `NEXT_PUBLIC_SITE_URL` must not crash the build, it must degrade to the
 * environment default (local in development, Vercel in production) and stay
 * loud in the metadata.
 */

export const SITE_NAME = "Sheggar Wheels";

export const SITE_TITLE = `${SITE_NAME} | Peer-to-peer car rental in Addis Ababa`;

export const SITE_DESCRIPTION =
  "Rent a car from someone who actually drives it. Browse cars from local owners across Addis Ababa and book your next trip in a few taps.";

export const SITE_LOCALE = "en_ET";

export const OG_IMAGE = {
  url: "/og-logo.png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} logo — peer-to-peer car rental in Addis Ababa`,
};

const FALLBACK_SITE_URL = "http://localhost:3000";
const PRODUCTION_SITE_URL = "https://sheggar-wheels-liart.vercel.app";

function fallbackSiteUrl(): string {
  if (process.env.NODE_ENV !== "production") return FALLBACK_SITE_URL;

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    (process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_URL
      : undefined);

  return host
    ? `https://${host.replace(/^https?:\/\//, "")}`
    : PRODUCTION_SITE_URL;
}

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return fallbackSiteUrl();

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }
    return url.origin;
  } catch {
    console.warn(
      `[seo] Ignoring invalid NEXT_PUBLIC_SITE_URL: ${JSON.stringify(raw)}. Falling back to ${fallbackSiteUrl()}.`,
    );
    return fallbackSiteUrl();
  }
}

export const SITE_URL = resolveSiteUrl();

/** Absolute URL helper, so metadata never emits relative paths. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
