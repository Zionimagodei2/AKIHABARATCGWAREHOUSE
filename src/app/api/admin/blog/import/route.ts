import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { importCompiledBlogPosts } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/blog/import — copy every compiled blog-data.ts post
 * into blog_posts.published so the admin can edit them. Idempotent;
 * compiled posts keep rendering until (and unless) imported.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const { imported, error } = await importCompiledBlogPosts();
  if (error) return NextResponse.json({ error, imported }, { status: 500 });
  return NextResponse.json({ ok: true, imported });
}
