import { NextResponse, NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

/**
 * Server-side publishing for the admin panel.
 *
 * The GitHub publication token lives ONLY in the server environment
 * (GITHUB_PUBLICATION_TOKEN) and never reaches the browser. The client
 * sends the file payloads it built (products.json / content.json); this
 * route commits them to the store repository via the GitHub Contents
 * API — the same operations the admin panel used to perform directly.
 */

const GITHUB_OWNER = "Zionimagodei2";
const GITHUB_REPO = "AKIHABARATCGWAREHOUSE";
const GITHUB_BRANCH = "main";
const ALLOWED_PATHS = new Set(["public/products.json", "public/content.json"]);
const MAX_CONTENT_BYTES = 10 * 1024 * 1024;

interface PublishFile {
  path: string;
  content: string;
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function getFileSha(token: string, path: string): Promise<{ sha: string | null; error?: string }> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(GITHUB_BRANCH)}&_cb=${Date.now()}`;
  const res = await fetch(url, { headers: githubHeaders(token) });
  if (res.status === 404) return { sha: null }; // new file
  if (!res.ok) return { sha: null, error: `Could not read ${path} (HTTP ${res.status})` };
  const data = await res.json();
  return { sha: data?.sha ?? null };
}

async function putFile(
  token: string,
  path: string,
  content: string,
  sha: string | null,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  const body: Record<string, unknown> = {
    message: `Akihabara Admin: ${message}`,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // 409 = stale sha (a publish landed seconds ago). One retry with a fresh sha.
    if (res.status === 409) {
      const fresh = await getFileSha(token, path);
      if (fresh.sha !== undefined && fresh.sha !== null && fresh.sha !== sha) {
        return putFile(token, path, content, fresh.sha, message);
      }
      if (fresh.error) return { ok: false, error: fresh.error };
    }
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err?.message || `GitHub rejected the update (HTTP ${res.status})` };
  }
  return { ok: true };
}

/** Publication status for the admin panel — never exposes the token itself. */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  return NextResponse.json({
    configured: Boolean(process.env.GITHUB_PUBLICATION_TOKEN),
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const token = process.env.GITHUB_PUBLICATION_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Publication token unavailable — GITHUB_PUBLICATION_TOKEN is not set on the server" },
      { status: 500 }
    );
  }

  let body: { files?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const files = body.files as PublishFile[] | undefined;
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "No files to publish" }, { status: 400 });
  }
  for (const file of files) {
    if (!file || typeof file.path !== "string" || !ALLOWED_PATHS.has(file.path)) {
      return NextResponse.json({ error: `File path not allowed: ${String(file?.path)}` }, { status: 400 });
    }
    if (typeof file.content !== "string" || Buffer.byteLength(file.content, "utf8") > MAX_CONTENT_BYTES) {
      return NextResponse.json({ error: `Invalid content for ${file.path}` }, { status: 400 });
    }
  }

  try {
    for (const file of files) {
      const { sha, error } = await getFileSha(token, file.path);
      if (error) throw new Error(error);
      const put = await putFile(token, file.path, file.content, sha, `Admin panel: update ${file.path.replace("public/", "")}`);
      if (!put.ok) throw new Error(put.error || `Failed to update ${file.path}`);
    }
    return NextResponse.json({ ok: true, published: files.map((f) => f.path) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Publish failed" },
      { status: 502 }
    );
  }
}
