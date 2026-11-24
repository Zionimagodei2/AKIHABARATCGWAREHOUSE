/**
 * Postgres data layer — SERVER-SIDE ONLY.
 *
 * Drop-in replacement for the old Supabase/PostgREST client
 * (src/lib/supabase-client.ts, which now re-exports this module).
 * It exposes the exact helper signatures the API routes were written
 * against — selectFrom / insertInto / updateIn / deleteFrom / countFrom
 * with PostgREST-style filters ({ id: "eq.X" }) and options
 * ({ order: "created_at.desc", limit, range }) — but translates them
 * to parameterized SQL against our own Postgres (DATABASE_URL).
 *
 * (This lives in pg-db.ts rather than db.ts because src/lib/db.ts is
 * the pre-existing Prisma client used by the certificates routes.)
 *
 * Safety rules:
 *  - Table names are restricted to a whitelist; table/column identifiers
 *    must match /^[a-z_][a-z0-9_]*$/ before they are interpolated.
 *  - Every value travels as a bound parameter ($1, $2, …) — never string
 *    interpolation — so filter values cannot inject SQL.
 *  - Importing this module is side-effect-safe with DATABASE_URL unset:
 *    the pool is created lazily on first use and every helper returns a
 *    { data: null, error: "Database not configured" } result instead of
 *    throwing.
 *
 * NEVER import this module (or supabase-client.ts) from browser code:
 * DATABASE_URL is a server-only secret.
 */

import { Pool, types } from "pg";

// Return Postgres `numeric` (OID 1700) and `bigint` (OID 20) as JS numbers,
// matching the JSON numbers PostgREST used to produce. (node-pg otherwise
// returns both as strings to avoid precision loss; this store's values are
// prices/counts well inside the safe range.)
types.setTypeParser(1700, (v: string) => parseFloat(v));
types.setTypeParser(20, (v: string) => parseInt(v, 10));

const TABLES = new Set([
  "users",
  "orders",
  "order_items",
  "products",
  "admin_draft",
  "site_publications",
  "blog_posts",
  "blog_post_versions",
  "media",
]);
const IDENT = /^[a-z_][a-z0-9_]*$/;
const NOT_CONFIGURED = "Database not configured";

/** Whether the Postgres data layer is configured (DATABASE_URL present). */
export const isDatabaseConfigured = (): boolean => Boolean(process.env.DATABASE_URL);

// Lazily-created pool singleton (survives module duplication via globalThis).
const globalForDb = globalThis as unknown as { __akiPgPool?: Pool };

function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForDb.__akiPgPool) {
    globalForDb.__akiPgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return globalForDb.__akiPgPool;
}

function assertTable(table: string): string {
  if (!TABLES.has(table) || !IDENT.test(table)) {
    throw new Error(`Invalid table: ${table}`);
  }
  return table;
}

function assertIdent(name: string, kind: string): string {
  if (!IDENT.test(name)) throw new Error(`Invalid ${kind}: ${name}`);
  return name;
}

/** Values bound as parameters: objects/arrays become JSON (jsonb columns). */
function paramValue(value: unknown): unknown {
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    return JSON.stringify(value);
  }
  return value;
}

interface ParsedFilter {
  sql: string;
  value?: unknown;
  hasValue: boolean;
}

/**
 * Translate one PostgREST-style filter ("eq.X", "neq.X", "gt.5", "is.null",
 * or a plain value meaning equality) into a SQL fragment + bound value.
 */
