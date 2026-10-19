import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GUIDES,
  GUIDE_SLUGS,
  type Guide,
} from "@/lib/content-data";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";

/* ────────────────────────────────────────────────────────────
   Buying guides — /guides/<slug>/  (Article + FAQPage schema)
   ──────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES[slug];
  if (!g) return {};
  const url = `${SITE_URL}/guides/${g.slug}${URL_TRAILING}`;
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: g.metaTitle,
      description: g.metaDescription,
      type: "article",
      url,
      siteName: "Akihabara TCG Warehouse",
    },
    twitter: {
      card: "summary",
      title: g.metaTitle,
      description: g.metaDescription,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g: Guide | undefined = GUIDES[slug];
  if (!g) notFound();

  const url = `${SITE_URL}/guides/${g.slug}${URL_TRAILING}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.h1,
    description: g.metaDescription,
    datePublished: "2026-10-05",
    author: { "@type": "Organization", name: "Akihabara TCG Warehouse" },
    publisher: { "@type": "Organization", name: "Akihabara TCG Warehouse" },
    mainEntityOfPage: url,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
                <Link href="/guides/" className="hover:text-purple-700">Guides</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-purple-900 font-medium">{g.h1}</li>
            </ol>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-2">
            {g.h1}
          </h1>
          <p className="text-[13px] text-gray-400 mb-8">{g.meta}</p>

          <div
            className="text-[16px] text-gray-700 leading-relaxed mb-8 [&_strong]:text-purple-950"
            dangerouslySetInnerHTML={{ __html: g.introHtml }}
          />

          {g.sections.map((s, i) => (
            <section key={i} className="mb-8">
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
            <h2 className="text-xl font-extrabold mb-2">{g.ctaTitle}</h2>
            <p className="text-[14px] text-purple-200 mb-5">{g.ctaSub}</p>
            <Link
              href={g.ctaHref}
              className="inline-block bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-[15px] px-6 py-3 rounded-xl transition-colors"
            >
              {g.ctaLabel}
            </Link>
          </aside>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-5">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {g.faqs.map((f) => (
                <div key={f.q} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-[15px] font-bold text-purple-950 mb-1.5">{f.q}</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <nav className="flex flex-wrap gap-2 mb-8">
            {g.related.map((r) => (
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
            © Akihabara TCG Warehouse. Educational guide — apply these checks to
            every seller, including us.
          </p>
        </article>
      </div>
    </>
  );
}
