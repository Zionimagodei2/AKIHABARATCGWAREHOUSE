#!/usr/bin/env node
/**
 * Task 11 — Fix booster box / product prices.
 *
 * Reference: the ORIGINAL site's prices (the old codebase catalog, which the
 * current public/products.json mirrors 1:1 — verified 202/202 identical).
 * User instruction: "look at the original site's price and reduce 12% of the
 * price and update the price here, eliminating the broken price issues."
 *
 * Transformation per product:
 *   new original_price = old price            (the original site's price → crossed-out reference)
 *   new price          = round(old price × 0.88, 2)   (exactly 12% below the original site)
 *
 * Broken-price cleanup:
 *   - Product id "1" (M6a 30th CELEBRATION booster box) has price 0 / original_price 0
 *     and no reference price anywhere in the codebase (fujicards-products.json: 0,
 *     products_intermediate.json: absent). It is already invisible on the site
 *     (cleanProducts filters price > 0), so the dead record is removed.
 *
 * Everything else (title, image, categories, rating, in_stock, ids of surviving
 * products) is untouched. All prices/JSON-LD/SEO text re-derive at build time.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../public/products.json", import.meta.url);
const products = JSON.parse(readFileSync(FILE, "utf8"));

const before = products.length;
const brokenZero = products.filter((p) => !(p.price > 0));

// ── 1. Drop broken $0 records (dead data, invisible on the site anyway) ──
const kept = products.filter((p) => p.price > 0);

// ── 2. Apply the 12% reduction ──
const round2 = (n) => Math.round(n * 100) / 100;
const samples = [];
for (const p of kept) {
  const oldPrice = p.price;
  p.original_price = oldPrice;              // original site's price → new crossed-out reference
  p.price = round2(oldPrice * 0.88);        // 12% below the original site
  if (samples.length < 8 && (oldPrice > 50 || ["157", "72", "215"].includes(p.id)))
    samples.push({ id: p.id, title: p.title.slice(0, 48), was: oldPrice, now: p.price });
}

// ── 3. Integrity validation ──
let errors = [];
if (kept.some((p) => !(p.price > 0))) errors.push("non-positive price found");
if (kept.some((p) => !(p.original_price > p.price))) errors.push("original_price <= price (badge would break)");
for (const p of kept) {
  const expected = round2(p.original_price * 0.88);
  if (Math.abs(p.price - expected) > 0.011)
    errors.push(`id ${p.id}: price ${p.price} != 0.88×${p.original_price}=${expected}`);
}
// discount badge shown by UI: Math.round(((orig-price)/orig)*100) must equal 12
for (const p of kept) {
  const badge = Math.round(((p.original_price - p.price) / p.original_price) * 100);
  if (badge !== 12) errors.push(`id ${p.id}: badge shows -${badge}%`);
}

if (errors.length) {
  console.error("VALIDATION FAILED:\n" + errors.join("\n"));
  process.exit(1);
}

writeFileSync(FILE, JSON.stringify(kept, null, 2));

console.log(`Products: ${before} → ${kept.length} (removed ${brokenZero.length} broken $0 record: ${brokenZero.map((p) => `#${p.id} ${p.title.slice(0, 40)}`).join("; ")})`);
console.log("Sample updates (original-site price → new 12%-off price):");
for (const s of samples) console.log(`  #${s.id}  $${s.was.toFixed(2)} → $${s.now.toFixed(2)}   ${s.title}`);
console.log(`\nAll ${kept.length} products: price = 0.88 × original_price, badge -12%, no zero/inverted prices.`);
