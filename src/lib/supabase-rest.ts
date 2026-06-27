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

// ─────────── Auth (Supabase GoTrue REST API) ───────────

/**
 * Supabase Auth via raw fetch() — NO SDK, NO Proxy
 *
 * Uses Supabase's GoTrue REST API:
 * - Sign up: POST /auth/v1/signup
 * - Sign in: POST /auth/v1/token?grant_type=password
 * - Sign out: POST /auth/v1/logout
 * - Get user: GET /auth/v1/user
 *
 * Access tokens are stored in localStorage for persistence.
 */

const AUTH_LOCAL_KEY = "aki_auth";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

/** Auth headers using the user's access token */
function authHeaders(accessToken: string): Record<string, string> {
  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

/** Sign up a new user */
export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Fallback: store locally
    const localUser = createLocalUser(email, name);
    saveAuthLocal(localUser);
    return { user: localUser, error: null };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        data: { name: name || "" },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { user: null, error: data.error_description || data.msg || data.message || `Sign up failed (${res.status})` };
    }

    // Supabase returns session on signup if auto-confirm is on
    if (data.access_token) {
      const user: AuthUser = {
        id: data.user?.id || "",
        email: data.user?.email || email,
        name: data.user?.user_metadata?.name || name || "",
        access_token: data.access_token,
        refresh_token: data.refresh_token || "",
        expires_at: data.expires_at,
      };
      saveAuthLocal(user);
      return { user, error: null };
    }

    // Email confirmation required — return partial user info
    const user: AuthUser = {
      id: data.user?.id || "",
      email: data.user?.email || email,
      name: data.user?.user_metadata?.name || name || "",
      access_token: "",
      refresh_token: "",
    };
    return { user, error: null };
  } catch (e) {
    return { user: null, error: (e as Error).message };
  }
}

/** Sign in with email and password */
export async function signIn(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Fallback: check local users
    const localUser = getLocalUserByEmail(email);
    if (localUser && localUser.access_token === hashLocalPassword(password)) {
      saveAuthLocal(localUser);
      return { user: localUser, error: null };
    }
    return { user: null, error: "Invalid email or password" };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { user: null, error: data.error_description || data.msg || data.message || `Sign in failed (${res.status})` };
    }

    const user: AuthUser = {
      id: data.user?.id || "",
      email: data.user?.email || email,
      name: data.user?.user_metadata?.name || "",
      access_token: data.access_token,
      refresh_token: data.refresh_token || "",
      expires_at: data.expires_at,
    };
    saveAuthLocal(user);
    return { user, error: null };
  } catch (e) {
    return { user: null, error: (e as Error).message };
  }
}

/** Sign out the current user */
export async function signOut(): Promise<{ error: string | null }> {
  const auth = getAuthLocal();
  clearAuthLocal();

  if (!isSupabaseConfigured() || !auth?.access_token) {
    return { error: null };
  }

  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: authHeaders(auth.access_token),
    });
    return { error: null };
  } catch {
    return { error: null }; // Even if server logout fails, local is cleared
  }
}

/** Get the current authenticated user (checks local + validates with server) */
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  const auth = getAuthLocal();
  if (!auth) return { user: null, error: null };

  // If no Supabase, just return local user
  if (!isSupabaseConfigured()) {
    return { user: auth, error: null };
  }

  // Validate token with Supabase
  if (!auth.access_token) {
    clearAuthLocal();
    return { user: null, error: null };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: authHeaders(auth.access_token),
    });

    if (!res.ok) {
      clearAuthLocal();
      return { user: null, error: null };
    }

    const data = await res.json();
    const updatedUser: AuthUser = {
      ...auth,
      id: data.id || auth.id,
      email: data.email || auth.email,
      name: data.user_metadata?.name || auth.name,
    };
    saveAuthLocal(updatedUser);
    return { user: updatedUser, error: null };
  } catch {
    return { user: auth, error: null }; // Return local user on network error
  }
}

// ─────────── Auth local storage helpers ───────────

/** Save auth state to localStorage */
function saveAuthLocal(user: AuthUser): void {
  localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(user));
}

/** Get auth state from localStorage */
function getAuthLocal(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Clear auth state from localStorage */
function clearAuthLocal(): void {
  localStorage.removeItem(AUTH_LOCAL_KEY);
}

/** Simple hash for local-only password storage (NOT cryptographically secure) */
function hashLocalPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "local_" + Math.abs(hash).toString(36);
}

const LOCAL_USERS_KEY = "aki_local_users";

/** Create a local-only user (when Supabase is not configured) */
function createLocalUser(email: string, name?: string): AuthUser {
  return {
    id: "local_" + Date.now().toString(36),
    email,
    name: name || "",
    access_token: "",
    refresh_token: "",
  };
}

/** Save a local user's credentials for sign-in matching */
export function saveLocalUserCredentials(email: string, password: string, name: string): void {
  const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "{}");
  users[email] = {
    passwordHash: hashLocalPassword(password),
    name,
    id: "local_" + Date.now().toString(36),
  };
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

/** Get a local user by email for sign-in */
function getLocalUserByEmail(email: string): AuthUser | null {
  const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "{}");
  const userData = users[email];
  if (!userData) return null;
  return {
    id: userData.id,
    email,
    name: userData.name || "",
    access_token: userData.passwordHash, // Store hash as token for comparison
    refresh_token: "",
  };
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
