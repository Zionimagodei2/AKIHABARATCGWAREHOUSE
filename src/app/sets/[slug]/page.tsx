import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SET_HUBS,
  SET_SLUGS,
  type SetHub,
} from "@/lib/content-data";
import {
  getProductBySlug,
  SITE_URL,
  URL_TRAILING,
} from "@/lib/product-data";

/* ────────────────────────────────────────────────────────────
   Set hub pages — /sets/<slug>/
   Editorial set guides with CollectionPage + FAQPage schema,
   product cards linking to the store's live listings.
   ──────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return SET_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hub = SET_HUBS[slug];
  if (!hub) return {};
  const url = `${SITE_URL}/sets/${hub.slug}${URL_TRAILING}`;
  return {
    title: hub.metaTitle,
    description: hub.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: hub.metaTitle,
      description: hub.metaDescription,
      type: "article",
      url,
      siteName: "Akihabara TCG Warehouse",
    },
    twitter: {
      card: "summary",
      title: hub.metaTitle,
      description: hub.metaDescription,
    },
  };
}

function ProductCard({ slug }: { slug: string }) {
  const p = getProductBySlug(slug);
  if (!p) return null;
  return (
    <Link
      href={`/product/${p.slug}/`}
      className="flex items-center gap-4 bg-white rounded-xl border border-purple-100 hover:border-purple-400 p-4 transition-colors"
    >
      {p.image && (
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          decoding="async"
          className="w-20 h-20 object-contain shrink-0"
        />
      )}
      <span>
        <span className="block text-[14px] font-semibold text-purple-950 leading-snug">
          {p.title}
        </span>
        <span className="block text-[16px] font-extrabold text-purple-700 mt-1">
          ${p.price.toFixed(2)}
        </span>
        <span className="block text-[13px] text-purple-600 font-semibold mt-0.5">
          View product →
        </span>
      </span>
    </Link>
  );
}

export default async function SetHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hub: SetHub | undefined = SET_HUBS[slug];
  if (!hub) notFound();

  const url = `${SITE_URL}/sets/${hub.slug}${URL_TRAILING}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.metaTitle,
    description: hub.metaDescription,
    url,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hub.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Set Guides",
        item: `${SITE_URL}/sets${URL_TRAILING}`,
      },
      { "@type": "ListItem", position: 3, name: hub.h1, item: url },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <ol className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap">
              <li>
                <Link href="/" className="hover:text-purple-700">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/sets/" className="hover:text-purple-700">Set Guides</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-purple-900 font-medium">{hub.h1}</li>
            </ol>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-[11px] font-bold text-purple-600 tracking-[0.2em] uppercase mb-3">
            {hub.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-6">
            {hub.h1}
          </h1>

          <div
            className="text-[16px] text-gray-700 leading-relaxed mb-8 [&_strong]:text-purple-950"
            dangerouslySetInnerHTML={{ __html: hub.introHtml }}
          />

          <dl className="bg-purple-50 border border-purple-100 rounded-xl p-5 sm:p-6 mb-10 grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {hub.facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] font-bold text-purple-600 uppercase tracking-wide">
                  {k}
                </dt>
                <dd className="text-[14px] text-gray-800 font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          {hub.sections.map((s) => (
            <section key={s.heading} className="mb-8">
              {s.heading && (
                <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-3">
                  {s.heading}
                </h2>
              )}
              <div
                className="text-[15px] text-gray-700 leading-relaxed [&_strong]:text-purple-950"
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
            </section>
          ))}

          <aside className="bg-purple-950 text-white rounded-2xl p-6 sm:p-8 my-10 text-center">
            <h2 className="text-xl font-extrabold mb-2">{hub.ctaTitle}</h2>
            <p className="text-[14px] text-purple-200 mb-5">{hub.ctaSub}</p>
            <div className="grid sm:grid-cols-2 gap-3 text-left">
              {hub.productSlugs.map((s) => (
                <ProductCard key={s} slug={s} />
              ))}
            </div>
          </aside>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-5">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {hub.faqs.map((f) => (
                <div key={f.q} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-[15px] font-bold text-purple-950 mb-1.5">{f.q}</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <nav className="flex flex-wrap gap-2 mb-8">
            {hub.related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="text-[13px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-full px-4 py-2 transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </nav>

          <p className="text-[12px] text-gray-400 border-t border-gray-200 pt-4">
            © Akihabara TCG Warehouse. {hub.sourceNote}
          </p>
        </article>
      </div>
    </>
  );
}
