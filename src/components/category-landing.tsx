import type { Metadata } from "next";
import Link from "next/link";
import {
  allProducts,
  categoryProducts,
  groupBySubcategory,
  SITE_URL,
  URL_TRAILING,
  type Product,
} from "@/lib/product-data";

/* ────────────────────────────────────────────────────────────
   Category Landing Page — shared template for /pokemon-cards,
   /one-piece-cards and /japanese-tcg. Server-rendered, unique
   copy + metadata per category, every product linked internally.
   ──────────────────────────────────────────────────────────── */

export interface CategoryLandingConfig {
  key: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  eyebrow: string;
  /** "{count}" is replaced with the live product count */
  intro: string;
  sectionOrder?: string[];
  sectionTitles?: Record<string, string>;
  sectionDescriptions?: Record<string, string>;
  heroImage: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryLandingConfig> = {
  Pokemon: {
    key: "Pokemon",
    slug: "/pokemon-cards",
    metaTitle:
      "Japanese Pokemon Cards — Booster Boxes, Sealed Cases | Akihabara TCG",
    metaDescription:
      "Authentic Japanese Pokemon cards: SV-era booster boxes, special sets & promos. Factory sealed, direct from Akihabara, Tokyo. Ships worldwide with 100% authenticity guarantee.",
    keywords: [
      "Japanese Pokemon cards",
      "Pokemon booster box Japanese",
      "Japanese Pokemon booster box",
      "buy Japanese Pokemon cards online",
      "Japanese Pokemon TCG",
      "Pokemon cards from Japan",
      "Japanese Pokemon special set",
      "Akihabara Pokemon cards",
    ],
    h1: "Japanese Pokémon Cards",
    eyebrow: "Pokémon TCG · Direct from Japan",
    intro:
      "Shop {count} authentic Japanese Pokémon cards direct from Akihabara, Tokyo — the world capital of trading card games. Our Pokémon collection spans the newest Scarlet & Violet era sets alongside modern classics, from single booster boxes to special sets and limited promotional products. Japanese Pokémon booster boxes are prized by collectors worldwide for their exclusive artwork, earlier release dates and different pull rates compared to English sets, making them the preferred format for serious collectors and players. Every item we sell is factory sealed and sourced directly from authorized Japanese distributors, then shipped worldwide in protective packaging with full tracking. Orders over $500 ship free, and every purchase is backed by our 100% authenticity guarantee and 30-day returns on sealed products.",
    sectionOrder: ["Booster Boxes", "Special Set & Promo", "Promo"],
    sectionTitles: {
      "Booster Boxes": "Pokémon Booster Boxes",
      "Special Set & Promo": "Pokémon Special Sets & Promos",
      Promo: "Pokémon Promo Cards",
    },
    sectionDescriptions: {
      "Booster Boxes":
        "Factory-sealed Japanese Pokémon booster boxes from the latest expansions — Scarlet & Violet era sets, legacy classics and everything between.",
      "Special Set & Promo":
        "Special sets, premium collections and promotional releases, including hard-to-find Japanese exclusives.",
      Promo:
        "Limited promotional Pokémon cards and products — perfect for completing a collection.",
    },
    heroImage:
      "/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.webp",
  },

  "One Piece": {
    key: "One Piece",
    slug: "/one-piece-cards",
    metaTitle:
      "Japanese One Piece Cards — Booster Boxes & Sealed Cases | Akihabara TCG",
    metaDescription:
      "Authentic Japanese One Piece Card Game products: OP booster boxes, sealed display cases and special sets. Factory sealed, direct from Akihabara, ships worldwide.",
    keywords: [
      "Japanese One Piece cards",
      "One Piece card game Japanese",
      "One Piece booster box Japanese",
      "Japanese One Piece booster box",
      "OP card game Japanese",
      "buy Japanese One Piece cards online",
      "One Piece sealed case Japanese",
      "Akihabara One Piece cards",
    ],
    h1: "Japanese One Piece Card Game",
    eyebrow: "One Piece Card Game · Direct from Japan",
    intro:
      "The One Piece Card Game has become one of the most sought-after trading card games in the world, and Japanese-language product leads the market. We stock {count} authentic Japanese One Piece products direct from Akihabara — from the latest OP-series booster boxes and complete sealed display cases to special sets and promos. Japanese One Piece boxes release months ahead of English sets, often feature exclusive Japanese artwork, and are the preferred choice for collectors chasing the newest cards first. Everything is factory sealed, sourced from authorized Japanese distributors, and shipped worldwide with tracking and protective packaging. Enjoy free shipping on orders over $500 plus our 100% authenticity guarantee and 30-day returns on sealed products.",
    sectionOrder: ["Sealed Case", "Booster Boxes", "Special Set"],
    sectionTitles: {
      "Sealed Case": "One Piece Sealed Cases",
      "Booster Boxes": "One Piece Booster Boxes",
      "Special Set": "One Piece Special Sets",
    },
    sectionDescriptions: {
      "Sealed Case":
        "Complete sealed display cases — the best per-box pricing for collectors, stores and serious players.",
      "Booster Boxes":
        "Factory-sealed Japanese One Piece booster boxes from OP-07 through the newest expansions.",
      "Special Set":
        "Special sets and collections, including Japanese-exclusive releases.",
    },
    heroImage:
      "/images/existing/5942991877667752868_121-1024x579.webp",
  },

  "Other TCG": {
    key: "Other TCG",
    slug: "/japanese-tcg",
    metaTitle:
      "Japanese TCG — Weiss Schwarz, Union Arena, Dragon Ball, Gundam | Akihabara",
    metaDescription:
      "Authentic Japanese trading card games: Weiss Schwarz, Union Arena, Dragon Ball Fusion World, Gundam, Disney Lorcana & hololive. Direct from Akihabara, ships worldwide.",
    keywords: [
      "Japanese TCG",
      "Weiss Schwarz cards",
      "Union Arena cards",
      "Dragon Ball Fusion World",
      "Gundam card game",
      "Disney Lorcana Japanese",
      "hololive card game",
      "Japanese trading card games online",
      "Akihabara TCG shop",
    ],
    h1: "Japanese Trading Card Games — Weiss Schwarz, Union Arena, Dragon Ball & More",
    eyebrow: "Japanese TCG Brands · Direct from Japan",
    intro:
      "Beyond Pokémon and One Piece, Japan produces some of the most exciting trading card games on the planet — and we stock them all direct from Akihabara. This collection brings together {count} products from Weiss Schwarz, Union Arena, Dragon Ball Fusion World, the Gundam Card Game, Disney Lorcana, hololive and other sought-after Japanese titles. Whether you are hunting anime crossover sets from Weiss Schwarz, tournament staples from Union Arena, or collector-favorite Dragon Ball and Gundam releases, every item is factory sealed and sourced from authorized Japanese distributors. All orders ship worldwide with tracking, free shipping applies over $500, and our 100% authenticity guarantee covers everything we sell.",
    sectionTitles: {
      "hololive CG": "hololive Card Game",
      "Union Arena": "Union Arena",
      "Dragon Ball": "Dragon Ball Fusion World",
      Gundam: "Gundam Card Game",
      "Weiss Schwarz": "Weiss Schwarz",
      Lorcana: "Disney Lorcana",
      Lycee: "Lycee TCG",
      OSICA: "OSICA (Oshi no Ko)",
    },
    sectionDescriptions: {
      "Weiss Schwarz":
        "The original anime crossover card game from Bushiroad, spanning hit franchises with English and Japanese releases.",
      "Union Arena":
        "Bandai's crossover TCG featuring characters from the world's biggest anime and manga franchises.",
      "Dragon Ball":
        "Dragon Ball Fusion World booster boxes and sets — the modern Dragon Ball card game format.",
      "Gundam":
        "Gundam Card Game products direct from Japan, sealed and collector-ready.",
      Lorcana:
        "Disney Lorcana sealed products — the collectible Disney TCG taking the world by storm.",
      "hololive CG":
        "hololive Card Game sets featuring VTuber talents from Hololive Production.",
    },
    heroImage: "/images/existing/UNI.jpg",
  },
};

/* ── Metadata factory used by the route files ── */

export function categoryMetadata(category: string): Metadata {
  const cfg = CATEGORY_CONFIG[category];
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
      siteName: "Akihabara TCG Warehouse",
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

export default function CategoryLanding({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category];
  if (!cfg) return null;

  const products = categoryProducts(category);
  const groups = groupBySubcategory(products, cfg.sectionOrder);
  const otherCategories = Object.values(CATEGORY_CONFIG).filter(
    (c) => c.key !== category
  );
  const intro = cfg.intro.replace("{count}", String(products.length));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cfg.h1,
    description: cfg.metaDescription,
    url: `${SITE_URL}${cfg.slug}${URL_TRAILING}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Akihabara TCG Warehouse",
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
              <span className="bg-white/10 backdrop-blur-sm text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-white/20">
                {products.length} products in stock
              </span>
              <span className="bg-white/10 backdrop-blur-sm text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-white/20">
                100% authentic
              </span>
              <span className="bg-white/10 backdrop-blur-sm text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-white/20">
                Free shipping over $500
              </span>
              <span className="bg-white/10 backdrop-blur-sm text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-white/20">
                Ships worldwide
              </span>
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
              Explore More Japanese TCG Collections
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
              ← Browse the complete catalog of {allProducts.length} authentic
              Japanese TCG products
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-purple-950 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.webp"
                  alt="Akihabara TCG Warehouse logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-extrabold font-[family-name:var(--font-montserrat)]">
                  AKIHABARA TCG WAREHOUSE
                </span>
              </div>
              <p className="text-[12px] text-violet-300">
                Authentic Japanese TCG cards · Direct from Akihabara, Tokyo ·
                Ships worldwide
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
          alt={`${p.title} — Japanese ${p.category} ${p.subcategory || "TCG"}`}
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