function parseFilter(column: string, raw: string, placeholder: number): ParsedFilter {
  const col = assertIdent(column, "filter column");
  const dot = raw.indexOf(".");
  const op = dot > 0 ? raw.slice(0, dot) : "";
  const rest = dot > 0 ? raw.slice(dot + 1) : raw;

  switch (op) {
    case "eq":
      return { sql: `${col} = $${placeholder}`, value: rest, hasValue: true };
    case "neq":
      return { sql: `${col} <> $${placeholder}`, value: rest, hasValue: true };
    case "gt":
      return { sql: `${col} > $${placeholder}`, value: rest, hasValue: true };
    case "gte":
      return { sql: `${col} >= $${placeholder}`, value: rest, hasValue: true };
    case "lt":
      return { sql: `${col} < $${placeholder}`, value: rest, hasValue: true };
    case "lte":
      return { sql: `${col} <= $${placeholder}`, value: rest, hasValue: true };
    case "like":
      return { sql: `${col} LIKE $${placeholder}`, value: rest, hasValue: true };
    case "ilike":
      // PostgREST uses * as the wildcard in like/ilike patterns.
      return { sql: `${col} ILIKE $${placeholder}`, value: rest.replace(/\*/g, "%"), hasValue: true };
    case "is":
      if (rest === "null") return { sql: `${col} IS NULL`, hasValue: false };
      if (rest === "not.null") return { sql: `${col} IS NOT NULL`, hasValue: false };
      if (rest === "true") return { sql: `${col} IS TRUE`, hasValue: false };
      if (rest === "false") return { sql: `${col} IS FALSE`, hasValue: false };
      throw new Error(`Unsupported is-filter: ${raw}`);
    default:
      // Plain value (or an unrecognised prefix) → equality on the whole string.
      return { sql: `${col} = $${placeholder}`, value: raw, hasValue: true };
  }
}

function buildWhere(
  filters: Record<string, string> | undefined,
  params: unknown[],
): string {
  if (!filters) return "";
  const clauses: string[] = [];
  for (const [column, raw] of Object.entries(filters)) {
    const parsed = parseFilter(column, String(raw), params.length + 1);
    clauses.push(parsed.sql);
    if (parsed.hasValue) params.push(parsed.value);
  }
  return clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
}

function buildOrder(order: string | undefined): string {
  if (!order) return "";
  const parts = order.split(",").map((part) => {
    const [column, dirRaw] = part.trim().split(".");
    const col = assertIdent(column, "order column");
    const dir = (dirRaw || "asc").toLowerCase();
    if (dir !== "asc" && dir !== "desc") throw new Error(`Invalid order direction: ${dirRaw}`);
    return `${col} ${dir.toUpperCase()}`;
  });
  return ` ORDER BY ${parts.join(", ")}`;
}

function buildLimitOffset(options?: { limit?: number; range?: string }): string {
  // PostgREST semantics: an explicit Range ("from-to", inclusive) wins over
  // the limit parameter when both are supplied.
  if (options?.range) {
    const m = /^(\d+)-(\d+)$/.exec(options.range.trim());
    if (m) {
      const from = parseInt(m[1], 10);
      const to = parseInt(m[2], 10);
      return ` LIMIT ${Math.max(0, to - from + 1)} OFFSET ${from}`;
    }
  }
  if (options?.limit && Number.isFinite(options.limit)) {
    return ` LIMIT ${Math.max(0, Math.floor(options.limit))}`;
  }
  return "";
}

function selectColumns(query: string): string {
  const q = (query || "*").trim();
  if (q === "*") return "*";
  return q
    .split(",")
    .map((c) => assertIdent(c.trim(), "column"))
    .join(", ");
}

// ─────────── Generic CRUD (signatures mirror the old PostgREST client) ───────────

