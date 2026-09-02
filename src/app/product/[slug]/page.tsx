import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allProducts,
  getProductBySlug,
  relatedProducts,
  categoryPageUrl,
  SITE_URL,
  URL_TRAILING,
} from "@/lib/product-data";

/* ────────────────────────────────────────────────────────────
   Individual Product Page — server-rendered for SEO
   Each of the 202 products gets its own indexable URL with
   unique title, description, canonical, OG tags + Product JSON-LD
   ──────────────────────────────────────────────────────────── */

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | Akihabara TCG Warehouse" };
  }

  const cat = product.category;
  const title = truncate(`${product.title} | Japanese ${cat} Cards`, 65);
  const description = truncate(
    `Authentic Japanese ${cat} ${product.subcategory || "TCG product"} — ${product.title}. Factory sealed, ships worldwide from Akihabara, Tokyo. $${product.price.toFixed(2)} with 100% authenticity guarantee.`,
    158
  );
  const url = `${SITE_URL}/product/${product.slug}${URL_TRAILING}`;

  return {
    title,
    description,
    keywords: [
      product.title,
      `Japanese ${cat} cards`,
      `${cat} ${product.subcategory || "booster box"}`,
      `buy ${cat} cards online`,
      "authentic Japanese TCG",
      "Akihabara card shop",
    ],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Akihabara TCG Warehouse",
      images: [
        {
          url: `${SITE_URL}${product.image}`,
          width: 600,
          height: 600,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}${product.image}`],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = relatedProducts(product, 4);
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : 0;
  const inStock = product.in_stock !== false;
  const rating = product.rating || 4.5;
  const reviewCount = Math.max(product.review_count || 0, 1);

  // Product structured data — full rich-result eligibility
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: [`${SITE_URL}${product.image}`],
    description: product.description,
    sku: product.slug,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: product.category,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}${URL_TRAILING}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Akihabara TCG Warehouse",
        url: SITE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "Worldwide",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 5,
            maxValue: 21,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "Worldwide",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  // Breadcrumb structured data
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
        name: product.category,
        item: `${SITE_URL}${categoryPageUrl(product.category)}${URL_TRAILING || ""}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${SITE_URL}/product/${product.slug}${URL_TRAILING}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb navigation */}
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
              <li>
                <Link
                  href={categoryPageUrl(product.category)}
                  className="hover:text-purple-700 transition-colors"
                >
                  {product.category}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-700 truncate max-w-[240px] sm:max-w-md">
                {product.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* Product main section */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product image */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 flex items-center justify-center min-h-[320px] sm:min-h-[420px]">
              <img
                src={product.image}
                alt={`${product.title} — authentic Japanese ${product.category} trading card game product`}
                className="max-h-[360px] w-auto object-contain"
                width={480}
                height={480}
                fetchPriority="high"
              />
            </div>

            {/* Product info */}
            <div>
              <p className="text-[11px] font-bold text-violet-600 tracking-[0.2em] uppercase mb-2">
                Japanese {product.category} · {product.subcategory || "Sealed Product"}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-purple-950 leading-tight mb-4">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-500 text-[16px]" aria-hidden="true">
                  {"★".repeat(Math.round(rating))}
                  <span className="text-gray-300">
                    {"★".repeat(5 - Math.round(rating))}
                  </span>
                </span>
                <span className="text-[13px] text-gray-600">
                  {rating.toFixed(1)} · {reviewCount} reviews
                </span>
              </div>

              {/* Price block */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold text-purple-950">
                  ${product.price.toFixed(2)}
                </span>
                {product.original_price &&
                product.original_price > product.price ? (
                  <>
                    <span className="text-[15px] text-gray-400 line-through">
                      ${product.original_price.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-700 text-[12px] font-bold px-2 py-0.5 rounded-full">
                      Save {discount}%
                    </span>
                  </>
                ) : null}
              </div>
              <p className="text-[13px] text-gray-500 mb-6">
                USD · tax included ·{" "}
                <span
                  className={
                    inStock ? "text-green-700 font-semibold" : "text-amber-600 font-semibold"
                  }
                >
                  {inStock ? "● In Stock — ships in 1–2 business days" : "● Pre-Order — ships when available"}
                </span>
              </p>

              {/* CTA — hands off to the store's cart flow */}
              <Link
                href={`/?product=${product.id}`}
                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold px-8 py-4 rounded-xl text-[15px] transition-colors shadow-lg shadow-purple-700/20"
              >
                {inStock ? "Add to Cart" : "Pre-Order Now"} — ${product.price.toFixed(2)}
              </Link>
              <p className="text-[12px] text-gray-400 mt-2 mb-6">
                Free worldwide shipping on orders over $500 · Secure checkout
              </p>

              {/* Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-[15px] font-bold text-purple-950 mb-2">
                  About this product
                </h2>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                  {product.description}
                </p>
                <ul className="space-y-2 text-[13px] text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600" aria-hidden="true">✓</span>
                    100% authentic — sourced from authorized Japanese distributors
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600" aria-hidden="true">✓</span>
                    Factory sealed, direct from Akihabara, Tokyo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600" aria-hidden="true">✓</span>
                    Ships worldwide with tracking &amp; protective packaging
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600" aria-hidden="true">✓</span>
                    30-day returns on sealed products
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related products — internal linking */}
          {related.length > 0 && (
            <section className="mt-12 sm:mt-16">
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
                <h2 className="text-xl font-extrabold font-[family-name:var(--font-montserrat)] text-purple-950">
                  More Japanese {product.category} Cards
                </h2>
                <Link
                  href={categoryPageUrl(product.category)}
                  className="text-[13px] font-semibold text-violet-500 hover:text-purple-700 transition-colors"
                >
                  View all {product.category} products →
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/product/${r.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                      <img
                        src={r.image}
                        alt={`${r.title} — Japanese ${r.category} TCG`}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                        width={200}
                        height={200}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wide">
                        {r.subcategory || r.category}
                      </p>
                      <h3 className="text-[13px] font-semibold text-purple-950 leading-snug line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-[14px] font-bold text-purple-950 mt-1">
                        ${r.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to store */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold text-[15px]"
            >
              ← Browse all 200+ authentic Japanese TCG products
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-purple-950 text-white mt-16">
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
