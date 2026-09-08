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

  const orderId = `AKI-${Date.now().toString(36).toUpperCase()}`;
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
  // the order itself is already recorded).
  await insertInto("order_items", itemsData).catch(() => undefined);

  return finalId;
}
