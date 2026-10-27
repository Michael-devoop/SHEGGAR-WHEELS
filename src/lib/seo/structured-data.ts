/**
 * Schema.org payloads for search engines and AI agents.
 *
 * Builders are pure so the shape can be tested without rendering a page.
 * Render results through `serializeJsonLd`; it escapes markup that could
 * otherwise close the surrounding `<script>` tag.
 */
import { CURRENCY } from "@/lib/constants";
import { carPath } from "@/lib/domain/carSlug";
import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";
import type { Car, Review } from "@/types";

type JsonLdObject = Record<string, unknown>;

function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function buildCarStructuredData(
  car: Car,
  reviews: Review[],
): JsonLdObject {
  const url = absoluteUrl(carPath(car));
  const rating = averageRating(reviews);

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${car.make} ${car.model} ${car.year}`,
    description: car.description,
    image: car.photos.map((photo) => absoluteUrl(photo)),
    url,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleTransmission: car.transmission,
    seatingCapacity: car.seats,
    areaServed: { "@type": "City", name: car.city },
    offers: {
      "@type": "Offer",
      url,
      price: car.pricePerDay,
      priceCurrency: CURRENCY,
      availability:
        car.status === "approved"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
    },
    ...(rating === null
      ? {}
      : {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }),
  };
}

export function buildOrganizationStructuredData(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl(
      "/SHEGGAR_WHEELS_Automotive_Logo-removebg-preview.webp",
    ),
    areaServed: { "@type": "City", name: "Addis Ababa" },
  };
}

/** JSON that is safe to inline inside a `<script>` element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
