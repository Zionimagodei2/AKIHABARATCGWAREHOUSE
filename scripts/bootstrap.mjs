// First-boot bootstrap for the Akihabara standalone server.
//
// Runs from docker-entrypoint.sh before the Next.js server starts. It is
// idempotent and safe to run on every container start:
//
//   1. If DATABASE_URL is unset, log and exit 0 (nothing to do).
//   2. Connect to the maintenance database ("postgres") on the same
//      server and CREATE DATABASE for the database named in
//      DATABASE_URL if it does not exist yet.
//   3. Apply db/schema.sql to the target database (the schema is fully
//      idempotent: CREATE TABLE/INDEX IF NOT EXISTS, CREATE OR REPLACE
//      FUNCTION, DROP TRIGGER IF EXISTS). A failure here is fatal —
//      exit 1 — because the API routes cannot work without the tables.
//   4. One-time Supabase import: if RUN_SUPABASE_IMPORT=1 and
//      SUPABASE_URL + SUPABASE_ANON_KEY are set and the users table is
//      still empty, run scripts/migrate-from-supabase.mjs as a child
//      process (env passed through). Import failures are logged loudly
//      but exit 0 — the site can boot and the import can be re-run
//      manually. A non-empty users table skips the import, so restarts
//      never re-import.
//
// File locations: this script looks for schema.sql and
// migrate-from-supabase.mjs next to itself first (the Docker image
// stages all three in /app/bootstrap/), then at the repo layout
// (scripts/ + db/schema.sql) for local runs.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const log = (...args) => console.log("[bootstrap]", ...args);
const logErr = (...args) => console.error("[bootstrap]", ...args);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  log("DATABASE_URL is not set — skipping database bootstrap.");
  process.exit(0);
}

// ── Parse DATABASE_URL and validate the database name ──────────────
let parsed;
try {
  parsed = new URL(DATABASE_URL);
} catch {
  logErr("DATABASE_URL is not a valid URL — cannot bootstrap.");
  process.exit(1);
}
const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
if (!/^[a-z_][a-z0-9_]*$/.test(dbName)) {
  logErr(`Refusing to bootstrap unsafe database name: ${JSON.stringify(dbName)}`);
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));

function findFile(candidates) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// ── 1. Ensure the target database exists ───────────────────────────
const maintenanceUrl = new URL(DATABASE_URL);
maintenanceUrl.pathname = "/postgres";

const admin = new pg.Client({
  connectionString: maintenanceUrl.toString(),
  connectionTimeoutMillis: 10_000,
});
try {
  await admin.connect();
  const { rows } = await admin.query(
    "select 1 from pg_database where datname = $1",
    [dbName]
  );
  if (rows.length === 0) {
    // dbName passed the strict identifier check above; CREATE DATABASE
    // cannot take a bound parameter, so it is interpolated quoted.
    await admin.query(`create database "${dbName}"`);
    log(`created database "${dbName}".`);
  } else {
    log(`database "${dbName}" already exists.`);
  }
} catch (err) {
  logErr(`could not ensure database "${dbName}" exists: ${err.message}`);
  process.exit(1);
} finally {
  await admin.end().catch(() => undefined);
}

// ── 2. Apply the schema (fatal on failure) ─────────────────────────
const schemaPath = findFile([
  path.join(here, "schema.sql"),
  path.join(here, "..", "db", "schema.sql"),
  path.join(process.cwd(), "db", "schema.sql"),
]);
if (!schemaPath) {
  logErr("db/schema.sql not found (looked next to bootstrap.mjs, in ../db, and in ./db).");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});
try {
  await client.connect();
  const sql = fs.readFileSync(schemaPath, "utf8");
  await client.query(sql);
  log(`schema applied (${schemaPath}).`);
} catch (err) {
  logErr(`schema apply failed: ${err.message}`);
  await client.end().catch(() => undefined);
  process.exit(1);
}

// ── 3. One-time Supabase import (never fatal) ──────────────────────
function runChild(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", (err) => {
      logErr(`could not start import script: ${err.message}`);
      resolve(1);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

if (process.env.RUN_SUPABASE_IMPORT === "1") {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    log("RUN_SUPABASE_IMPORT=1 but SUPABASE_URL / SUPABASE_ANON_KEY are not set — skipping import.");
  } else {
    try {
      const { rows } = await client.query(
        "select count(*)::int as n from users"
      );
      const userCount = rows[0]?.n ?? 0;
      if (userCount > 0) {
        log(`users table already has ${userCount} row(s) — skipping Supabase import.`);
      } else {
        const migratePath = findFile([
          path.join(here, "migrate-from-supabase.mjs"),
          path.join(process.cwd(), "scripts", "migrate-from-supabase.mjs"),
        ]);
        if (!migratePath) {
          logErr("migrate-from-supabase.mjs not found — skipping import.");
        } else {
          log(`users table is empty — running one-time Supabase import (${migratePath}).`);
          const code = await runChild(migratePath);
          if (code !== 0) {
            logErr(
              `Supabase import FAILED (exit ${code}). Booting anyway — ` +
                "re-run it manually with: node scripts/migrate-from-supabase.mjs"
            );
          } else {
            log("Supabase import finished.");
          }
        }
      }
    } catch (err) {
      logErr(`Supabase import check failed: ${err.message}. Booting anyway.`);
    }
  }
}

await client.end().catch(() => undefined);
log("bootstrap complete.");
