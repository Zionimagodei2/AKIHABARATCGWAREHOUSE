import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { rollbackToPublication } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/rollback { publicationId } — restore one of the
 * last 3 publications: products table, live content and the draft
 * are all reset to that snapshot.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const body = (await request.json().catch(() => null)) as {
    publicationId?: number;
  } | null;
  const publicationId = Number(body?.publicationId);
  if (!Number.isFinite(publicationId) || publicationId <= 0) {
    return NextResponse.json({ error: "publicationId is required" }, { status: 400 });
  }
  const { error } = await rollbackToPublication(publicationId);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
