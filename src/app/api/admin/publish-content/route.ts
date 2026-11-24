import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { publishDraft } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/publish-content — apply the admin draft: rewrite
 * the products table from the draft catalog and snapshot content +
 * products as a new publication (last 3 kept). Instant — no rebuild.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  let note: string | undefined;
  try {
    const body = await request.json().catch(() => null);
    if (body && typeof body.note === "string") note = body.note;
  } catch {
    /* note is optional */
  }
  const { publicationId, error } = await publishDraft(note);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true, publicationId });
}
