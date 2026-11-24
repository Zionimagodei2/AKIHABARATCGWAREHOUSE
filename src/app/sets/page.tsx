import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";
import { getPublishedContent } from "@/lib/site-content";

/* Set hub index — /sets/ (copy from the published sets content key) */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { sets } = await getPublishedContent();
  return {
    title: sets.index.metaTitle,
    description: sets.index.metaDescription,
    alternates: { canonical: `${SITE_URL}/sets${URL_TRAILING}` },
    robots: { index: true, follow: true },
  };
}

export default async function SetsIndexPage() {
  const { sets } = await getPublishedContent();
  const hubs = Object.values(sets.hubs);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-[11px] font-bold text-purple-600 tracking-[0.2em] uppercase mb-3">
          {sets.index.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-4">
          {sets.index.title}
        </h1>
        <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
          {sets.index.intro}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {hubs.map((h) => (
            <Link
              key={h.slug}
              href={`/sets/${h.slug}/`}
              className="bg-white rounded-2xl border border-gray-200 hover:border-purple-400 p-6 transition-colors"
            >
              <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wide mb-2">
                {h.eyebrow}
              </p>
              <h2 className="text-[17px] font-extrabold text-purple-950 leading-snug mb-2">
                {h.h1}
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {h.metaDescription}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/release-calendar/"
            className="text-[13px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-full px-4 py-2 transition-colors"
          >
            TCG release calendar
          </Link>
          <Link
            href="/guides/"
            className="text-[13px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-full px-4 py-2 transition-colors"
          >
            Buying guides
          </Link>
        </div>
      </div>
    </div>
  );
}
