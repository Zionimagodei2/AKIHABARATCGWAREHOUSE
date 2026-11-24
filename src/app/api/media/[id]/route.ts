import { NextRequest } from "next/server";
import { rawQuery } from "@/lib/pg-db";

export const dynamic = "force-dynamic";

/** GET /api/media/[id] — public media serving from the media table. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { rows } = await rawQuery<{ mime: string; data: string }>(
    "select mime, data from media where id = $1",
    [id],
  );
  if (!rows || rows.length === 0) {
    return new Response("Not found", { status: 404 });
  }
  const body = Buffer.from(rows[0].data, "base64");
  return new Response(body, {
    headers: {
      "Content-Type": rows[0].mime,
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
