/**
 * SERVER-ONLY — Postgres-backed since the Supabase migration.
 *
 * This module used to be a hand-rolled Supabase/PostgREST fetch client.
 * The store's data now lives in our own Postgres (see db/schema.sql and
 * scripts/migrate-from-supabase.mjs), and the helpers are implemented in
 * src/lib/pg-db.ts with `pg`. This file remains as a thin re-export so
 * the existing API-route imports (`@/lib/supabase-client`) keep working
 * unchanged — including `isSupabaseConfigured`, which now simply reports
 * whether DATABASE_URL is set.
 *
 * NEVER import this from browser code: the implementation reads the
 * server-only DATABASE_URL secret. Browser code must call the /api
 * routes instead (the old direct-to-database fallbacks are disabled).
 */

export {
  selectFrom,
  insertInto,
  updateIn,
  deleteFrom,
  countFrom,
  isDatabaseConfigured,
} from "./pg-db";

import { isDatabaseConfigured } from "./pg-db";

/**
 * Backwards-compatible name for the routes written against the old
 * Supabase client. True when the Postgres data layer is configured
 * (DATABASE_URL present).
 */
export const isSupabaseConfigured = isDatabaseConfigured;
