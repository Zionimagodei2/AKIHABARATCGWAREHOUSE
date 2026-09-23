#!/usr/bin/env node
/* Dedupe public/products.json by id — keep the LAST occurrence (latest
   content), preserving every admin-published field. Only runs when actual
   duplicates exist; aborts with a report if copies conflict in content. */
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "public", "products.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

const byId = new Map();
let dupIds = new Set();
for (const p of data) {
  if (byId.has(p.id)) dupIds.add(p.id);
  byId.set(p.id, p); // last occurrence wins
}

if (dupIds.size === 0) {
  console.log("No duplicate ids — nothing to do.");
  process.exit(0);
}

// Safety report: are the duplicate copies identical?
let conflicts = 0;
const seen = new Map();
for (const p of data) {
  if (!dupIds.has(p.id)) continue;
  if (!seen.has(p.id)) { seen.set(p.id, JSON.stringify(p)); continue; }
  if (seen.get(p.id) !== JSON.stringify(p)) {
    conflicts++;
    console.log(`CONFLICT id ${p.id}: copies differ — keeping the LAST one`);
  }
}

const deduped = data.filter((p, i) => byId.get(p.id) === p);
console.log(`Before: ${data.length} rows | unique ids: ${byId.size} | duplicate ids: ${dupIds.size} | content conflicts: ${conflicts}`);
console.log(`After dedupe: ${deduped.length} rows`);

// Field-by-field diff summary for the first few duplicate pairs (audit trail)
for (const id of [...dupIds].slice(0, 3)) {
  const copies = data.filter((p) => p.id === id);
  const keys = new Set(copies.flatMap((c) => Object.keys(c)));
  for (const k of keys) {
    const vals = copies.map((c) => JSON.stringify(c[k] ?? null));
    if (new Set(vals).size > 1) console.log(`  ${id}.${k}: ${vals.join("  VS  ")}`);
  }
}

fs.writeFileSync(FILE, JSON.stringify(deduped, null, 2) + "\n");
console.log("Written deduped products.json (admin data preserved, last copy kept).");
