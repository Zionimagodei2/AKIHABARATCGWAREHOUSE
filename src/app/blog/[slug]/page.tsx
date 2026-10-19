import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, POST_SLUGS, type BlogPost } from "@/lib/blog-data";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";

/* Blog article — /blog/<slug>/  (Article + FAQPage schema) */

export function generateStaticParams() {
  return POST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = POSTS[slug];
  if (!p) return {};
  const url = `${SITE_URL}/blog/${p.slug}${URL_TRAILING}`;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: p.metaTitle,
      description: p.metaDescription,
      type: "article",
      url,
      siteName: "Akihabara TCG Warehouse",
      publishedTime: p.datePublished,
    },
    twitter: {
      card: "summary",
      title: p.metaTitle,
      description: p.metaDescription,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p: BlogPost | undefined = POSTS[slug];
  if (!p) notFound();

  const url = `${SITE_URL}/blog/${p.slug}${URL_TRAILING}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.h1,
    description: p.metaDescription,
    datePublished: p.datePublished,
    author: { "@type": "Organization", name: "Akihabara TCG Warehouse" },
    publisher: { "@type": "Organization", name: "Akihabara TCG Warehouse" },
    mainEntityOfPage: url,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const related = Object.values(POSTS).filter((r) => r.slug !== p.slug);

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
                <Link href="/blog/" className="hover:text-purple-700">Blog</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-purple-900 font-medium">{p.h1}</li>
            </ol>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-[13px] text-gray-400 mb-3">
            By the Akihabara TCG Warehouse team · {p.datePublished} ·{" "}
            {p.readMinutes} min read
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-6">
            {p.h1}
          </h1>

          <div className="text-[16px] text-gray-700 leading-relaxed mb-8 space-y-4">
            {p.intro.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {p.sections.map((s, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-3">
                {s.h}
              </h2>
              <div className="text-[15px] text-gray-700 leading-relaxed space-y-3">
                {s.paragraphs.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-3">
              The bottom line
            </h2>
            <div className="text-[15px] text-gray-700 leading-relaxed space-y-3">
              {p.takeaway.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          <aside className="bg-purple-950 text-white rounded-2xl p-6 sm:p-8 my-10 text-center">
            <h2 className="text-xl font-extrabold mb-2">
              Put it into practice
            </h2>
            <p className="text-[14px] text-purple-200 mb-5">
              Browse our sealed Japanese and English TCG — every box authentic,
              sourced direct from Japan.
            </p>
            <Link
              href="/"
              className="inline-block bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-[15px] px-6 py-3 rounded-xl transition-colors"
            >
              Shop sealed product
            </Link>
          </aside>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-5">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {p.faqs.map((f) => (
                <div key={f.q} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-[15px] font-bold text-purple-950 mb-1.5">{f.q}</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <nav className="mb-8">
              <h2 className="text-lg font-extrabold text-purple-950 mb-3">
                Keep reading
              </h2>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}/`}
                    className="text-[13px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full px-4 py-2 transition-colors"
                  >
                    {r.h1}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </article>
      </div>
    </>
  );
}
