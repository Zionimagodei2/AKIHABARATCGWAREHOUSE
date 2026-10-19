import type { Metadata } from "next";
import Link from "next/link";
import {
  CALENDAR_UPCOMING,
  CALENDAR_RECENT,
} from "@/lib/content-data";
import { SITE_URL, URL_TRAILING } from "@/lib/product-data";

/* Release calendar — /release-calendar/ */

export const metadata: Metadata = {
  title: "TCG Release Calendar: Pokémon, One Piece, Dragon Ball",
  description:
    "Every upcoming Japanese & English TCG release: dates for Pokémon, One Piece Card Game and Dragon Ball Fusion World sets. Updated monthly.",
  alternates: { canonical: `${SITE_URL}/release-calendar${URL_TRAILING}` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "TCG Release Calendar 2026–2027",
    description:
      "Release dates for upcoming Pokémon, One Piece and Dragon Ball TCG sets — Japanese and English. Bookmark and check monthly.",
    type: "article",
    url: `${SITE_URL}/release-calendar${URL_TRAILING}`,
    siteName: "Akihabara TCG Warehouse",
  },
};

function CalendarTable({
  entries,
}: {
  entries: typeof CALENDAR_UPCOMING;
}) {
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

export default function ReleaseCalendarPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "TCG Release Calendar 2026–2027",
    description:
      "Release dates for upcoming Pokémon, One Piece Card Game and Dragon Ball Fusion World TCG sets.",
    datePublished: "2026-10-05",
    author: { "@type": "Organization", name: "Akihabara TCG Warehouse" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the next One Piece Card Game set?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EB-05 One Piece Heroines Edition vol.2 releases October 30, 2026, followed by OP-18 The Dominance of God on November 20, 2026.",
        },
      },
      {
        "@type": "Question",
        name: "What is the next Dragon Ball Fusion World set?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FB11 Brightness of Hope released October 16, 2026; FB12 Reach the God follows on December 18, 2026.",
        },
      },
      {
        "@type": "Question",
        name: "When should I pre-order a new TCG set?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "As early as possible — Japanese distributor allocation for hyped sets often sells through before street date. Pre-ordering locks in release pricing instead of aftermarket pricing.",
        },
      },
    ],
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
            Editorial
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 leading-tight mb-2">
            TCG Release Calendar 2026–2027
          </h1>
          <p className="text-[13px] text-gray-400 mb-6">
            Updated October 5, 2026 · Japanese & English releases · Bookmark this
            page — we update it monthly
          </p>
          <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
            Every confirmed upcoming release for Pokémon, the One Piece Card
            Game and Dragon Ball Super Card Game Fusion World. Dates are from
            official publisher announcements; anything unconfirmed is marked.
          </p>

          <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-4">
            Upcoming releases
          </h2>
          <CalendarTable entries={CALENDAR_UPCOMING} />

          <h2 className="text-xl sm:text-2xl font-extrabold text-purple-950 mb-4">
            Recent releases
          </h2>
          <CalendarTable entries={CALENDAR_RECENT} />

          <aside className="bg-purple-950 text-white rounded-2xl p-6 sm:p-8 my-10 text-center">
            <h2 className="text-xl font-extrabold mb-2">Never miss a release.</h2>
            <p className="text-[14px] text-purple-200 mb-5">
              Pre-order sealed Japanese boxes direct from Japan — before
              allocation sells out.
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
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[15px] font-bold text-purple-950 mb-1.5">
                  What is the next One Piece Card Game set?
                </h3>
                <p className="text-[14px] text-gray-600">
                  EB-05 Heroines Edition vol.2 on October 30, 2026, then OP-18
                  The Dominance of God on November 20, 2026.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[15px] font-bold text-purple-950 mb-1.5">
                  What is the next Dragon Ball Fusion World set?
                </h3>
                <p className="text-[14px] text-gray-600">
                  FB11 Brightness of Hope (October 16, 2026), then FB12 Reach
                  the God (December 18, 2026).
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[15px] font-bold text-purple-950 mb-1.5">
                  When should I pre-order?
                </h3>
                <p className="text-[14px] text-gray-600">
                  As early as possible. Japanese allocation for hyped sets
                  routinely sells through before street date — pre-ordering
                  locks in release pricing instead of aftermarket pricing.
                </p>
              </div>
            </div>
          </section>

          <p className="text-[12px] text-gray-400 border-t border-gray-200 pt-4">
            © Akihabara TCG Warehouse. Dates from official Bandai / Pokémon
            announcements; unconfirmed dates are marked and updated as announced.
          </p>
        </div>
      </div>
    </>
  );
}
