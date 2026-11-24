import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { listPublications } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/** GET /api/admin/publications — the last 3 publications (rollback targets). */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const publications = await listPublications();
  return NextResponse.json({ publications });
}
