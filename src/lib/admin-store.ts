"use client";

/* ────────────────────────────────────────────────────────────
   Admin Store — self-contained store database for the admin
   panel on a static deployment.

   Architecture:
   1. BASELINE:  the live store catalog (/products.json) and
      content (/content.json) deployed with the site. These are
      the files the storefront renders from, so they are always
      exactly what customers see.
   2. OVERLAY:   edits / additions / deletions are layered on
      top of the baseline and persisted to localStorage, so
      nothing is lost between sessions.
   3. PUBLISH:   one click sends the resulting products.json +
      content.json to the server publish route (/api/admin/publish),
      which commits them to the GitHub repo with a server-only token.
      Render auto-rebuilds and the changes go live on the store.
      The store polls the deployed files until the rebuild lands,
      then clears the overlay automatically.

   Orders, customers (derived) and reviews are kept locally —
   the static storefront has no server to record them. The panel
   starts empty and only ever shows REAL records: orders and
   reviews the admin records from actual customer confirmations.
   No sample / mock data exists anywhere in this store.

   REMOTE ORDERS: customer orders placed through checkout are
   recorded in the store database (our Postgres, behind the
   /api routes). On panel load and on every Refresh, real
   orders + their items are pulled from GET /api/admin/orders
   and merged with locally-recorded orders, so the admin always
   sees every order customers placed. Status changes and
   deletions sync back via PATCH /api/orders/<id>. The browser
   never talks to the database directly.
   ──────────────────────────────────────────────────────────── */

/**
 * Fire-and-forget status sync for a remote order. Goes through the
 * admin-gated PATCH /api/orders/<id> route (session cookie attached
 * via same-origin credentials); failures are swallowed because the
 * local panel state has already been updated and the next
 * refreshRemoteOrders() reconciles from the server.
 */
function syncRemoteOrderStatus(id: string, status: string): void {
  fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ status }),
  }).catch(() => undefined);
}

/* ─────────── Types (published / snake_case format) ─────────── */

export interface StoreProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  image: string;
  category: string;
  categories?: string[];
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  description?: string | null;
  images?: string[];
  sku?: string | null;
  source?: string | null;
  featured?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StoreOrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

export interface StoreOrder {
  id: string;
  items: StoreOrderItem[];
  total: number;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  shippingZip: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreReview {
  id: string;
  productId: string | null;
  author: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
  createdAt: string;
}

export interface StoreHeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  accent: string;
  order: number;
  active: boolean;
  /** Optional explicit product link — when set, the storefront's
   *  "Shop Now" button opens this product's page. When empty the
   *  storefront auto-links by image / set-code / category. */
  productId?: string | null;
}

export interface StoreAnnouncement {
  id: string;
  message: string;
  active: boolean;
  order: number;
}

export interface StoreSettings {
  siteName: string;
  whatsappNumber: string;
  currency: string;
  currencyJPY: string;
  currencyEUR: string;
  currencyGBP: string;
}

export interface StoreContent {
  heroSlides: StoreHeroSlide[];
  announcements: StoreAnnouncement[];
  settings: StoreSettings;
}

export interface TokenStatus {
  /** Publishing is configured on the server (token held server-side only). */
  hasToken: boolean;
  /** True when the server reports publishing is configured. */
  active: boolean;
  /** Server-side tokens have no client-visible expiry. */
  expiresAt: string | null;
  /** Human label — always "—" for server-managed publishing. */
  expiryLabel: string;
  /** Days left before expiry (null — managed on the server). */
  daysLeft: number | null;
  /** The token is never editable from the browser. */
  canEdit: boolean;
  /** Always false — there is no client-side token anymore. */
  isCustom: boolean;
}

export type PublishState =
  | "idle"
  | "publishing"
  | "waiting"
  | "live"
  | "error";

export interface PublishStatus {
  state: PublishState;
  message: string;
  at: string | null;
}

export interface CatalogStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  promosActive: number;
  outOfStock: number;
  catalogValue: number;
  ordersByStatus: Record<string, number>;
  revenueLast7Days: { name: string; revenue: number; orders: number }[];
}

/* ─────────── Constants ─────────── */

const LS_OVERLAY = "aki_admin_overlay_v1";
const LS_ORDERS = "aki_admin_orders_v1";
const LS_REVIEWS = "aki_admin_reviews_v1";

