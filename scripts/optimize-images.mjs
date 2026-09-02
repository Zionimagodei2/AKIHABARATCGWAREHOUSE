/* Image optimization pass for Akihabara TCG Warehouse.
 *
 * Problems fixed here:
 *  1. logo.png is 2.7MB and was loaded eagerly on every page — logo.webp (8KB) exists.
 *  2. Warehouse marquee loaded 3 eager PNGs (2-2.7MB each) — webp versions exist.
 *  3. About-section certificates are 0.5-1.9MB PNG/JPGs — convert to webp.
 *  4. public/images/products (34MB) + public/images/unitedcards (12MB) are
 *     referenced by nothing in src/ or products.json — dead weight.
 *  5. Backup/intermediate JSON files in public/ — dead weight.
 *
 * Run: bun scripts/optimize-images.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const exists = (p) => fs.existsSync(p);
const rm = (p) => fs.rmSync(p, { recursive: true, force: true });
const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
const files = [];
let bytesBefore = 0;
let bytesAfter = 0;

function track(beforeSize, afterSize, label) {
  bytesBefore += beforeSize;
  bytesAfter += afterSize;
  console.log(`  ${label}: ${kb(beforeSize)} → ${kb(afterSize)}`);
}

/* ── 1. Convert about-gallery images (5 jpg + 3 png) to webp ── */
console.log("\n[1/5] About gallery → webp (width 896, q80)");
const aboutDir = "public/images/about";
for (const f of fs.readdirSync(aboutDir).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
  const src = path.join(aboutDir, f);
  const out = src.replace(/\.(png|jpe?g)$/i, ".webp");
  const buf = await sharp(src)
    .resize({ width: 896, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  fs.writeFileSync(out, buf);
  track(fs.statSync(src).size, buf.length, path.relative(process.cwd(), out));
  fs.unlinkSync(src);
  files.push({ from: src, to: out });
}

/* ── 2. Re-encode warehouse marquee webps smaller (width 1000) ── */
console.log("\n[2/5] Warehouse marquee webp re-encode (width 1000, q78)");
for (const f of fs.readdirSync("public/images").filter((f) => /^warehouse-\d\.webp$/.test(f))) {
  const src = path.join("public/images", f);
  const buf = await sharp(src)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  const before = fs.statSync(src).size;
  if (buf.length < before) {
    fs.writeFileSync(src, buf);
    track(before, buf.length, path.relative(process.cwd(), src));
  }
}

/* ── 3. Swap heavy originals that already have optimized replacements ── */
console.log("\n[3/5] Remove heavy originals with webp replacements");
for (const [heavy, light] of [
  ["public/logo.png", "public/logo.webp"],
  ["public/images/warehouse-1.png", "public/images/warehouse-1.webp"],
  ["public/images/warehouse-2.png", "public/images/warehouse-2.webp"],
  ["public/images/warehouse-3.png", "public/images/warehouse-3.webp"],
]) {
  if (exists(heavy) && exists(light)) {
    const size = fs.statSync(heavy).size;
    rm(heavy);
    bytesBefore += size;
    console.log(`  deleted ${path.relative(process.cwd(), heavy)} (${kb(size)}; replacement ${kb(fs.statSync(light).size)} kept)`);
  }
}

/* ── 4. Delete unreferenced image directories ── */
console.log("\n[4/5] Remove unreferenced image dirs (no references in src/ or products.json)");
for (const dir of ["public/images/products", "public/images/unitedcards"]) {
  if (exists(dir)) {
    let size = 0;
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else size += fs.statSync(p).size;
      }
    };
    walk(dir);
    rm(dir);
    bytesBefore += size;
    console.log(`  deleted ${path.relative(process.cwd(), dir)}/ (${(size / 1048576).toFixed(1)}MB)`);
  }
}

/* ── 5. Remove backup / intermediate files ── */
console.log("\n[5/5] Remove backup & intermediate files");
for (const f of [
  "public/products.json.backup",
  "public/products_intermediate.json",
  "public/products_new.json",
  "public/products_scraped.json",
  "public/fujicards-products.json",
  "public/about.json",
  "public/certificate-1.jpg",
  "public/certificate-2.jpg",
  "src/components/tcg-store.tsx.backup",
]) {
  if (exists(f)) {
    const size = fs.statSync(f).size;
    rm(f);
    bytesBefore += size;
    console.log(`  deleted ${f} (${kb(size)})`);
  }
}

console.log(`\nTracked image savings: ${(bytesBefore / 1048576).toFixed(1)}MB → ${(bytesAfter / 1048576).toFixed(1)}MB (saved ${(bytesBefore / 1048576).toFixed(1)}MB)`);
console.log("Done. Update code references to: /logo.webp, /images/warehouse-*.webp, /images/about/*.webp");
