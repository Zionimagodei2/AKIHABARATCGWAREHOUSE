import { NextResponse } from "next/server";
import { getPublishedContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/**
 * GET /api/site-content — the published site content (public).
 *
 * Returns the newest site_publications content merged over the
 * compiled defaults. Before the first publish (or if the database is
 * unreachable) this is exactly the compiled defaults, so the
 * storefront renders identically either way.
 */
export async function GET() {
  const content = await getPublishedContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
