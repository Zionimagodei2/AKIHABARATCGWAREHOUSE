import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { publishBlogPost } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/** POST /api/admin/blog/[slug]/publish — publish the draft (version kept, last 3). */
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
  const { error } = await publishBlogPost(slug);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
