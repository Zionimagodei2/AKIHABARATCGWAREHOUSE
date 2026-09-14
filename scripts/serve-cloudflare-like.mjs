#!/usr/bin/env node
/**
 * Cloudflare-emulating static server for END-TO-END testing of ./out.
 *
 * Replicates the PRODUCTION behavior observed on
 * https://www.akihabaratcgwarehouse.com (Cloudflare → Render static):
 *   - GET  to a missing path → 404.html with HTTP 404
 *   - POST to a missing path (e.g. /api/orders) → HTTP 200, EMPTY body,
 *     NO content-type  ← this is what broke the checkout fallback
 *
 * Everything else is served from ./out like a normal static host.
 *
 * Usage: node scripts/serve-cloudflare-like.mjs   (PORT env, default 3210)
 */
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import zlib from "node:zlib";

const ROOT = join(new URL("..", import.meta.url).pathname, "out");
const PORT = Number(process.env.PORT || 3210);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // ── Cloudflare emulation for API routes that do not exist ──
  if (url.pathname.startsWith("/api/")) {
    if (req.method === "POST") {
      // Exactly like production: empty 200, no content-type, zero length.
      console.log(`[cf-emulate] POST ${url.pathname} → 200 (empty body, no content-type)`);
      res.writeHead(200, { "content-length": "0" });
      res.end();
      return;
    }
    // GET/HEAD to missing routes → 404 (Cloudflare serves the 404 page)
    console.log(`[cf-emulate] ${req.method} ${url.pathname} → 404`);
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end("<html><body>404</body></html>");
    return;
  }

  // ── Normal static file serving from ./out ──
  let filePath = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (url.pathname.endsWith("/")) filePath = join(filePath, "index.html");
  let candidate = filePath;
  if (!existsSync(candidate)) {
    candidate = filePath.endsWith(".html") ? filePath : `${filePath}.html`;
    if (!existsSync(candidate)) candidate = join(filePath, "index.html");
  }
  if (!existsSync(candidate) || !candidate.startsWith(ROOT)) {
    const notFound = join(ROOT, "404.html");
    if (existsSync(notFound)) {
      const body = readFileSync(notFound);
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(body);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  const isDir = existsSync(join(candidate, "index.html")) &&
    extname(candidate) === "";
  const file = isDir ? join(candidate, "index.html") : candidate;
  let body = readFileSync(file);
  const type = MIME[extname(file)] || "application/octet-stream";
  const headers = { "content-type": type };

  const accept = req.headers["accept-encoding"] || "";
  if (/\bgzip\b/.test(accept) && body.length > 1024) {
    body = zlib.gzipSync(body);
    headers["content-encoding"] = "gzip";
  }
  headers["content-length"] = body.length;
  if (extname(file) === ".html") headers["cache-control"] = "no-cache";
  res.writeHead(200, headers);
  res.end(body);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Cloudflare-emulating static server on http://localhost:${PORT}`);
  console.log(`  POST /api/* → empty 200 (production behavior)`);
  console.log(`  GET  /api/* → 404`);
});
