import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import {
  getOrInitDraft,
  saveDraft,
  deleteDraft,
  getPublishedContent,
  getPublishedCatalog,
} from "@/lib/site-content";
import type { SiteContent } from "@/lib/content-types";
import type { StoreProduct } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
}

function dbMissing() {
  return NextResponse.json({ error: "Database not configured" }, { status: 500 });
}

/**
 * GET /api/admin/draft — the current draft plus the live state it
 * diverges from (the panel diffs the two for its unpublished count).
 * The draft is initialized from live state on first read.
 */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!isSupabaseConfigured()) return dbMissing();
  try {
    const [draft, liveContent, liveCatalog] = await Promise.all([
      getOrInitDraft(),
      getPublishedContent(),
      getPublishedCatalog(),
    ]);
    return NextResponse.json({
      draft,
      live: {
        content: liveContent,
        products: liveCatalog as unknown as StoreProduct[],
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Failed to load draft" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/draft — save the draft. Accepts partial updates:
 * { products } and/or { content } (content is merged per top-level
 * key over the current draft content).
 */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!isSupabaseConfigured()) return dbMissing();
  try {
    const body = (await request.json()) as {
      products?: StoreProduct[];
      content?: Partial<SiteContent>;
    };
    const current = await getOrInitDraft();
    const next = {
      products: Array.isArray(body.products) ? body.products : current.products,
      content: body.content
        ? ({ ...current.content, ...body.content } as SiteContent)
        : current.content,
    };
    const { error } = await saveDraft(next);
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Failed to save draft" },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/draft — discard the draft (re-init from live). */
export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!isSupabaseConfigured()) return dbMissing();
  const { error } = await deleteDraft();
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
