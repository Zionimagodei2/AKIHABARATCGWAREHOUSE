// Migrate Akihabara store data from Supabase (PostgREST) to our Postgres.
//
// Usage (run from an environment that can reach Supabase):
//   1. Apply the schema:   psql "$DATABASE_URL" -f db/schema.sql
//   2. Run the import:     SUPABASE_URL=... SUPABASE_ANON_KEY=... \
//                          DATABASE_URL=... node scripts/migrate-from-supabase.mjs
//
// For each table (in FK-safe order: users, products, orders, order_items)
// the script pages through PostgREST (limit/offset) and inserts every row
// into Postgres with ON CONFLICT (id) DO NOTHING, so re-running is safe.
// Row keys are intersected with the target table's actual columns
// (information_schema), so extra Supabase-side columns are skipped rather
// than failing the import. Per-table fetched vs inserted counts are printed.

import pg from "pg";
import https from "node:https";

// The Supabase host resolves to IPv6 first in some container networks and
// the v6 route is dead — all requests below go through node:https with
// family: 4 (forced IPv4) instead of the global fetch.
function httpsJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "GET", headers, family: 4, timeout: 30000 }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode} ${body.slice(0, 200)}`));
          return;
        }
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Bad JSON from ${url}: ${e.message}`)); }
      });
    });
    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.on("error", (err) => reject(new Error(`${err.message}${err.cause ? ` (cause: ${err.cause.message || err.cause})` : ""}`)));
    req.end();
  });
}

const { SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !DATABASE_URL) {
  console.error(
    "Missing env: SUPABASE_URL, SUPABASE_ANON_KEY and DATABASE_URL are all required."
  );
  process.exit(1);
}

const TABLES = ["users", "products", "orders", "order_items"];
const PAGE_SIZE = 1000;
const IDENT = /^[a-z_][a-z0-9_]*$/;

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Accept: "application/json",
};

async function fetchPage(table, offset) {
  const url =
    `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}` +
    `?select=*&limit=${PAGE_SIZE}&offset=${offset}`;
  try {
    return await httpsJson(url, headers);
  } catch (err) {
    throw new Error(`GET ${table} (offset ${offset}) failed: ${err.message}`);
  }
}

async function targetColumns(client, table) {
  const { rows } = await client.query(
    `select column_name from information_schema.columns
      where table_schema = 'public' and table_name = $1`,
    [table]
  );
  return new Set(rows.map((r) => r.column_name));
}

function paramValue(value) {
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return value;
}

async function migrateTable(client, table) {
  const allowed = await targetColumns(client, table);
  let fetched = 0;
  let inserted = 0;

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await fetchPage(table, offset);
    if (!Array.isArray(page) || page.length === 0) break;
    fetched += page.length;

    for (const row of page) {
      const columns = Object.keys(row).filter(
        (k) => IDENT.test(k) && allowed.has(k) && row[k] !== undefined
      );
      if (!columns.includes("id")) {
        console.warn(`  ! ${table}: skipping row without an id column`);
        continue;
      }
      const params = columns.map((c) => paramValue(row[c]));
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const result = await client.query(
        `insert into ${table} (${columns.join(", ")}) values (${placeholders})
         on conflict (id) do nothing`,
        params
      );
      inserted += result.rowCount ?? 0;
    }

    if (page.length < PAGE_SIZE) break;
  }

  console.log(`  ${table}: fetched ${fetched}, inserted ${inserted}`);
  return { fetched, inserted };
}

const client = new pg.Client({ connectionString: DATABASE_URL });
try {
  await client.connect();
  console.log("Migrating Supabase -> Postgres");
  for (const table of TABLES) {
    await migrateTable(client, table);
  }
  console.log("Done.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
