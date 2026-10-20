import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in surfaces carry no public value and must not be indexed.
        disallow: ["/admin/", "/owner/", "/renter/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
