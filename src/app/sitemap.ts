import type { MetadataRoute } from "next";
import { allProducts, CATEGORY_PAGES, SITE_URL, URL_TRAILING } from "@/lib/product-data";
import { SET_SLUGS, GUIDE_SLUGS } from "@/lib/content-data";
import { POST_SLUGS } from "@/lib/blog-data";

/* Dynamic sitemap — serves /sitemap.xml with category landing pages
   and every product URL, generated from the same slug source as the pages */

// Required for static-export builds ("output: 'export'"); harmless (and
// accurate) in server mode — the sitemap is fully deterministic.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const homepage: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Category landing pages (keyword-targeted collections)
  const categoryPages: MetadataRoute.Sitemap = Object.values(
    CATEGORY_PAGES
  ).map((slug) => ({
    url: `${SITE_URL}${slug}${URL_TRAILING}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const productPages: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}${URL_TRAILING}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Editorial content — set hubs, guides, release calendar
  const editorialPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/sets${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...SET_SLUGS.map((slug) => ({
      url: `${SITE_URL}/sets/${slug}${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/guides${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    ...GUIDE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/guides/${slug}${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/release-calendar${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...POST_SLUGS.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...homepage, ...categoryPages, ...productPages, ...editorialPages];
}
