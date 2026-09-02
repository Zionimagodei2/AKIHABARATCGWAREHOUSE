import productsData from "../../public/products.json";

/* ────────────────────────────────────────────────────────────
   Shared product data + SEO helpers
   Used by: home page (SSR catalog), product pages, sitemap
   ──────────────────────────────────────────────────────────── */

export interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  image: string;
  category: string;
  categories?: string[];
  subcategory?: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  description?: string;
  slug?: string;
  [key: string]: unknown;
}

export const SITE_URL = "https://www.akihabaratcgwarehouse.com";

/* Static-export builds (NEXT_OUTPUT=export, see scripts/build-static.sh) emit
   trailing-slash URLs (/product/x/) because the site is served from static
   directories. Server/standalone builds use extensionless URLs. This constant
   keeps canonicals, JSON-LD and the sitemap aligned with the emitted URL shape
   so crawlers never see a mismatch. */
export const URL_TRAILING =
  process.env.NEXT_OUTPUT === "export" ? "/" : "";

/* ── Slug generation (deterministic, shared by pages + sitemap) ── */

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/* ── Unique, attribute-rich description per product ── */

function extractSeries(title: string): string | null {
  const m = title.match(/\b(OP|EB|PRB|ST|SV|PR|OP-|M\d+[a-z]?|SV\d+[a-zA-Z]?|HBP|QBT|CB|UA|DB|FS|OP-)\s?\d+[a-zA-Z]?\b/i);
  return m ? m[0].toUpperCase() : null;
}

export function generateDescription(p: Product): string {
  const cats = p.categories || [];
  const sub = p.subcategory || (cats.length > 1 ? cats[1] : undefined);
  const series = extractSeries(p.title);
  const discount =
    p.original_price && p.original_price > p.price
      ? ` Now ${Math.round(((p.original_price - p.price) / p.original_price) * 100)}% off (was $${p.original_price.toFixed(2)}).`
      : "";

  const productType = sub
    ? sub.replace(/&/g, "and")
    : "sealed TCG product";

  const seriesPhrase = series
    ? `${series} series`
    : `${p.category} card game`;

  return (
    `Buy the ${p.title} — an authentic Japanese ${p.category} TCG ${productType} from the ${seriesPhrase}, factory sealed and sourced directly from authorized distributors in Akihabara, Tokyo. ` +
    `In stock${p.price ? ` at $${p.price.toFixed(2)} with fast worldwide shipping` : ""}${discount} ` +
    `Every order ships in secure protective packaging with tracking, backed by our 100% authenticity guarantee and 30-day returns on sealed products.`
  );
}

/* ── Cleaned catalog with slugs (single source of truth) ── */

function cleanProducts(data: unknown): Product[] {
  const seenSlugs = new Map<string, number>();
  return (data as Product[])
    .filter((p) => p.id && p.title && p.price > 0 && p.image && p.category)
    .map((p) => {
      // Deterministic slug; suffix with -2, -3… on collision
      let slug = slugify(p.title);
      const n = seenSlugs.get(slug) || 0;
      seenSlugs.set(slug, n + 1);
      if (n > 0) slug = `${slug}-${n + 1}`;

      return {
        ...p,
        slug,
        subcategory:
          p.categories && p.categories.length > 1 ? p.categories[1] : undefined,
        description: p.description || generateDescription(p),
      };
    });
}

export const allProducts: Product[] = cleanProducts(productsData);

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

/* ── Related products (same category, different product) ── */

export function relatedProducts(p: Product, count = 4): Product[] {
  const sameCategory = allProducts.filter(
    (x) => x.category === p.category && x.id !== p.id
  );
  const sameSub = sameCategory.filter(
    (x) => x.subcategory === p.subcategory
  );
  const pool = sameSub.length >= count ? sameSub : sameCategory;
  return pool.slice(0, count);
}

/* ── Category landing pages ── */

/** URL path for each category's landing page (used by breadcrumbs, sitemap) */
export const CATEGORY_PAGES: Record<string, string> = {
  Pokemon: "/pokemon-cards",
  "One Piece": "/one-piece-cards",
  "Other TCG": "/japanese-tcg",
};

export function categoryPageUrl(category: string): string {
  return CATEGORY_PAGES[category] || "/";
}

export function categoryProducts(category: string): Product[] {
  return allProducts.filter((p) => p.category === category);
}

export interface ProductGroup {
  name: string;
  products: Product[];
}

/** Group a category's products by subcategory (brand for Other TCG). */
export function groupBySubcategory(
  products: Product[],
  order?: string[]
): ProductGroup[] {
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.subcategory || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  let names = Array.from(groups.keys());
  if (order && order.length > 0) {
    names.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  } else {
    // No explicit order: largest groups first
    names.sort((a, b) => groups.get(b)!.length - groups.get(a)!.length);
  }
  return names.map((name) => ({ name, products: groups.get(name)! }));
}
