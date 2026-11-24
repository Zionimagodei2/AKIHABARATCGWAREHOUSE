import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { rawQuery } from "@/lib/pg-db";

export const dynamic = "force-dynamic";

const IMAGE_MAX = 3 * 1024 * 1024;
const VIDEO_MAX = 25 * 1024 * 1024;

/**
 * POST /api/admin/media — multipart upload (field "file", optional
 * "alt"). Stored in the media table (base64) because the container
 * filesystem does not survive redeploys. Returns { url: /api/media/<id> }.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const mime = file.type || "application/octet-stream";
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Only image or video uploads are supported" }, { status: 400 });
  }
  const limit = isImage ? IMAGE_MAX : VIDEO_MAX;
  if (file.size > limit) {
    return NextResponse.json(
      { error: `File too large — max ${isImage ? "3 MB" : "25 MB"} for ${isImage ? "images" : "videos"}` },
      { status: 400 },
    );
  }
  const alt = form?.get("alt");
  const buffer = Buffer.from(await file.arrayBuffer());
  const id = `m-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
  const { error } = await rawQuery(
    "insert into media (id, mime, data, alt) values ($1, $2, $3, $4)",
    [id, mime, buffer.toString("base64"), typeof alt === "string" ? alt : null],
  );
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true, id, url: `/api/media/${id}` });
}
