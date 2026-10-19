import type { Metadata } from "next";
import Link from "next/link";
import { SET_HUBS, SET_INDEX } from "@/lib/content-data";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";

/* Set hub index — /sets/ */

export const metadata: Metadata = {
  title: SET_INDEX.metaTitle,
  description: SET_INDEX.metaDescription,
  alternates: { canonical: `${SITE_URL}/sets${URL_TRAILING}` },
  robots: { index: true, follow: true },
};

export default function SetsIndexPage() {
  const hubs = Object.values(SET_HUBS);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-[11px] font-bold text-purple-600 tracking-[0.2em] uppercase mb-3">
          Editorial
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-4">
          TCG Set Guides
        </h1>
        <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
          In-depth guides to the sets that matter: release dates, box
          configurations, new rarities and chase cards — with links to buy
          authentic sealed product direct from Japan.
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
