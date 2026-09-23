"use client";

/* ────────────────────────────────────────────────────────────
   Store API — direct-to-database fallbacks for the static
   deployment.

   The storefront is deployed as a static site (Render Static,
   publish dir ./out) where the /api routes do not exist. When a
   call to /api/* returns 404, these helpers talk to the store's
   PostgREST (Supabase) endpoint directly from the browser using
   the public anon key — the exact same key and endpoint the
   server routes use — so sign-up, sign-in and orders work in
   BOTH deployment modes (static site and web service).

   Passwords are hashed with SHA-256 via the Web Crypto API,
   producing the identical hex digest the server routes compute
   with Node's crypto module, so accounts work across modes.
   ──────────────────────────────────────────────────────────── */

import { selectFrom, insertInto } from "./supabase-client";

/* ────────────────────────────────────────────────────────────
   postToApi — POST JSON to a Next.js API route and report
   whether a REAL backend answered.

   Why `res.status === 404` is not enough: the production static
   deployment sits behind Cloudflare, which answers POST requests
   to paths that do not exist on a static origin with an EMPTY
   `200 OK` (no content-type, zero-length body). A real Next.js
   API route ALWAYS replies with `content-type: application/json`
   and a JSON body. So anything else — an empty 200, an HTML 404
   page, a redirect, a network error — means "no backend" and the
   caller must use its direct-to-database fallback.
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

interface UsersRow {
  id?: string;
  email?: string;
  name?: string | null;
  role?: string;
  password?: string;
}

/** Create an account directly in the store database (static-host fallback). */
export async function directSignUp(input: {
  email: string;
  password: string;
  name: string;
}): Promise<DirectUser> {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("Email is required");
  if (!input.password || input.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Same user-exists check the server route performs
  const { data: existing, error: selectError } = await selectFrom<UsersRow>(
    "users",
    "*",
    { email: `eq.${email}` }
  );
  if (!selectError && existing && existing.length > 0) {
    throw new Error("Email already registered");
  }

  const hashed = await sha256hex(input.password);
  const { data, error } = await insertInto<UsersRow>("users", {
    email,
    password: hashed,
    name: input.name?.trim() || null,
    role: "customer",
  });
  if (error) throw new Error(error);

  const user = (data && data[0]) || ({} as UsersRow);
  return {
    id: String(user.id ?? ""),
    email: String(user.email ?? email),
    name: user.name ?? input.name?.trim() ?? null,
    role: String(user.role ?? "customer"),
  };
}

/** Sign in directly against the store database (static-host fallback). */
export async function directSignIn(input: {
  email: string;
  password: string;
}): Promise<DirectUser> {
  const email = input.email.trim().toLowerCase();
  const hashed = await sha256hex(input.password);

  const { data, error } = await selectFrom<UsersRow>("users", "*", {
    email: `eq.${email}`,
  });
  if (error) throw new Error("Sign-in service is unavailable, please try again.");

  const user = data && data[0];
  if (!user || user.password !== hashed) {
    throw new Error("Invalid email or password.");
  }
  return {
    id: String(user.id ?? ""),
    email: String(user.email ?? email),
    name: user.name ?? null,
    role: String(user.role ?? "customer"),
  };
}

export interface DirectOrderItem {
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

/**
 * Record a customer order directly in the store database (static-host
 * fallback). Mirrors POST /api/orders: total is computed from the items,
 * the order id is generated in the same AKI-XXX format the checkout API
 * uses, and order items are inserted after the order row.
 * Returns the created order id.
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
  if (!input.items || input.items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const total =
    Math.round(
      input.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0) * 100
    ) / 100;

  // Use the caller-provided id (so the WhatsApp order message the customer
  // sends matches the record in the admin panel); fall back to generating one.
  const orderId =
    input.orderId?.trim() || `AKI-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();

  const { data, error } = await insertInto("orders", {
    id: orderId,
    total,
    status: "pending",
    created_at: now,
    updated_at: now,
    customer_name: input.customerName?.trim() || null,
    customer_email: input.customerEmail?.trim() || null,
    customer_phone: input.customerPhone?.trim() || null,
    shipping_address: input.shippingAddress?.trim() || null,
    shipping_city: input.shippingCity?.trim() || null,
    shipping_country: input.shippingCountry?.trim() || null,
    shipping_zip: input.shippingZip?.trim() || null,
    payment_method: input.paymentMethod || null,
    notes: input.notes?.trim() || null,
  });
  if (error) throw new Error(error);

  const row = (data && data[0]) as { id?: string } | undefined;
  const finalId = String(row?.id ?? orderId);

  const itemsData = input.items.map((item) => ({
    order_id: finalId,
    product_id: item.productId || null,
    title: item.title?.trim() || "",
    price: Number(item.price),
    quantity: Number(item.quantity),
    image: item.image || null,
  }));
  // Items failure is non-fatal (matches the server route behaviour —
  // the order itself is already recorded). One retry without the
  // product link guards against the database catalog running behind
  // the live products.json (order_items.product_id has a FK to the
  // products table): the line items are still recorded with title,
  // price and quantity either way.
  const inserted = await insertInto("order_items", itemsData);
  if (inserted.error) {
    await insertInto(
      "order_items",
      itemsData.map(({ product_id: _drop, ...rest }) => ({
        ...rest,
        product_id: null,
      }))
    ).catch(() => undefined);
  }

  return finalId;
}
