#!/usr/bin/env node
/**
 * Delete unreferenced images from public/ so the repo (and the static
 * export in ./out) only ships files the site actually uses.
 *
 * Referenced set is collected from:
 *  - public/products.json  (p.image for every product)
 *  - all TypeScript sources under src/ (string literals containing /images/...)
 *  - an explicit whitelist for root-level brand assets (favicon, og-image, …)
 *
 * Template literals such as `/images/warehouse-${num}.webp` are handled by
 * treating the static prefix (everything before "${") as a path prefix.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

// ---------- collect referenced paths ----------
const referenced = new Set();
const prefixes = new Set();

// root-level brand assets (referenced from metadata / manifest / docs)
for (const f of [
  "/logo.webp",
  "/og-image.png",
  "/favicon.ico",
  "/favicon-32.png",
  "/apple-touch-icon.png",
  "/android-chrome-192.png",
  "/android-chrome-512.png",
  "/site.webmanifest",
  "/robots.txt",
]) referenced.add(f);

// product images
const products = JSON.parse(readFileSync(join(ROOT, "public/products.json"), "utf8"));
for (const p of products) {
  if (p.image) referenced.add(p.image);
}

// string literals in source code
const srcDir = join(ROOT, "src");
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}
for (const file of walk(srcDir)) {
  const code = readFileSync(file, "utf8");
  for (const m of code.matchAll(/["'`]([^"'`]*\/images\/[^"'`]*)["'`]/g)) {
    const s = m[1];
    if (s.includes("${")) prefixes.add(s.slice(0, s.indexOf("${")));
    else referenced.add(s);
  }
  // src="..." style in JSX for non-/images root assets
  for (const m of code.matchAll(/["'`](\/[a-z0-9_-]+\.(?:webp|png|svg|ico))["'`]/g)) {
    referenced.add(m[1]);
  }
}

// ---------- check a path for reference ----------
function isReferenced(publicRelPath) {
  if (referenced.has(publicRelPath)) return true;
  for (const pre of prefixes) if (publicRelPath.startsWith(pre)) return true;
  return false;
}

// ---------- scan public/ and delete unreferenced ----------
let removed = 0, kept = 0, bytes = 0;
const doomed = [];
function scanImages(dir) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) { scanImages(full); continue; }
    if (!/\.(webp|png|jpe?g|gif|avif)$/i.test(e)) continue; // only images
    const rel = "/" + relative(join(ROOT, "public"), full).split("\\").join("/");
    if (!isReferenced(rel)) { doomed.push(full); bytes += statSync(full).size; }
    else kept++;
  }
}
scanImages(join(ROOT, "public/images"));

// favicon.png is unreferenced (layout uses favicon.ico + favicon-32.png)
const faviconPng = join(ROOT, "public/favicon.png");
if (existsSync(faviconPng) && !referenced.has("/favicon.png")) {
  doomed.push(faviconPng);
  bytes += statSync(faviconPng).size;
}

for (const f of doomed) unlinkSync(f);

console.log(`Removed ${doomed.length} unreferenced image files (${(bytes / 1e6).toFixed(1)} MB)`);
console.log(`Kept ${kept} referenced image files`);
console.log(`Prefix matches: ${[...prefixes].join(", ") || "(none)"}`);
if (doomed.length) {
  console.log("Sample removed:");
  for (const f of doomed.slice(0, 5)) console.log("  - " + relative(ROOT, f));
}
