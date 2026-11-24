import type { Metadata } from "next";
import Link from "next/link";
import {
  categoryPhrase,
  groupBySubcategory,
  SITE_URL,
  URL_TRAILING,
  type Product,
} from "@/lib/product-data";
import { DEFAULT_CONTENT } from "@/lib/content-defaults";
import type { CategoryPageContent } from "@/lib/content-types";

/* ────────────────────────────────────────────────────────────
   Category Landing Page — shared template for /pokemon-cards,
   /one-piece-cards, /english-one-piece-cards and /japanese-tcg.
   Server-rendered, unique copy + metadata per category, every
   product linked internally.

   Copy comes from the published site content (categoryPages key,
   admin-editable); CATEGORY_CONFIG below is the compiled fallback —
   the same data as the content defaults — used when no published
   config is passed.
   ──────────────────────────────────────────────────────────── */

export type CategoryLandingConfig = CategoryPageContent;

export const CATEGORY_CONFIG: Record<string, CategoryLandingConfig> =
  DEFAULT_CONTENT.categoryPages;

/* ── Metadata factory used by the route files ── */

export function categoryMetadata(
  category: string,
  resolved?: CategoryLandingConfig,
  siteName = "Akihabara TCG Warehouse",
): Metadata {
  const cfg = resolved ?? CATEGORY_CONFIG[category];
  const url = `${SITE_URL}${cfg.slug}${URL_TRAILING}`;
  return {
    title: cfg.metaTitle,
    description: cfg.metaDescription,
    keywords: cfg.keywords,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: cfg.metaTitle,
      description: cfg.metaDescription,
      type: "website",
      url,
      siteName,
      images: [
        {
          url: `${SITE_URL}${cfg.heroImage}`,
          width: 1024,
          height: 512,
          alt: cfg.h1,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.metaTitle,
      description: cfg.metaDescription,
      images: [`${SITE_URL}${cfg.heroImage}`],
    },
  };
}

/* ── Main landing component ── */

export default function CategoryLanding({
  category,
  config,
  allConfigs,
  products,
  totalCount,
  siteName = "Akihabara TCG Warehouse",
  freeShippingThreshold = 500,
}: {
  category: string;
  config?: CategoryLandingConfig;
  allConfigs?: Record<string, CategoryLandingConfig>;
  products: Product[];
  totalCount: number;
  siteName?: string;
  freeShippingThreshold?: number;
}) {
  const cfg = config ?? CATEGORY_CONFIG[category];
  if (!cfg) return null;

  const groups = groupBySubcategory(products, cfg.sectionOrder);
  const otherCategories = Object.values(allConfigs ?? CATEGORY_CONFIG).filter(
    (c) => c.key !== category
  );
  const intro = cfg.intro.replace("{count}", String(products.length));
  const pills = (cfg.heroPills ?? []).map((pill) =>
    pill
      .replace("{count}", String(products.length))
      .replace("{threshold}", `$${freeShippingThreshold}`),
  );

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cfg.h1,
    description: cfg.metaDescription,
    url: `${SITE_URL}${cfg.slug}${URL_TRAILING}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${SITE_URL}/product/${p.slug}${URL_TRAILING}`,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: cfg.h1,
        item: `${SITE_URL}${cfg.slug}${URL_TRAILING}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="bg-white border-b border-gray-200"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap">
              <li>
                <Link
                  href="/"
                  className="hover:text-purple-700 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-purple-900 font-medium">{cfg.h1}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <header className="bg-purple-950 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-3">
              {cfg.eyebrow}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-tight mb-5 max-w-3xl">
              {cfg.h1}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-gray-200 leading-relaxed max-w-3xl">
              {intro}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-7">
              {pills.map((pill) => (
                <span
                  key={pill}
                  className="bg-white/10 backdrop-blur-sm text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-white/20"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Product sections */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {groups.map((g) => {
            const title = cfg.sectionTitles?.[g.name] || g.name;
            const desc = cfg.sectionDescriptions?.[g.name];
            return (
              <section key={g.name} className="mb-12 sm:mb-16">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold font-[family-name:var(--font-montserrat)] text-purple-950">
                    {title}
                  </h2>
                  <span className="text-[12px] font-semibold text-gray-400">
                    {g.products.length}{" "}
                    {g.products.length === 1 ? "product" : "products"}
                  </span>
                </div>
                {desc && (
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-5 max-w-2xl">
                    {desc}
                  </p>
                )}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {g.products.map((p) => (
                    <CategoryProductCard key={p.id} p={p} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Cross-links to other categories */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
            <h2 className="text-lg font-extrabold font-[family-name:var(--font-montserrat)] text-purple-950 mb-5">
              {cfg.exploreTitle}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {otherCategories.map((c) => (
                <Link
                  key={c.key}
                  href={c.slug}
                  className="group flex items-center justify-between gap-4 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 px-5 py-4 transition-colors"
                >
                  <span className="text-[14px] font-semibold text-purple-950 group-hover:text-purple-700 transition-colors leading-snug">
                    {c.h1}
                  </span>
                  <span className="text-purple-400 shrink-0" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-6 text-purple-700 hover:text-purple-900 font-semibold text-[15px]"
            >
              ← Browse the complete catalog of {totalCount} authentic
              Japanese & English TCG products
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-purple-950 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img
                  src="/store-logo.webp"
                  alt="Akihabara TCG Warehouse logo"
                  className="w-8 h-8 object-cover rounded-sm"
                />
                <span className="font-extrabold font-[family-name:var(--font-montserrat)]">
                  AKIHABARA TCG WAREHOUSE
                </span>
              </div>
              <p className="text-[12px] text-violet-300">
                {cfg.footerTagline}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ── Product card used on category pages ── */

function CategoryProductCard({ p }: { p: Product }) {
  const hasOriginal = (p.original_price ?? 0) > p.price;
  const isPreOrder = p.in_stock === false;
  const discount =
    hasOriginal && p.original_price
      ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
      : 0;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-purple-400 hover:shadow-lg transition-all"
    >
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-4">
        <img
          src={p.image}
          alt={`${p.title} — ${categoryPhrase(p.category)} ${p.subcategory || "TCG"}`}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          width={220}
          height={220}
        />
        {hasOriginal && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {isPreOrder && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            Pre-Order
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wide">
          {p.subcategory || p.category}
        </p>
        <h3 className="text-[13px] font-semibold text-purple-950 leading-snug line-clamp-2 group-hover:text-purple-700 transition-colors">
          {p.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-[14px] font-bold text-purple-950">
            ${p.price.toFixed(2)}
          </p>
          {hasOriginal && p.original_price && (
            <p className="text-[11px] text-gray-400 line-through">
              ${p.original_price.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
