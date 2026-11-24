import type { Metadata } from "next";
import Link from "next/link";
import type { CalendarEntry } from "@/lib/content-data";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";
import { getPublishedContent } from "@/lib/site-content";

/* Release calendar — /release-calendar/ (copy from the published
   calendar content key; entries included) */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { calendar, settings } = await getPublishedContent();
  return {
    title: calendar.metaTitle,
    description: calendar.metaDescription,
    alternates: { canonical: `${SITE_URL}/release-calendar${URL_TRAILING}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: calendar.ogTitle,
      description: calendar.ogDescription,
      type: "article",
      url: `${SITE_URL}/release-calendar${URL_TRAILING}`,
      siteName: settings.siteName,
    },
  };
}

function CalendarTable({ entries }: { entries: CalendarEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 mb-10">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="bg-purple-950 text-white text-left">
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Set</th>
            <th className="px-4 py-3 font-semibold">Game</th>
            <th className="px-4 py-3 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {entries.map((e) => (
            <tr key={e.set} className="border-t border-gray-100">
              <td className="px-4 py-3 font-bold text-purple-950 whitespace-nowrap">
                {e.date}
                {e.soon && (
                  <span className="ml-2 inline-block text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                    This month
                  </span>
                )}
                {e.unconfirmed && (
                  <span className="ml-2 inline-block text-[11px] font-bold bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                    Unconfirmed
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-semibold text-gray-800">
                {e.href ? (
                  <Link href={e.href} className="text-purple-700 hover:text-purple-900">
                    {e.set}
                  </Link>
                ) : (
                  e.set
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{e.game}</td>
              <td className="px-4 py-3 text-gray-600">{e.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ReleaseCalendarPage() {
  const { calendar, settings } = await getPublishedContent();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: calendar.ogTitle,
    description: calendar.articleDescription,
    datePublished: "2026-10-05",
    author: { "@type": "Organization", name: settings.siteName },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: calendar.faqs.map((f) => ({
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-[11px] font-bold text-purple-600 tracking-[0.2em] uppercase mb-3">
            {calendar.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-2">
            {calendar.title}
          </h1>
          <p className="text-[13px] text-gray-400 mb-6">
            {calendar.updatedLine}
          </p>
          <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
            {calendar.intro}
          </p>

          <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-4">
            {calendar.upcomingTitle}
          </h2>
          <CalendarTable entries={calendar.upcoming} />

          <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-4">
            {calendar.recentTitle}
          </h2>
          <CalendarTable entries={calendar.recent} />

          <aside className="bg-purple-950 text-white rounded-2xl p-6 sm:p-8 my-10 text-center">
            <h2 className="text-xl font-extrabold mb-2">{calendar.ctaTitle}</h2>
            <p className="text-[14px] text-purple-200 mb-5">
              {calendar.ctaText}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/one-piece-cards/"
                className="bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors"
              >
                Shop One Piece →
              </Link>
              <Link
                href="/pokemon-cards/"
                className="bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors"
              >
                Shop Pokémon →
              </Link>
            </div>
          </aside>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-5">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {calendar.faqs.map((f) => (
                <div key={f.q} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-[15px] font-bold text-purple-950 mb-1.5">
                    {f.q}
                  </h3>
                  <p className="text-[14px] text-gray-600">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-[12px] text-gray-400 border-t border-gray-200 pt-4">
            © {settings.siteName}. {calendar.footnote}
          </p>
        </div>
      </div>
    </>
  );
}
