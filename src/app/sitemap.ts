import type { MetadataRoute } from "next";
import { CATEGORY_PAGES, SITE_URL, URL_TRAILING } from "@/lib/product-data";
import {
  getAllBlogSlugs,
  getPublishedCatalog,
  getPublishedContent,
} from "@/lib/site-content";

/* Dynamic sitemap — serves /sitemap.xml with category landing pages
   and every product URL, generated from the PUBLISHED catalog +
   content (admin edits flow through), with blog slugs = compiled
   posts ∪ DB-published posts. */

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, content, blogSlugs] = await Promise.all([
    getPublishedCatalog(),
    getPublishedContent(),
    getAllBlogSlugs(),
  ]);
  const setSlugs = Object.keys(content.sets.hubs);
  const guideSlugs = Object.keys(content.guides.items);

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

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
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
    ...setSlugs.map((slug) => ({
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
    ...guideSlugs.map((slug) => ({
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
    ...blogSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}${URL_TRAILING}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...homepage, ...categoryPages, ...productPages, ...editorialPages];
}
