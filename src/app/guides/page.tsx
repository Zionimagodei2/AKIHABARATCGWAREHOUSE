import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";
import { getPublishedContent } from "@/lib/site-content";

/* Guides index — /guides/ (copy from the published guides content key) */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { guides } = await getPublishedContent();
  return {
    title: guides.index.metaTitle,
    description: guides.index.metaDescription,
    alternates: { canonical: `${SITE_URL}/guides${URL_TRAILING}` },
    robots: { index: true, follow: true },
  };
}

export default async function GuidesIndexPage() {
  const { guides } = await getPublishedContent();
  const items = Object.values(guides.items);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-[11px] font-bold text-purple-600 tracking-[0.2em] uppercase mb-3">
          {guides.index.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-4">
          {guides.index.title}
        </h1>
        <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
          {guides.index.intro}
        </p>
        <div className="space-y-4">
          {items.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}/`}
              className="block bg-white rounded-2xl border border-gray-200 hover:border-purple-400 p-6 transition-colors"
            >
              <h2 className="text-[18px] font-extrabold text-purple-950 leading-snug mb-2">
                {g.h1}
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {g.metaDescription}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
