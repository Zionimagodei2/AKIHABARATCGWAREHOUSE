/**
 * Supabase REST API Client — uses raw fetch() to call PostgREST
 * NO SDK, NO Proxy objects — works on every browser including Safari
 *
 * Uses the anon key (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * which works with Supabase's REST API (PostgREST) without needing a database password.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

/** Whether Supabase REST API is configured */
export const isSupabaseConfigured = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Get the Supabase URL */
export function getSupabaseUrl(): string {
  return SUPABASE_URL;
}

/** Get the Supabase anon key */
export function getSupabaseKey(): string {
  return SUPABASE_ANON_KEY;
}

/** Common headers for all Supabase REST requests */
function headers(): Record<string, string> {
  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

/** Build the REST API base URL for a table */
function tableUrl(table: string): string {
  return `${SUPABASE_URL}/rest/v1/${table}`;
}

// ─────────── Generic CRUD ───────────

/** SELECT rows from a table */
export async function selectFrom<T = unknown>(
  table: string,
  query: string = "*",
  filters?: Record<string, string>,
  options?: { order?: string; limit?: number; range?: string },
): Promise<{ data: T[] | null; error: string | null; count?: number }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const params = new URLSearchParams();
    params.set("select", query);
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params.set(key, value);
      }
    }
    if (options?.order) params.set("order", options.order);
    if (options?.limit) params.set("limit", String(options.limit));

    const res = await fetch(`${tableUrl(table)}?${params.toString()}`, {
      method: "GET",
      headers: { ...headers(), ...(options?.range ? { Range: options.range } : {}) },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { data: null, error: err.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { data: data as T[], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/** INSERT rows into a table */
export async function insertInto<T = unknown>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
): Promise<{ data: T[] | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const res = await fetch(tableUrl(table), {
      method: "POST",
      headers: { ...headers(), "Prefer": "return=representation" },
      body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { data: null, error: err.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { data: data as T[], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/** UPDATE rows in a table */
export async function updateIn<T = unknown>(
  table: string,
  filters: Record<string, string>,
  updates: Record<string, unknown>,
): Promise<{ data: T[] | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      params.set(key, value);
    }

    const res = await fetch(`${tableUrl(table)}?${params.toString()}`, {
      method: "PATCH",
      headers: { ...headers(), "Prefer": "return=representation" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { data: null, error: err.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { data: data as T[], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/** DELETE rows from a table */
export async function deleteFrom(
  table: string,
  filters: Record<string, string>,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }

  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      params.set(key, value);
    }

    const res = await fetch(`${tableUrl(table)}?${params.toString()}`, {
      method: "DELETE",
      headers: headers(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.message || `HTTP ${res.status}` };
    }

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
  if (!isSupabaseConfigured()) {
    return { count: 0, error: "Supabase not configured" };
  }

  try {
    const params = new URLSearchParams();
    params.set("select", "*");
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params.set(key, value);
      }
    }

    const res = await fetch(`${tableUrl(table)}?${params.toString()}`, {
      method: "GET",
      headers: { ...headers(), "Prefer": "count=exact", "Range": "0-0" },
    });

    if (!res.ok) {
      return { count: 0, error: `HTTP ${res.status}` };
    }

    const range = res.headers.get("content-range") || "";
    const total = range.split("/")[1];
    return { count: parseInt(total || "0", 10), error: null };
  } catch (e) {
    return { count: 0, error: (e as Error).message };
  }
}
