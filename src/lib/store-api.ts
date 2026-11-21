"use client";

/* ────────────────────────────────────────────────────────────
   Store API — browser-side helpers for talking to the server
   /api routes (see postToApi below).

   History: this module used to carry direct-to-database fallbacks
   that talked to Supabase/PostgREST straight from the browser with
   the public anon key (for the old static deployment, where the
   /api routes did not exist). Since the migration to our own
   Postgres, the database is reachable only from the server —
   there is deliberately NO browser-side database path anymore.
   The direct* functions remain as stubs that throw, so any caller
   that still falls back to them fails loudly instead of silently
   bypassing the server API.
   ──────────────────────────────────────────────────────────── */

const DIRECT_DISABLED_MESSAGE =
  "Direct database access is disabled — server API unavailable";

/* ────────────────────────────────────────────────────────────
   postToApi — POST JSON to a Next.js API route and report
   whether a REAL backend answered.

   Why `res.status === 404` is not enough: the production static
   deployment sits behind Cloudflare, which answers POST requests
   to paths that do not exist on a static origin with an EMPTY
   `200 OK` (no content-type, zero-length body). A real Next.js
   API route ALWAYS replies with `content-type: application/json`
   and a JSON body. So anything else — an empty 200, an HTML 404
   page, a redirect, a network error — means "no backend" (the
   caller's fallback path is disabled since the Postgres migration,
   so this surfaces as an error rather than a silent DB write).
   ──────────────────────────────────────────────────────────── */

export type ApiResult =
  | { real: true; ok: boolean; status: number; data: Record<string, unknown> }
  | { real: false };

export async function postToApi(path: string, body: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) return { real: false };
    const text = await res.text();
    if (!text.trim()) return { real: false };
    try {
      const data = JSON.parse(text);
      if (!data || typeof data !== "object") return { real: false };
      return { real: true, ok: res.ok, status: res.status, data };
    } catch {
      return { real: false };
    }
  } catch {
    return { real: false };
  }
}

/** SHA-256 hex digest — identical output to Node's crypto.createHash('sha256') */
export async function sha256hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface DirectUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * DISABLED — sign-up now goes exclusively through POST /api/auth/signup.
 * Kept as a throwing stub so stale fallback callers fail loudly.
 */
export async function directSignUp(input: {
  email: string;
  password: string;
  name: string;
}): Promise<DirectUser> {
  void input;
  throw new Error(DIRECT_DISABLED_MESSAGE);
}

/**
 * DISABLED — sign-in now goes exclusively through POST /api/auth/signin.
 * Kept as a throwing stub so stale fallback callers fail loudly.
 */
export async function directSignIn(input: {
  email: string;
  password: string;
}): Promise<DirectUser> {
  void input;
  throw new Error(DIRECT_DISABLED_MESSAGE);
}

export interface DirectOrderItem {
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

/**
 * DISABLED — orders now go exclusively through POST /api/orders /
 * POST /api/checkout. Kept as a throwing stub so stale fallback
 * callers fail loudly.
 */
export async function directCreateOrder(input: {
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCountry?: string;
  shippingZip?: string;
  paymentMethod?: string;
  notes?: string;
  items: DirectOrderItem[];
}): Promise<string> {
  void input;
  throw new Error(DIRECT_DISABLED_MESSAGE);
}
