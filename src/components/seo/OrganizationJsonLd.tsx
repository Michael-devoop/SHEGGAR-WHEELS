import {
  buildOrganizationStructuredData,
  serializeJsonLd,
} from "@/lib/seo/structured-data";

export default function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(buildOrganizationStructuredData()),
      }}
    />
  );
}
