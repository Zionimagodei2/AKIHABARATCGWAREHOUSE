import TCGStore from "@/components/tcg-store";
import { allProducts, SITE_URL, URL_TRAILING, type Product } from "@/lib/product-data";

export default function Home() {
  const products = allProducts;

  // Product structured data — top products by rating for rich results
  // (price, availability & rating stars in search results)
  const topProducts = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 24);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Japanese & English TCG Products — Akihabara TCG Warehouse",
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
          name: "Akihabara TCG Warehouse",
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
            name: "Akihabara TCG Warehouse",
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

  // FAQPage structured data — matches the visible FAQ content on the site
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        q: "Are your products authentic?",
        a: "Yes, 100%. Every product we sell is sourced directly from authorized Japanese distributors and verified through trusted third-party channels. We do not sell counterfeits or resealed products — ever.",
      },
      {
        q: "Do you sell individual cards or singles?",
        a: "Yes, we carry a selection of singles and graded cards. Our primary focus is sealed products (booster boxes, elite trainer boxes, sealed cases), but we do offer high-demand singles and PSA-graded cards.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for wholesale orders. All transactions are processed through secure, encrypted payment gateways.",
      },
      {
        q: "How long does shipping take?",
        a: "Standard international shipping takes 10–21 business days. Express shipping takes 5–10 business days. Delivery times may vary depending on your country's customs processing.",
      },
      {
        q: "Do you offer wholesale pricing?",
        a: "Yes! We offer competitive wholesale pricing on bulk orders and sealed cases. Contact us at support@akihabaratcgwarehouse.com with details about what you need and we'll send you a custom quote.",
      },
      {
        q: "What if my order arrives damaged?",
        a: "We take great care in packaging, but if your order arrives damaged, contact us within 48 hours with photos and we'll arrange a replacement or full refund.",
      },
      {
        q: "Can I return or exchange a product?",
        a: "We accept returns within 30 days of delivery for sealed, unopened products in their original condition. Opened products are not eligible for return. See our full return policy for details.",
      },
      {
        q: "How are your prices so much lower than other shops?",
        a: "We source directly from Japanese distributors and operate with lower overhead than most Western retailers. We pass those savings on to our customers. Our products are the exact same authentic items you'd find elsewhere — just at better prices.",
      },
      {
        q: "Do you restock sold-out items?",
        a: "We restock popular items regularly, but some limited-edition products may not be restocked once they sell out. Sign up for our newsletter or follow us on social media to get restock alerts.",
      },
      {
        q: "Is it safe to order from overseas?",
        a: "Absolutely. We use SSL encryption on our website, process payments through secure gateways, and ship with full tracking. We've successfully delivered thousands of orders to customers in over 50 countries.",
      },
    ].map((f: { q: string; a: string }) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <TCGStore initialProducts={products} />
    </>
  );
}
