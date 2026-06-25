/**
 * Seed Supabase products table from products.json
 * Run with: bun scripts/seed-supabase.ts
 */

const SUPABASE_URL = "https://ojnczugjgqudqycxdlje.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbmN6dWdqZ3F1ZHF5Y3hkbGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjQxNDQsImV4cCI6MjA5NzU0MDE0NH0._m4ppmryYkZSpAQvOHRiHrc9Ub5TakQp4Mni6075Dso";

interface ProductJSON {
  id: string;
  title: string;
  price: number;
  original_price: number;
  image: string;
  description: string;
  category: string;
  subcategory: string;
  categories: string[];
  rating: number;
  in_stock: boolean;
  source: string;
  url: string;
}

async function main() {
  // Read products.json
  const fs = await import("fs");
  const path = await import("path");
  const productsPath = path.resolve(__dirname, "../public/products.json");
  const products: ProductJSON[] = JSON.parse(
    fs.readFileSync(productsPath, "utf-8")
  );

  console.log(`Found ${products.length} products in products.json`);

  // Verify price discount (should be 12% less than original)
  let priceOk = 0;
  let priceBad = 0;
  for (const p of products) {
    if (p.original_price > 0 && p.price > 0) {
      const expectedDiscount = Math.round(p.original_price * 0.88 * 100) / 100;
      if (Math.abs(p.price - expectedDiscount) <= 0.5) {
        priceOk++;
      } else {
        priceBad++;
        if (priceBad <= 3) {
          console.log(
            `  Price mismatch: ${p.title} — price=${p.price}, expected~${expectedDiscount}, original=${p.original_price}`
          );
        }
      }
    }
  }
  console.log(
    `Price check: ${priceOk} OK, ${priceBad} mismatch (tolerance ±0.5)`
  );

  // Map to Supabase schema
  const rows = products.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    original_price: p.original_price || null,
    image: p.image,
    images: "[]",
    description: p.description || null,
    category: p.category,
    subcategory: p.subcategory || null,
    categories: JSON.stringify(p.categories || []),
    rating: p.rating || 4.5,
    review_count: 0,
    in_stock: p.in_stock ?? true,
    featured: false,
    source: p.source || null,
    sku: null,
  }));

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `Batch ${i / BATCH + 1} FAILED (${res.status}): ${text}`
      );
    } else {
      inserted += batch.length;
      console.log(
        `Batch ${i / BATCH + 1}: inserted ${batch.length} products (total: ${inserted})`
      );
    }
  }

  console.log(`\nDone! Inserted ${inserted} of ${products.length} products.`);

  // Verify count
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "count=exact",
      },
    }
  );
  const countHeader = countRes.headers.get("content-range");
  console.log(`Supabase total products: ${countHeader}`);
}

main().catch(console.error);
