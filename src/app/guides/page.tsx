import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/content-data";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";

/* Guides index — /guides/ */

export const metadata: Metadata = {
  title: "TCG Buying Guides: Fakes, Japanese vs English & More",
  description:
    "Practical TCG buying guides: spotting fake Japanese Pokémon cards, Japanese vs English compared, and buying One Piece cards safely online.",
  alternates: { canonical: `${SITE_URL}/guides${URL_TRAILING}` },
  robots: { index: true, follow: true },
};

export default function GuidesIndexPage() {
  const guides = Object.values(GUIDES);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-[11px] font-bold text-purple-600 tracking-[0.2em] uppercase mb-3">
          Editorial
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-4">
          TCG Buying Guides
        </h1>
        <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
          Practical, no-nonsense guides for collectors: how to avoid fakes,
          what actually differs between Japanese and English product, and how
          to buy safely online.
        </p>
        <div className="space-y-4">
          {guides.map((g) => (
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