/** SELECT rows from a table */
export async function selectFrom<T = unknown>(
  table: string,
  query: string = "*",
  filters?: Record<string, string>,
  options?: { order?: string; limit?: number; range?: string },
): Promise<{ data: T[] | null; error: string | null; count?: number }> {
  const pool = getPool();
  if (!pool) return { data: null, error: NOT_CONFIGURED };

  try {
    const t = assertTable(table);
    const params: unknown[] = [];
    const sql =
      `SELECT ${selectColumns(query)} FROM ${t}` +
      buildWhere(filters, params) +
      buildOrder(options?.order) +
      buildLimitOffset(options);
    const res = await pool.query(sql, params);
    return { data: res.rows as T[], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/** INSERT rows into a table; returns the inserted rows (RETURNING *). */
export async function insertInto<T = unknown>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
): Promise<{ data: T[] | null; error: string | null }> {
  const pool = getPool();
  if (!pool) return { data: null, error: NOT_CONFIGURED };

  try {
    const t = assertTable(table);
    const list = Array.isArray(rows) ? rows : [rows];
    if (list.length === 0) return { data: [], error: null };

    // Union of keys across all rows (undefined values are dropped, exactly
    // like the JSON round-trip in the old PostgREST client). A key missing
    // from a given row is inserted as DEFAULT so column defaults (ids,
    // timestamps) still apply per-row.
    const columns: string[] = [];
    for (const row of list) {
      for (const key of Object.keys(row)) {
        if (row[key] === undefined) continue;
        assertIdent(key, "column");
        if (!columns.includes(key)) columns.push(key);
      }
    }
    if (columns.length === 0) return { data: null, error: "insertInto: no fields to insert" };

    const params: unknown[] = [];
    const tuples = list.map((row) => {
      const cells = columns.map((col) => {
        if (row[col] === undefined) return "DEFAULT";
        params.push(paramValue(row[col]));
        return `$${params.length}`;
      });
      return `(${cells.join(", ")})`;
    });

    const sql = `INSERT INTO ${t} (${columns.join(", ")}) VALUES ${tuples.join(", ")} RETURNING *`;
    const res = await pool.query(sql, params);
    return { data: res.rows as T[], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/** UPDATE rows in a table; returns the updated rows (RETURNING *). */
export async function updateIn<T = unknown>(
  table: string,
  filters: Record<string, string>,
  updates: Record<string, unknown>,
): Promise<{ data: T[] | null; error: string | null }> {
  const pool = getPool();
  if (!pool) return { data: null, error: NOT_CONFIGURED };

  try {
    const t = assertTable(table);
    const params: unknown[] = [];
    const sets: string[] = [];
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;
      assertIdent(key, "column");
      params.push(paramValue(value));
      sets.push(`${key} = $${params.length}`);
    }
    if (sets.length === 0) return { data: null, error: "updateIn: no fields to update" };

    const sql = `UPDATE ${t} SET ${sets.join(", ")}` + buildWhere(filters, params) + " RETURNING *";
    const res = await pool.query(sql, params);
    return { data: res.rows as T[], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/** DELETE rows from a table */
export async function deleteFrom(
  table: string,
  filters: Record<string, string>,
): Promise<{ error: string | null }> {
  const pool = getPool();
  if (!pool) return { error: NOT_CONFIGURED };

  try {
    const t = assertTable(table);
    const params: unknown[] = [];
    const sql = `DELETE FROM ${t}` + buildWhere(filters, params);
    await pool.query(sql, params);
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Count rows in a table */
export async function countFrom(
  table: string,
  filters?: Record<string, string>,
): Promise<{ count: number; error: string | null }> {
  const pool = getPool();
  if (!pool) return { count: 0, error: NOT_CONFIGURED };

  try {
    const t = assertTable(table);
    const params: unknown[] = [];
    const sql = `SELECT COUNT(*)::int AS count FROM ${t}` + buildWhere(filters, params);
    const res = await pool.query(sql, params);
    return { count: Number(res.rows[0]?.count ?? 0), error: null };
  } catch (e) {
    return { count: 0, error: (e as Error).message };
  }
}

// ─────────── Raw SQL escape hatches (admin content system) ───────────
// Used by src/lib/site-content.ts for the jsonb draft / publication /
// blog / media tables, whose access patterns (single-row upserts,
// transactional catalog rewrites, snapshot pruning) do not fit the
// PostgREST-shaped helpers above. Callers must still bind every value
// as a parameter — never interpolate user input into the SQL text.

/** Run one parameterized query against the pool. */
export async function rawQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<{ rows: T[] | null; error: string | null }> {
  const pool = getPool();
  if (!pool) return { rows: null, error: NOT_CONFIGURED };
  try {
    const res = await pool.query(sql, params as unknown[]);
    return { rows: res.rows as T[], error: null };
  } catch (e) {
    return { rows: null, error: (e as Error).message };
  }
}

export type DbQuerier = <T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
) => Promise<T[]>;

/** Run `fn` inside a single transaction; rolls back on any throw. */
export async function withTransaction<T>(
  fn: (query: DbQuerier) => Promise<T>,
): Promise<{ data: T | null; error: string | null }> {
  const pool = getPool();
  if (!pool) return { data: null, error: NOT_CONFIGURED };
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const query: DbQuerier = async <T = Record<string, unknown>>(
      sql: string,
      params: unknown[] = [],
    ) => (await client.query(sql, params as unknown[])).rows as T[];
    const data = await fn(query);
    await client.query("COMMIT");
    return { data, error: null };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    return { data: null, error: (e as Error).message };
  } finally {
    client.release();
  }
}
