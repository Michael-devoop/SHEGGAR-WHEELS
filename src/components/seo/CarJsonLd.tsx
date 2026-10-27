import {
  buildCarStructuredData,
  serializeJsonLd,
} from "@/lib/seo/structured-data";
import type { Car, Review } from "@/types";

export default function CarJsonLd({
  car,
  reviews,
}: {
  car: Car;
  reviews: Review[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(buildCarStructuredData(car, reviews)),
      }}
    />
  );
}
