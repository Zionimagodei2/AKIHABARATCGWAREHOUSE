#!/usr/bin/env node
/**
 * Sync the store catalog (public/products.json) into the Supabase
 * `products` table via PostgREST upsert (on_conflict=id).
 *
 * Why this matters: `order_items.product_id` has a FK to `products.id`.
 * When the live catalog grows (new sets added via products.json) but the
 * database table is not refreshed, checkout still records the ORDER row
 * but every ORDER ITEM for a new product is rejected with a 409 FK
 * violation — orders show up in the admin panel with no line items.
 *
 * Run this after publishing new products:
 *   node scripts/sync-products-db.mjs
 * (idempotent — safe to run any number of times)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://ojnczugjgqudqycxdlje.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbmN6dWdqZ3F1ZHF5Y3hkbGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjQxNDQsImV4cCI6MjA5NzU0MDE0NH0._m4ppmryYkZSpAQvOHRiHrc9Ub5TakQp4Mni6075Dso";

function toDbRow(p) {
  const categories = Array.isArray(p.categories) ? p.categories : [];
  return {
    id: String(p.id),
    title: p.title,
    price: Number(p.price),
    original_price: p.original_price != null ? Number(p.original_price) : null,
    image: p.image,
    images: "[]",
    description: p.description ?? null,
    category: p.category,
    subcategory: categories.length > 1 ? categories[1] : null,
    categories: JSON.stringify(categories),
    rating: p.rating != null ? Number(p.rating) : 4.5,
    review_count: p.review_count != null ? Number(p.review_count) : 0,
    in_stock: p.in_stock !== false,
    featured: Boolean(p.featured),
    source: p.source ?? null,
    sku: p.sku ?? null,
    updated_at: p.updated_at || new Date().toISOString(),
  };
}

async function upsertBatch(rows) {
  const params = new URLSearchParams({ on_conflict: "id" });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?${params}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      // merge-duplicates = UPSERT: insert new ids, update existing ones
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 400)}`);
  }
}

(async () => {
  const products = JSON.parse(
    fs.readFileSync(path.join(ROOT, "public/products.json"), "utf8")
  );
  const rows = products.map(toDbRow);
  console.log(`Uploading ${rows.length} products (upsert on id)…`);

  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await upsertBatch(batch);
    console.error(`  batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(rows.length / BATCH)} ok (${batch.length} rows)`);
  }

  // Verify
  const check = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "count=exact",
    },
  });
  const total = (check.headers.get("content-range") || "").split("/")[1];
  console.log(`Done. DB products table now has ${total} rows (catalog: ${rows.length}).`);

  // Spot-check the newest English One Piece ids referenced by checkout
  for (const probe of ["244", "269", "273"]) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${probe}&select=id,title`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const j = await r.json();
    console.log(`  id ${probe}: ${j.length ? "present — " + j[0].title.slice(0, 60) : "MISSING"}`);
  }
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
