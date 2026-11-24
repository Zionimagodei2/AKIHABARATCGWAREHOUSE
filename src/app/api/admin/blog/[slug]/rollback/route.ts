import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { rollbackBlogPost } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/** POST /api/admin/blog/[slug]/rollback { versionId } — restore a kept version. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const { slug } = await params;
  const body = (await request.json().catch(() => null)) as { versionId?: number } | null;
  const versionId = Number(body?.versionId);
  if (!Number.isFinite(versionId) || versionId <= 0) {
    return NextResponse.json({ error: "versionId is required" }, { status: 400 });
  }
  const { error } = await rollbackBlogPost(slug, versionId);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
