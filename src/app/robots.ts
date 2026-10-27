import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in surfaces and the data inspector carry no public value.
        disallow: [
          "/admin",
          "/admin/",
          "/owner",
          "/owner/",
          "/renter",
          "/renter/",
          "/dev",
          "/dev/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
