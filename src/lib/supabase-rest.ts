/**
 * Supabase REST API Client — NO SDK, NO Proxy objects
 *
 * This module uses raw fetch() to call Supabase's PostgREST API directly.
 * This permanently eliminates Safari/WebKit Proxy compatibility issues
 * caused by the @supabase/supabase-js SDK.
 *
 * Environment variables needed:
 * - NEXT_PUBLIC_SUPABASE_URL: e.g. https://xxxxx.supabase.co
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: the public anon key
 *
 * If these are not set, all operations fall back to localStorage.
 */

const SUPABASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  : "";

const SUPABASE_ANON_KEY = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  : "";

/** Whether Supabase REST API is configured */
export const isSupabaseConfigured = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Common headers for all Supabase REST requests */
function headers(): Record<string, string> {
  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
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
  query?: string,
  filters?: Record<string, string>,
): Promise<{ data: T[] | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const params = new URLSearchParams();
    if (query) params.set("select", query);
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params.set(key, value);
      }
    }

    const url = params.toString()
      ? `${tableUrl(table)}?${params.toString()}`
      : tableUrl(table);

    const res = await fetch(url, {
      method: "GET",
      headers: headers(),
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
      headers: headers(),
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
      headers: headers(),
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

// ─────────── Order-specific helpers ───────────

export interface OrderRow {
  id: string;
  user_id?: string | null;
  total: number;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_zip: string;
  payment_method: string;
  notes?: string | null;
  created_at: string;
}

export interface OrderItemRow {
  order_id: string;
  product_id?: string | null;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

/** Create an order with items in Supabase via REST */
export async function createOrder(order: OrderRow, items: OrderItemRow[]): Promise<{ data: OrderRow | null; error: string | null }> {
  // Insert order
  const orderResult = await insertInto<OrderRow>("orders", {
    ...order,
    created_at: order.created_at || new Date().toISOString(),
  });

  if (orderResult.error || !orderResult.data?.[0]) {
    return { data: null, error: orderResult.error || "Failed to create order" };
  }

  const createdOrder = orderResult.data[0];

  // Insert order items
  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: createdOrder.id,
  }));

  const itemsResult = await insertInto("order_items", itemsWithOrderId);

  if (itemsResult.error) {
    // Try to clean up the order
    await deleteFrom("orders", { id: `eq.${createdOrder.id}` });
    return { data: null, error: itemsResult.error };
  }

  return { data: createdOrder, error: null };
}

/** Get all orders (admin) */
export async function getOrders(): Promise<{ data: OrderRow[] | null; error: string | null }> {
  return selectFrom<OrderRow>("orders", "*", { order: "created_at.desc" });
}

/** Update order status */
export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ error: string | null }> {
  const result = await updateIn("orders", { id: `eq.${orderId}` }, { status });
  return { error: result.error };
}

// ─────────── Product helpers ───────────

export interface ProductRow {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  image: string;
  description?: string | null;
  category: string;
  categories?: string[];
  rating?: number;
  in_stock?: boolean;
  source?: string | null;
}

/** Get all products from Supabase */
export async function getProducts(): Promise<{ data: ProductRow[] | null; error: string | null }> {
  return selectFrom<ProductRow>("products", "*", { order: "created_at.desc" });
}

// ─────────── Local storage fallback ───────────

const LOCAL_ORDERS_KEY = "aki_orders";

/** Store an order locally (fallback when Supabase is not configured) */
export function storeOrderLocally(order: OrderRow, items: OrderItemRow[]): void {
  const localOrders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
  localOrders.push({ ...order, items, created_at: order.created_at || new Date().toISOString() });
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(localOrders));
}

/** Get locally stored orders */
export function getLocalOrders(): (OrderRow & { items: OrderItemRow[] })[] {
  return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
}
