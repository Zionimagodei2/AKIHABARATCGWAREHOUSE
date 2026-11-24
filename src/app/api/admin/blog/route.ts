import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { listAdminBlogPosts } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/** GET /api/admin/blog — post list for the admin Posts editor. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const posts = await listAdminBlogPosts();
  return NextResponse.json({ posts });
}
