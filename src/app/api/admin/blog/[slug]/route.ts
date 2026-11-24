import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { getAdminBlogPost, saveBlogDraft } from "@/lib/site-content";
import type { BlogPostData } from "@/lib/content-types";

export const dynamic = "force-dynamic";

function guard(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  return null;
}

/** GET /api/admin/blog/[slug] — editable copy (draft ?? published ?? compiled) + last-3 versions. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const blocked = guard(request);
  if (blocked) return blocked;
  const { slug } = await params;
  const result = await getAdminBlogPost(slug);
  if (!result) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(result);
}

/** PUT /api/admin/blog/[slug] — save the post draft (not live until publish). */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const blocked = guard(request);
  if (blocked) return blocked;
  const { slug } = await params;
  const body = (await request.json().catch(() => null)) as { post?: BlogPostData } | null;
  if (!body?.post || typeof body.post !== "object") {
    return NextResponse.json({ error: "post is required" }, { status: 400 });
  }
  const { error } = await saveBlogDraft(slug, body.post);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
