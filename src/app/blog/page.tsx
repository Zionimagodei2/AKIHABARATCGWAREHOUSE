import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/blog-data";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";

/* Blog index — /blog/ */

export const metadata: Metadata = {
  title: "TCG Blog: Collecting Advice from the Shop Floor",
  description:
    "Honest TCG collecting advice from Akihabara TCG Warehouse: Japanese vs English, pre-order timing, spotting fakes, and set breakdowns.",
  alternates: { canonical: `${SITE_URL}/blog${URL_TRAILING}` },
  robots: { index: true, follow: true },
};

export default function BlogIndexPage() {
  const posts = Object.values(POSTS).sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished)
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-[11px] font-bold text-purple-600 tracking-[0.2em] uppercase mb-3">
          Blog
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-4">
          From the Shop Floor
        </h1>
        <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
          What we&apos;ve learned selling Japanese and English TCG sealed
          product every day: which sets are worth your money, how release
          pricing actually behaves, and the mistakes we watch collectors make.
          No fluff — if an article doesn&apos;t help you decide something, we
          don&apos;t publish it.
        </p>
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}/`}
              className="block bg-white rounded-2xl border border-gray-200 hover:border-purple-400 p-6 transition-colors"
            >
              <p className="text-[12px] text-gray-400 mb-1.5">
                {p.datePublished} · {p.readMinutes} min read
              </p>
              <h2 className="text-[18px] font-extrabold text-purple-950 leading-snug mb-2">
                {p.h1}
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {p.metaDescription}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