const DEFAULT_SETTINGS: StoreSettings = {
  siteName: "Akihabara TCG Warehouse",
  whatsappNumber: "+81 80-2935-0455",
  currency: "USD",
  currencyJPY: "149.5",
  currencyEUR: "0.92",
  currencyGBP: "0.79",
};

const POLL_INTERVAL_MS = 15_000;
const POLL_MAX_MS = 20 * 60_000;

/* ─────────── Helpers ─────────── */

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota / private mode — keep working in-memory */
  }
}

function safeDel(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

/* ─────────── Store class ─────────── */

interface Overlay {
  edits: Record<string, StoreProduct>;
  adds: StoreProduct[];
  deletes: string[];
}

class AdminStore {
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  baseline: StoreProduct[] = [];
  baselineContent: StoreContent | null = null;
  overlay: Overlay = { edits: {}, adds: [], deletes: [] };
  contentOverlay: StoreContent | null = null;
  orders: StoreOrder[] = [];
  reviews: StoreReview[] = [];
  publish: PublishStatus = { state: "idle", message: "", at: null };

  private listeners = new Set<() => void>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollStart = 0;
  private pendingHashes: { products?: string; content?: string } = {};

  /** Ids of orders that live in the remote store database. */
  private remoteOrderIds = new Set<string>();

  /* ── lifecycle ── */

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  ready(): Promise<void> {
    if (this.initialized) return Promise.resolve();
    if (!this.initPromise) this.initPromise = this.init();
    return this.initPromise;
  }

  private async init(): Promise<void> {
    // 1. Local persistence
    try {
      const o = safeGet(LS_OVERLAY);
      if (o) this.overlay = { edits: {}, adds: [], deletes: [], ...JSON.parse(o) };
      const ords = safeGet(LS_ORDERS);
      if (ords) this.orders = JSON.parse(ords);
      const revs = safeGet(LS_REVIEWS);
      if (revs) this.reviews = JSON.parse(revs);
      // Drop any legacy client-side GitHub token/config left in storage —
      // publishing is server-managed now and the browser holds no token.
      safeDel("aki_admin_github_v1");
      safeDel("aki_admin_token_v1");
    } catch {
      /* corrupt storage — start clean */
    }

    // 2. Purge any demo records left over from earlier versions of the
    //    panel, so the dashboard only ever shows REAL data. Runs every
    //    init; cheap, and self-heals browsers that still carry old seeds.
    const hadSample = this.orders.some((o) => (o as { sample?: boolean }).sample) || this.reviews.some((r) => (r as { sample?: boolean }).sample);
    if (hadSample) {
      this.orders = this.orders.filter((o) => !(o as { sample?: boolean }).sample);
      this.reviews = this.reviews.filter((r) => !(r as { sample?: boolean }).sample);
      this.persistOrders();
      this.persistReviews();
    }
    safeDel("aki_admin_seeded_v1");

    // 3. Baseline from the deployed store (cache-busted)
    try {
      const res = await fetch(`/products.json?_ts=${Date.now()}`);
      if (res.ok) {
        const data: unknown = await res.json();
        if (Array.isArray(data)) this.baseline = data as StoreProduct[];
      }
    } catch {
      /* offline — overlay still applies to last-known baseline */
    }

    try {
      const res = await fetch(`/content.json?_ts=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          this.baselineContent = {
            heroSlides: Array.isArray(data.heroSlides) ? data.heroSlides : [],
            announcements: Array.isArray(data.announcements) ? data.announcements : [],
            settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
          };
        }
      }
    } catch {
      /* keep defaults */
    }

    // 4. Real customer orders from the store database (checkout writes
    //    there) — merged with locally-recorded orders.
    await this.refreshRemoteOrders();

    // 5. Resume rebuild polling if a publish was in flight
    if (this.publish.state === "idle" && this.hasPendingPublish()) {
      this.publish = {
        state: "waiting",
        message: "Waiting for the live store to rebuild…",
        at: new Date().toISOString(),
      };
      this.startPolling();
    }

    this.initialized = true;
    this.notify();
  }

  private persist() {
    safeSet(LS_OVERLAY, JSON.stringify(this.overlay));
    this.notify();
  }

  private persistOrders() {
    safeSet(LS_ORDERS, JSON.stringify(this.orders));
    this.notify();
  }

  private persistReviews() {
    safeSet(LS_REVIEWS, JSON.stringify(this.reviews));
    this.notify();
  }

  /* ─────────── Products ─────────── */

  getEffectiveProducts(): StoreProduct[] {
    // Adds newer than the baseline — but an add whose id already exists in
    // the baseline (published earlier, overlay never cleared because the
    // rebuild poll was interrupted) must REPLACE the baseline row instead
    // of appearing twice (the source of the historical duplicate rows).
    const baselineIds = new Set(this.baseline.map((p) => p.id));
    const staleAdds = this.overlay.adds.filter((a) => baselineIds.has(a.id));

    const edited = this.baseline
      .filter((p) => !this.overlay.deletes.includes(p.id))
      .map((p) => {
        const add = staleAdds.find((a) => a.id === p.id);
        return add ?? this.overlay.edits[p.id] ?? p;
      });
    const freshAdds = [...this.overlay.adds]
      .filter((a) => !baselineIds.has(a.id))
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

    const merged = [...freshAdds, ...edited];
    // Final defense: one row per id (last occurrence wins).
    const byId = new Map<string, StoreProduct>();
    for (const p of merged) byId.set(p.id, p);
    return [...byId.values()];
  }

  getProduct(id: string): StoreProduct | undefined {
    return this.getEffectiveProducts().find((p) => p.id === id);
  }

  getUnpublishedCount(): number {
    return (
      Object.keys(this.overlay.edits).length +
      this.overlay.adds.length +
      this.overlay.deletes.length +
      (this.contentOverlay ? 1 : 0)
    );
  }

  private hasPendingPublish(): boolean {
    return Boolean(safeGet("aki_admin_pending_v1"));
  }

  /** Upsert from the admin form (camelCase input). */
  upsertProduct(input: {
    id?: string;
    title: string;
    price: number;
    originalPrice?: number | null;
    image: string;
    images?: string[];
    description?: string | null;
    category: string;
    categories?: string[];
    rating?: number;
    inStock?: boolean;
    featured?: boolean;
    source?: string | null;
    sku?: string | null;
    sortOrder?: number | null;
  }): StoreProduct {
    const now = new Date().toISOString();
    const categories =
      input.categories && input.categories.length > 0
        ? input.categories
        : [input.category];
    const record: StoreProduct = {
      id: input.id ?? uid("p"),
      title: input.title.trim(),
      price: round2(input.price),
      original_price:
        input.originalPrice && input.originalPrice > 0
          ? round2(input.originalPrice)
          : null,
      image: input.image.trim(),
      category: input.category,
      categories,
      rating: input.rating ?? 4.5,
      in_stock: input.inStock ?? true,
      description: input.description?.trim() || null,
      images: input.images && input.images.length > 0 ? input.images : undefined,
      sku: input.sku?.trim() || null,
      source: input.source?.trim() || null,
      featured: input.featured ?? false,
      sort_order:
        input.sortOrder != null && Number.isFinite(input.sortOrder)
          ? Math.round(input.sortOrder)
          : undefined,
      created_at: input.id
        ? (this.getProduct(input.id)?.created_at ?? now)
        : now,
      updated_at: now,
    };
    this.applyProductRecord(record);
    return record;
  }

  private applyProductRecord(record: StoreProduct) {
    const addIdx = this.overlay.adds.findIndex((p) => p.id === record.id);
    if (addIdx >= 0) {
      this.overlay.adds[addIdx] = record;
    } else if (this.baseline.some((p) => p.id === record.id)) {
      this.overlay.edits[record.id] = record;
      const delIdx = this.overlay.deletes.indexOf(record.id);
      if (delIdx >= 0) this.overlay.deletes.splice(delIdx, 1);
    } else {
      this.overlay.adds.push(record);
    }
    this.persist();
  }

  /** Set the manual display position of one product (overlay edit).
   *  `order` = null clears the manual position (back to automatic). */
  setProductOrder(id: string, order: number | null) {
    const base = this.getProduct(id);
    if (!base) return;
    const rec: StoreProduct = {
      ...base,
      sort_order: order == null || !Number.isFinite(order) ? undefined : Math.round(order),
      updated_at: new Date().toISOString(),
    };
    this.applyProductRecord(rec);
  }

  patchProduct(id: string, patch: Partial<StoreProduct>) {
    const current = this.getProduct(id);
    if (!current) return;
    this.applyProductRecord({ ...current, ...patch, updated_at: new Date().toISOString() });
  }

  deleteProduct(id: string) {
    const addIdx = this.overlay.adds.findIndex((p) => p.id === id);
    if (addIdx >= 0) this.overlay.adds.splice(addIdx, 1);
    else if (this.baseline.some((p) => p.id === id)) {
      if (!this.overlay.deletes.includes(id)) this.overlay.deletes.push(id);
      delete this.overlay.edits[id];
    }
    this.persist();
  }

  duplicateProduct(id: string): StoreProduct | undefined {
    const src = this.getProduct(id);
    if (!src) return;
    const now = new Date().toISOString();
    const copy: StoreProduct = {
      ...src,
      id: uid("p"),
      title: `${src.title} (Copy)`,
      created_at: now,
      updated_at: now,
    };
    this.overlay.adds.push(copy);
    this.persist();
    return copy;
  }

  bulkPatch(ids: string[], patch: (p: StoreProduct) => Partial<StoreProduct>) {
    ids.forEach((id) => {
      const current = this.getProduct(id);
      if (current) this.applyProductRecord({ ...current, ...patch(current) });
    });
  }

  bulkDelete(ids: string[]) {
    ids.forEach((id) => this.deleteProduct(id));
  }

  /* ─────────── Category management ─────────── */

  /** Rename a category across every product that uses it.
   *  Updates both `category` and `categories[0]`; subcategories move along
   *  untouched. Renaming onto an existing category merges the two. Returns
   *  the number of products affected. */
  renameCategory(from: string, to: string): number {
    const src = from.trim();
    const dst = to.trim();
    if (!src || !dst || src === dst) return 0;
    const affected = this.getEffectiveProducts().filter((p) => p.category === src);
    const now = new Date().toISOString();
    affected.forEach((p) => {
      const cats = p.categories && p.categories.length > 0 ? [...p.categories] : [p.category];
      cats[0] = dst;
      this.applyProductRecord({ ...p, category: dst, categories: cats, updated_at: now });
    });
    return affected.length;
  }

  /** Delete a category. Its products are either deleted too, or moved to
   *  `moveTo` — where products without a subcategory can keep the old
   *  category name as their subcategory so they stay easy to find.
   *  Returns the number of products handled. */
  deleteCategory(
    name: string,
    opts: { deleteProducts: boolean; moveTo?: string; keepAsSubcategory?: boolean }
  ): number {
    const src = name.trim();
    if (!src) return 0;
    const affected = this.getEffectiveProducts().filter((p) => p.category === src);
    const now = new Date().toISOString();
    if (opts.deleteProducts) {
      affected.forEach((p) => this.deleteProduct(p.id));
      return affected.length;
    }
    const target = (opts.moveTo || "").trim();
    if (!target || target === src) return 0;
    affected.forEach((p) => {
      const subs = p.categories && p.categories.length > 1 ? p.categories.slice(1) : [];
      const cats =
        opts.keepAsSubcategory && subs.length === 0 ? [target, src] : [target, ...subs];
      this.applyProductRecord({
        ...p,
        category: target,
        categories: cats,
        updated_at: now,
      });
    });
    return affected.length;
  }

  /** Rename a subcategory inside one category. Every product in `category`
   *  carrying subcategory `from` gets it replaced by `to` (position kept);
   *  renaming onto an existing subcategory of the same category merges them.
   *  Returns the number of products affected. */
  renameSubcategory(category: string, from: string, to: string): number {
    const cat = category.trim();
    const src = from.trim();
    const dst = to.trim();
    if (!cat || !src || !dst || src === dst) return 0;
    const affected = this.getEffectiveProducts().filter(
      (p) =>
        p.category === cat &&
        p.categories &&
        p.categories.length > 1 &&
        p.categories.slice(1).includes(src)
    );
    const now = new Date().toISOString();
    affected.forEach((p) => {
      const cats = [...(p.categories as string[])];
      const idx = cats.indexOf(src);
      cats.splice(idx, 1);
      if (!cats.includes(dst)) cats.splice(idx, 0, dst); // same slot, no duplicates
      this.applyProductRecord({ ...p, categories: cats, updated_at: now });
    });
    return affected.length;
  }

  /** Delete a subcategory inside one category.
   *  - "strip": only the subcategory is removed — products stay in the
   *     category (without a subcategory if it was their only one).
   *  - "move": products' subcategory is replaced by `moveTo` (another
   *     subcategory of the same category).
   *  - "delete": the products carrying the subcategory are deleted too.
   *  Returns the number of products handled. */
  deleteSubcategory(
    category: string,
    name: string,
    opts: { mode: "strip" | "move" | "delete"; moveTo?: string }
  ): number {
    const cat = category.trim();
    const src = name.trim();
    if (!cat || !src) return 0;
    const affected = this.getEffectiveProducts().filter(
      (p) =>
        p.category === cat &&
        p.categories &&
        p.categories.length > 1 &&
        p.categories.slice(1).includes(src)
    );
    const now = new Date().toISOString();
    if (opts.mode === "delete") {
      affected.forEach((p) => this.deleteProduct(p.id));
      return affected.length;
    }
    const target = (opts.moveTo || "").trim();
    if (opts.mode === "move" && (!target || target === src)) return 0;
    affected.forEach((p) => {
      const cats = [...(p.categories as string[])];
      const idx = Math.max(1, cats.indexOf(src)); // never drop the category slot
      cats.splice(idx, 1);
      if (opts.mode === "move" && !cats.includes(target)) cats.splice(idx, 0, target);
      this.applyProductRecord({ ...p, categories: cats, updated_at: now });
    });
    return affected.length;
  }

  /** Apply a promo: strike the current price, sell at (1 - percent/100). */
  applyPromo(ids: string[], percent: number) {
    this.bulkPatch(ids, (p) => {
      const base = p.original_price && p.original_price > p.price ? p.original_price : p.price;
      const newPrice = round2(base * (1 - percent / 100));
      return {
        original_price: round2(base),
        price: Math.max(newPrice, 0.01),
      };
    });
  }

  removePromo(ids: string[]) {
    this.bulkPatch(ids, (p) => ({ original_price: null, price: p.price }));
  }

  adjustPrice(ids: string[], percent: number) {
    this.bulkPatch(ids, (p) => ({
      price: Math.max(round2(p.price * (1 + percent / 100)), 0.01),
    }));
  }

  exportCatalog(): string {
    return JSON.stringify(this.buildProductsFile(), null, 2);
  }

  importCatalog(json: string): { ok: boolean; error?: string; count?: number } {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) return { ok: false, error: "Expected a JSON array of products" };
      for (const p of data) {
        if (!p.id || !p.title || typeof p.price !== "number" || !p.image || !p.category) {
          return { ok: false, error: "Some products are missing required fields (id, title, price, image, category)" };
        }
      }
      const now = new Date().toISOString();
      this.overlay = { edits: {}, adds: [], deletes: [] };
      this.overlay.adds = data.map((p: StoreProduct) => ({
        ...p,
        created_at: p.created_at || now,
        updated_at: now,
      }));
      // adds replace the whole catalog on publish: mark baseline as deleted
      this.overlay.deletes = this.baseline.map((p) => p.id).filter((id) => !data.some((p: StoreProduct) => p.id === id));
      // remove ids that are both baseline and imported (they become edits)
      this.overlay.adds = this.overlay.adds.filter((p) => !this.baseline.some((b) => b.id === p.id));
      for (const p of data as StoreProduct[]) {
        if (this.baseline.some((b) => b.id === p.id)) this.overlay.edits[p.id] = { ...p, updated_at: now };
      }
      this.persist();
      return { ok: true, count: this.getEffectiveProducts().length };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Invalid JSON" };
    }
  }

  discardLocalChanges() {
    this.overlay = { edits: {}, adds: [], deletes: [] };
    this.contentOverlay = null;
    safeDel("aki_admin_pending_v1");
    this.publish = { state: "idle", message: "", at: null };
    this.stopPolling();
    this.persist();
  }

  /* ─────────── Content ─────────── */

  getContent(): StoreContent {
    return this.contentOverlay ?? this.baselineContent ?? {
      heroSlides: [],
      announcements: [],
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  setContent(content: StoreContent) {
    this.contentOverlay = content;
    this.persist();
  }

  private buildContentFile(): StoreContent {
    return this.getContent();
  }

  /* ─────────── Orders / Customers / Reviews ─────────── */

  getOrders(): StoreOrder[] {
    return [...this.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  updateOrder(id: string, patch: Partial<StoreOrder>) {
    const idx = this.orders.findIndex((o) => o.id === id);
    if (idx < 0) return;
    const now = new Date().toISOString();
    this.orders[idx] = { ...this.orders[idx], ...patch, updatedAt: now };
    this.persistOrders();

    // Sync status changes back to the store database for remote orders
    if (this.remoteOrderIds.has(id) && patch.status) {
      syncRemoteOrderStatus(id, patch.status);
    }
  }

  deleteOrder(id: string) {
    this.orders = this.orders.filter((o) => o.id !== id);
    this.persistOrders();

    // Remote orders: deletes are recorded as a soft-delete status
    // (PATCH /api/orders/<id> with status "deleted") that
    // refreshRemoteOrders filters out. The order disappears from
    // the panel and stays gone.
    if (this.remoteOrderIds.has(id)) {
      this.remoteOrderIds.delete(id);
      syncRemoteOrderStatus(id, "deleted");
    }
  }

  createOrder(order: Omit<StoreOrder, "id" | "createdAt" | "updatedAt">): StoreOrder {
    const now = new Date().toISOString();
    const record: StoreOrder = { ...order, id: uid("ord"), createdAt: now, updatedAt: now };
    this.orders.push(record);
    this.persistOrders();
    return record;
  }

  /* ─────────── Remote orders (store database) ─────────── */

  /**
   * Pull real customer orders (and their items) from the store database
   * and merge them with locally-recorded orders. Remote rows are the
   * source of truth for their ids; local-only records (manually recorded
   * by the admin) are always kept. Returns the number of remote orders.
   */
  async refreshRemoteOrders(): Promise<number> {
    try {
      // Orders + their line items come from the admin-gated server
      // route; each order row carries its items nested as `items`
      // (the browser no longer queries the database directly).
      const res = await fetch("/api/admin/orders", {
        credentials: "same-origin",
      });
      if (!res.ok) return 0;
      const payload = (await res.json().catch(() => null)) as {
        orders?: Record<string, unknown>[];
      } | null;
      const rows = payload?.orders;
      if (!rows) return 0;

      const itemsByOrder = new Map<string, StoreOrderItem[]>();
      for (const row of rows) {
        const oid = String(row.id ?? "");
        if (!oid) continue;
        const nested = Array.isArray(row.items)
          ? (row.items as Record<string, unknown>[])
          : [];
        itemsByOrder.set(
          oid,
          nested.map((item) => ({
            id: String(item.id ?? ""),
            title: String(item.title ?? ""),
            price: Number(item.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            image: (item.image as string | null) ?? null,
          }))
        );
      }

      const deletedRemoteIds = new Set(
        rows
          .filter((row) => String(row.status ?? "") === "deleted")
          .map((row) => String(row.id ?? ""))
      );
      const remote: StoreOrder[] = rows
        .filter((row) => !deletedRemoteIds.has(String(row.id ?? "")))
        .map((row) => ({
        id: String(row.id ?? ""),
        items: itemsByOrder.get(String(row.id ?? "")) || [],
        total: Number(row.total ?? 0),
        status: String(row.status ?? "pending"),
        customerName: (row.customer_name as string | null) ?? null,
        customerEmail: (row.customer_email as string | null) ?? null,
        customerPhone: (row.customer_phone as string | null) ?? null,
        shippingAddress: (row.shipping_address as string | null) ?? null,
        shippingCity: (row.shipping_city as string | null) ?? null,
        shippingCountry: (row.shipping_country as string | null) ?? null,
        shippingZip: (row.shipping_zip as string | null) ?? null,
        paymentMethod: (row.payment_method as string | null) ?? null,
        notes: (row.notes as string | null) ?? null,
        createdAt: String(row.created_at ?? ""),
        updatedAt: String(row.updated_at ?? ""),
      }));

      this.remoteOrderIds = new Set(remote.map((o) => o.id));
      // Keep purely-local orders (manually recorded), but purge stale local
      // copies of remote orders — including ones that were deleted in the
      // database — so deletions stick across reloads.
      const localOnly = this.orders.filter(
        (o) => !this.remoteOrderIds.has(o.id) && !deletedRemoteIds.has(o.id)
      );
      this.orders = [...localOnly, ...remote].sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
      this.persistOrders();
      this.notify();
      return remote.length;
    } catch {
      return 0;
    }
  }

  getReviews(): StoreReview[] {
    return [...this.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  upsertReview(review: Omit<StoreReview, "createdAt"> & { id?: string }) {
    const now = new Date().toISOString();
    if (review.id) {
      const idx = this.reviews.findIndex((r) => r.id === review.id);
      if (idx >= 0) {
        this.reviews[idx] = { ...this.reviews[idx], ...review } as StoreReview;
        this.persistReviews();
        return;
      }
    }
    this.reviews.push({ ...review, id: review.id ?? uid("rev"), createdAt: now } as StoreReview);
    this.persistReviews();
  }

  deleteReview(id: string) {
    this.reviews = this.reviews.filter((r) => r.id !== id);
    this.persistReviews();
  }

  /* ─────────── Stats ─────────── */

  getStats(): CatalogStats {
    const products = this.getEffectiveProducts();
    const activeOrders = this.orders.filter((o) => o.status !== "cancelled");
    const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const customers = new Map<string, { name: string; spent: number; orders: number }>();
    activeOrders.forEach((o) => {
      const key = (o.customerEmail || o.customerName || "unknown").toLowerCase();
      const entry = customers.get(key) || { name: o.customerName || key, spent: 0, orders: 0 };
      entry.spent += o.total;
      entry.orders += 1;
      customers.set(key, entry);
    });

    const ordersByStatus: Record<string, number> = {};
    this.orders.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    // Revenue over the last 7 days
    const days: { name: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayOrders = activeOrders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      });
      days.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: round2(dayOrders.reduce((s, o) => s + o.total, 0)),
        orders: dayOrders.length,
      });
    }

    return {
      totalProducts: products.length,
      totalOrders: this.orders.length,
      totalRevenue: round2(revenue),
      totalCustomers: customers.size,
      promosActive: products.filter((p) => (p.original_price ?? 0) > p.price).length,
      outOfStock: products.filter((p) => p.in_stock === false).length,
      catalogValue: round2(products.reduce((s, p) => s + p.price, 0)),
      ordersByStatus,
      revenueLast7Days: days,
    };
  }

  /* ─────────── Publishing (server-managed) ─────────── */

  /**
   * Publishing is handled by the server route /api/admin/publish, which
   * holds the GitHub token in its environment. The browser never sees,
   * stores, or sends a token — it only asks the server whether
   * publishing is configured and posts file payloads to publish.
   */
  async getTokenStatus(): Promise<TokenStatus> {
    const fallback: TokenStatus = {
      hasToken: false,
      active: false,
      expiresAt: null,
      expiryLabel: "—",
      daysLeft: null,
      canEdit: false,
      isCustom: false,
    };
    try {
      const res = await fetch("/api/admin/publish", { method: "GET" });
      if (!res.ok) return fallback;
      const data = await res.json().catch(() => null);
      const configured = Boolean(data?.configured);
      return { ...fallback, hasToken: configured, active: configured };
    } catch {
      return fallback;
    }
  }

  /** Build the products.json content to commit (canonical field order). */
  private buildProductsFile(): StoreProduct[] {
    const out = this.getEffectiveProducts().map((p) => {
      const rec: Record<string, unknown> = {
        id: p.id,
        title: p.title,
        price: round2(p.price),
      };
      if (p.original_price != null && p.original_price > 0) rec.original_price = round2(p.original_price);
      rec.image = p.image;
      rec.category = p.category;
      rec.categories = p.categories && p.categories.length ? p.categories : [p.category];
      if (p.rating != null) rec.rating = p.rating;
      rec.in_stock = p.in_stock !== false;
      if (p.description) rec.description = p.description;
      if (p.images && p.images.length) rec.images = p.images;
      if (p.sku) rec.sku = p.sku;
      if (p.source) rec.source = p.source;
      if (p.review_count) rec.review_count = p.review_count;
      if (p.featured) rec.featured = true;
      if (p.sort_order != null && Number.isFinite(p.sort_order)) rec.sort_order = Math.round(p.sort_order);
      if (p.created_at) rec.created_at = p.created_at;
      if (p.updated_at) rec.updated_at = p.updated_at;
      return rec as unknown as StoreProduct;
    });
    // One row per id (last occurrence wins) — the historical duplicate
    // rows in products.json came from stale overlay adds published twice.
    const byId = new Map<string, StoreProduct>();
    for (const rec of out) byId.set(rec.id, rec);
    return [...byId.values()];
  }

  async publishChanges(): Promise<{ ok: boolean; error?: string }> {
    if (this.getUnpublishedCount() === 0) {
      return { ok: false, error: "No unpublished changes" };
    }

    this.publish = { state: "publishing", message: "Publishing to the store repository…", at: new Date().toISOString() };
    this.notify();

    try {
      const productsJson = JSON.stringify(this.buildProductsFile(), null, 2);
      const contentJson = JSON.stringify(this.buildContentFile(), null, 2);
      const files: { path: string; content: string }[] = [
        { path: "public/products.json", content: productsJson },
        { path: "public/content.json", content: contentJson },
      ];

      // The server route verifies the admin session cookie and commits
      // the files to GitHub with its server-only publication token.
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Publish failed (HTTP ${res.status})`);
      }

      this.pendingHashes = {
        products: fnv1a(productsJson),
        content: fnv1a(contentJson),
      };
      safeSet(
        "aki_admin_pending_v1",
        JSON.stringify({ ...this.pendingHashes, at: new Date().toISOString() })
      );

      this.publish = {
        state: "waiting",
        message: "Published — waiting for the live store to rebuild (usually 2–5 min)…",
        at: new Date().toISOString(),
      };
      this.startPolling();
      this.notify();
      return { ok: true };
    } catch (err) {
      this.publish = {
        state: "error",
        message: err instanceof Error ? err.message : "Publish failed",
        at: new Date().toISOString(),
      };
      this.notify();
      return { ok: false, error: this.publish.message };
    }
  }

  private startPolling() {
    this.stopPolling();
    this.pollStart = Date.now();
    this.pollTimer = setInterval(() => this.checkRebuild(), POLL_INTERVAL_MS);
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /** Check whether the deployed files now match what we published. */
  async checkRebuild(): Promise<boolean> {
    const pending = this.pendingHashes.products || this.pendingHashes.content;
    if (!pending) return false;

    if (Date.now() - this.pollStart > POLL_MAX_MS) {
      this.stopPolling();
      this.publish = {
        state: "waiting",
        message: "Still waiting for the rebuild — refresh later or check the live store",
        at: this.publish.at,
      };
      this.notify();
      return false;
    }

    try {
      if (this.pendingHashes.products) {
        const res = await fetch(`/products.json?_ts=${Date.now()}`);
        if (!res.ok) return false;
        const text = await res.text();
        if (fnv1a(text.trim()) !== this.pendingHashes.products) return false;
      }
      if (this.pendingHashes.content) {
        const res = await fetch(`/content.json?_ts=${Date.now()}`);
        if (!res.ok) return false;
        const text = await res.text();
        if (fnv1a(text.trim()) !== this.pendingHashes.content) return false;
      }
    } catch {
      return false;
    }

    // Rebuild landed — adopt the live baseline and clear the overlay
    this.stopPolling();
    safeDel("aki_admin_pending_v1");
    await this.refreshBaseline();
    this.overlay = { edits: {}, adds: [], deletes: [] };
    this.contentOverlay = null;
    this.persist();
    this.publish = {
      state: "live",
      message: "Changes are live on the store!",
      at: new Date().toISOString(),
    };
    this.notify();
    return true;
  }

  async refreshBaseline() {
    try {
      const res = await fetch(`/products.json?_ts=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) this.baseline = data;
      }
    } catch {}
    try {
      const res = await fetch(`/content.json?_ts=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          this.baselineContent = {
            heroSlides: Array.isArray(data.heroSlides) ? data.heroSlides : [],
            announcements: Array.isArray(data.announcements) ? data.announcements : [],
            settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
          };
        }
      }
    } catch {}

    // Pull the latest customer orders from the store database too,
    // so Refresh picks up newly placed orders.
    await this.refreshRemoteOrders();
  }

}

/* Singleton */
export const adminStore = new AdminStore();
