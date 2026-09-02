#!/usr/bin/env node
/**
 * Production static file server for the exported site in ./out.
 *
 * Purpose: serve the *built* site (not `next dev`) so the preview behaves
 * exactly like production hosting (Render static / CDN):
 *   - gzip compression (the 1.8 MB homepage ships as ~60 KB over the wire)
 *   - immutable cache headers for images and fingerprinted assets
 *   - no-cache headers for HTML so deploys show up immediately
 *   - directory → index.html, extensionless paths resolved leniently
 *   - 404.html served with a real 404 status for unknown paths
 *
 * Everything is cached in RAM after the first request, so responses are
 * served at memory speed. Runs under Node or Bun.
 *
 * Usage:  node scripts/serve-static.mjs     (PORT env var optional)
 */
import http from "node:http";
import { execSync } from "node:child_process";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import zlib from "node:zlib";

const ROOT = join(new URL("..", import.meta.url).pathname, "out");
const PORT = Number(process.env.PORT || 3000);

if (!existsSync(join(ROOT, "index.html"))) {
  console.error("✗ ./out/index.html not found — run `npm run build:static` first.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

const COMPRESSIBLE = new Set([".html", ".css", ".js", ".mjs", ".json", ".webmanifest", ".xml", ".txt", ".svg", ".map"]);

/** path → { raw, gz, mime, cacheControl, mtime } (lazy, RAM-cached, mtime-aware) */
const cache = new Map();

function loadFile(absPath, urlPath) {
  const mtime = statSync(absPath).mtimeMs;
  const hit = cache.get(absPath);
  // A rebuild can swap files under us (e.g. new deploy of ./out) — pick up
  // new bytes transparently instead of serving stale RAM content forever.
  if (hit && hit.mtime === mtime) return hit;
  const raw = readFileSync(absPath);
  const ext = extname(absPath);
  const entry = {
    raw,
    gz: COMPRESSIBLE.has(ext) && raw.length > 1024 ? zlib.gzipSync(raw, { level: 6 }) : null,
    mime: MIME[ext] || "application/octet-stream",
    mtime,
    cacheControl:
      urlPath.startsWith("/images/") || urlPath.startsWith("/_next/static/")
        ? "public, max-age=31536000, immutable"
        : ext === ".html"
          ? "no-cache, must-revalidate"
          : "public, max-age=3600",
  };
  cache.set(absPath, entry);
  return entry;
}

/** Resolve a URL path to a file inside ROOT (or null). Lenient like a CDN. */
function resolvePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const safe = normalize(clean).replace(/^(\.\.[/\\])+/, "");
  let abs = join(ROOT, safe);

  // a) exact file
  if (existsSync(abs) && statSync(abs).isFile()) return { abs, urlPath: safe };
  // b) directory index (also handles extensionless paths like /product/<slug>)
  const index = join(abs, "index.html");
  if (existsSync(index) && statSync(index).isFile()) return { abs: index, urlPath: safe.replace(/\/?$/, "/") };
  // c) path with implicit .html (e.g. /404 → 404.html)
  if (!safe.endsWith("/")) {
    const withExt = abs + ".html";
    if (existsSync(withExt) && statSync(withExt).isFile()) return { abs: withExt, urlPath: safe };
  }
  return null;
}

const NOT_FOUND = loadFile(join(ROOT, "404.html"), "/404.html");

// Never die from a logging problem (e.g. EPIPE if a consumer goes away).
process.stdout?.on?.("error", () => {});
process.stderr?.on?.("error", () => {});

const server = http.createServer((req, res) => {
  try {
    handle(req, res);
  } catch (err) {
    console.error("request error:", err?.message || err);
    try {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } catch {}
  }
});

function handle(req, res) {
  const started = Date.now();
  const send = (entry, status, urlPath) => {
    const acceptsGz = /\bgzip\b/.test(req.headers["accept-encoding"] || "");
    const body = acceptsGz && entry.gz ? entry.gz : entry.raw;
    res.writeHead(status, {
      "Content-Type": entry.mime,
      "Content-Length": body.length,
      "Cache-Control": entry.cacheControl,
      ...(acceptsGz && entry.gz ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : body);
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} → ${status} ${(body.length / 1024).toFixed(0)}KB ${Date.now() - started}ms`);
  };

  const resolved = resolvePath(req.url || "/");
  if (resolved) {
    send(loadFile(resolved.abs, resolved.urlPath), 200, resolved.urlPath);
  } else {
    send(NOT_FOUND, 404, "/404.html");
  }
}

server.listen(PORT, () => {
  const pages = execSync(`find ${ROOT} -name "*.html" | wc -l`).toString().trim();
  console.log(`✓ Serving static export of ${ROOT}`);
  console.log(`  ${pages} HTML pages on http://localhost:${PORT} (gzip + RAM cache + immutable image caching)`);
});

// graceful shutdown
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
