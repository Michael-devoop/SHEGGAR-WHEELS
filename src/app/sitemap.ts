import type { MetadataRoute } from "next";
import { listCarsByStatus } from "@/lib/data/cars";
import { carPath } from "@/lib/domain/carSlug";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Public routes only. Approved seed listings are included at build time;
 * browser-created listings are not visible to the server.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const carEntries: MetadataRoute.Sitemap = listCarsByStatus("approved").map(
    (car) => ({
      url: absoluteUrl(carPath(car)),
      lastModified: new Date(car.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
      images: car.photos.map((photo) => absoluteUrl(photo)),
    }),
  );

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
    ...carEntries,
  ];
}
