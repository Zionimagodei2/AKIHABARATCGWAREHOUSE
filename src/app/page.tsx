import TCGStore from "@/components/tcg-store";
import { SITE_URL, URL_TRAILING, type Product } from "@/lib/product-data";
import { getPublishedCatalog, getPublishedContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, content] = await Promise.all([
    getPublishedCatalog(),
    getPublishedContent(),
  ]);
  const { settings } = content;

  // SEO/perf: server-render only the first catalog page (24 products) in the
  // initial HTML. The client hydrates the full catalog from /products.json.
  // Crawlers still reach every product via the sitemap and category pages.
  const firstPage = products.slice(0, 24);

  // Product structured data — top products by rating for rich results
  // (price, availability & rating stars in search results)
  const topProducts = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 24);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Japanese & English TCG Products — ${settings.siteName}`,
    description:
      "Authentic Japanese and English trading card games: Pokemon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam and Disney Lorcana booster boxes, sealed cases and elite trainer boxes. Direct from Japan, ships worldwide.",
    numberOfItems: products.length,
    itemListElement: topProducts.map((p: Product, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.title,
        image: `${SITE_URL}${p.image}`,
        description: p.description,
        url: `${SITE_URL}/product/${p.slug}${URL_TRAILING}`,
        category: p.category,
        brand: {
          "@type": "Brand",
          name: settings.siteName,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: p.rating || 4.5,
          reviewCount: Math.max(p.review_count || 0, 1),
          bestRating: 5,
          worstRating: 1,
        },
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${p.slug}${URL_TRAILING}`,
          priceCurrency: "USD",
          price: p.price,
          availability: p.in_stock === false
            ? "https://schema.org/PreOrder"
            : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: settings.siteName,
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "Worldwide",
            },
          },
        },
      },
    })),
  };

  // FAQPage structured data — built from the published FAQ content,
  // so it always matches the visible FAQ page.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((f: { q: string; a: string }) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // Organization + WebSite structured data (P6 trust schema).
  // sameAs social links pending — client to provide Facebook/TikTok/Instagram URLs.
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: SITE_URL,
    logo: `${SITE_URL}/store-logo.webp`,
    description:
      "Authentic Japanese & English trading card games, sourced directly from authorized Japanese distributors and shipped worldwide.",
    email: settings.storeEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Akihabara, Tokyo",
      addressCountry: "JP",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <TCGStore initialProducts={firstPage} initialTotal={products.length} />
    </>
  );
}
