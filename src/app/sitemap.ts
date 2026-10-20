import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Public routes only. Listing and detail URLs are appended once the
 * catalogue has a real data source to read from.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/cars"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/signup"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/signin"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
