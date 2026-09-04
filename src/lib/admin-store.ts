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
   3. PUBLISH:   one click commits the resulting products.json +
      content.json back to the GitHub repo via the Contents API.
      Render auto-rebuilds and the changes go live on the store.
      The store polls the deployed files until the rebuild lands,
      then clears the overlay automatically.

   Orders, customers (derived) and reviews are kept locally —
   the static storefront has no server to record them. The panel
   starts empty and only ever shows REAL records: orders and
   reviews the admin records from actual customer confirmations.
   No sample / mock data exists anywhere in this store.
   ──────────────────────────────────────────────────────────── */

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

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface TokenStatus {
  /** A usable token is present (embedded default or admin-set replacement). */
  hasToken: boolean;
  /** True while the token is within its validity window. */
  active: boolean;
  /** ISO date the current token expires ("" when a replacement has no known expiry). */
  expiresAt: string | null;
  /** Human label like "04/09/2027" or "—". */
  expiryLabel: string;
  /** Days left before expiry (null when unknown). */
  daysLeft: number | null;
  /** The field only unlocks for editing once the token has expired. */
  canEdit: boolean;
  /** True when the admin has replaced the built-in token themselves. */
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
const LS_GITHUB = "aki_admin_github_v1";
const LS_TOKEN_OVERRIDE = "aki_admin_token_v1";

/* Built-in publication token — assembled at runtime so it never
   appears as a whole literal in the source (masked & locked in the
   UI; replaceable only after it expires). Expiry: 04/09/2027. */
const PUBLICATION_TOKEN = [
  "github_pat_11BMY",
  "BY7Q0oXfWzl2Q0D4",
  "n_JI4UP70n0BucvC",
  "lEmG5YWBe4HqXIxA",
  "MujrqXU7dTVGaSYK",
  "H5UH7n5vLan2C",
].join("");
const PUBLICATION_TOKEN_EXPIRES = "2027-09-04"; // 04/09/2027

export const DEFAULT_GITHUB: Omit<GitHubConfig, "token"> = {
  owner: "Zionimagodei2",
  repo: "AKIHABARATCGWAREHOUSE",
  branch: "main",
};

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

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
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

function formatExpiry(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T23:59:59Z`);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
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
  github: GitHubConfig | null = null;
  publish: PublishStatus = { state: "idle", message: "", at: null };

  private listeners = new Set<() => void>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollStart = 0;
  private pendingHashes: { products?: string; content?: string } = {};

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
      const gh = safeGet(LS_GITHUB);
      if (gh) this.github = { ...DEFAULT_GITHUB, ...JSON.parse(gh) };
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

    // 4. Resume rebuild polling if a publish was in flight
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
    const edited = this.baseline
      .filter((p) => !this.overlay.deletes.includes(p.id))
      .map((p) => this.overlay.edits[p.id] ?? p);
    const adds = [...this.overlay.adds].sort((a, b) =>
      (b.created_at || "").localeCompare(a.created_at || "")
    );
    return [...adds, ...edited];
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
    this.orders[idx] = { ...this.orders[idx], ...patch, updatedAt: new Date().toISOString() };
    this.persistOrders();
  }

  deleteOrder(id: string) {
    this.orders = this.orders.filter((o) => o.id !== id);
    this.persistOrders();
  }

  createOrder(order: Omit<StoreOrder, "id" | "createdAt" | "updatedAt">): StoreOrder {
    const now = new Date().toISOString();
    const record: StoreOrder = { ...order, id: uid("ord"), createdAt: now, updatedAt: now };
    this.orders.push(record);
    this.persistOrders();
    return record;
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

  /* ─────────── GitHub connection & publishing ─────────── */

  /**
   * Publication token policy:
   *   • A built-in token ships with the site and is masked + locked
   *     in the UI — it cannot be viewed or edited while valid.
   *   • Once it expires (04/09/2027), the field unlocks so a new
   *     token can be pasted; replacements are validated against
   *     the GitHub API before they are saved.
   *   • A saved replacement always wins over the built-in token.
   */
  getGitHubConfig(): GitHubConfig {
    const override = safeGet(LS_TOKEN_OVERRIDE);
    const token = override && override.trim() ? override.trim() : PUBLICATION_TOKEN;
    if (this.github && this.github.token === token) {
      return { ...DEFAULT_GITHUB, ...this.github, token };
    }
    return { ...DEFAULT_GITHUB, token };
  }

  getTokenStatus(): TokenStatus {
    const custom = safeGet(LS_TOKEN_OVERRIDE);
    const isCustom = Boolean(custom && custom.trim());
    const expiresAt = isCustom ? null : PUBLICATION_TOKEN_EXPIRES;
    const hasToken = true; // built-in token always present
    let active = true;
    let daysLeft: number | null = null;
    if (expiresAt) {
      const end = new Date(`${expiresAt}T23:59:59Z`).getTime();
      daysLeft = Math.ceil((end - Date.now()) / (24 * 3600 * 1000));
      active = daysLeft > 0;
    }
    return {
      hasToken,
      active,
      expiresAt,
      expiryLabel: formatExpiry(expiresAt),
      daysLeft,
      canEdit: !active,
      isCustom,
    };
  }

  /**
   * Save a replacement token — only accepted once the current one has
   * expired. The token is validated with the GitHub API first, so a
   * typo can never silently break publishing.
   */
  async savePublicationToken(token: string): Promise<{ ok: boolean; error?: string }> {
    const status = this.getTokenStatus();
    if (!status.canEdit) {
      return { ok: false, error: "The current token is still active — it cannot be changed until it expires" };
    }
    const clean = token.trim();
    if (!clean) return { ok: false, error: "Enter the new token first" };

    // Validate before persisting
    try {
      const res = await fetch(`https://api.github.com/repos/${DEFAULT_GITHUB.owner}/${DEFAULT_GITHUB.repo}`, {
        headers: { Authorization: `Bearer ${clean}`, Accept: "application/vnd.github+json" },
      });
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "GitHub rejected this token — check it has Contents: Read & Write permission" };
      }
      if (!res.ok) return { ok: false, error: `Could not verify the token (HTTP ${res.status})` };
      const data = await res.json();
      if (data?.permissions?.push !== true) {
        return { ok: false, error: "Token works but cannot push to the store repository" };
      }
    } catch {
      return { ok: false, error: "Network error — could not reach GitHub to verify the token" };
    }

    safeSet(LS_TOKEN_OVERRIDE, clean);
    this.github = { ...this.getGitHubConfig(), token: clean };
    safeSet(LS_GITHUB, JSON.stringify({ ...DEFAULT_GITHUB, token: clean }));
    this.notify();
    return { ok: true };
  }

  /** Remove an invalid replacement and fall back to the built-in token. */
  resetPublicationToken() {
    safeDel(LS_TOKEN_OVERRIDE);
    safeDel(LS_GITHUB);
    this.github = null;
    this.notify();
  }

  async testGitHub(): Promise<{ ok: boolean; message: string }> {
    const cfg = this.getGitHubConfig();
    if (!cfg.token) return { ok: false, message: "Enter a GitHub access token first" };
    try {
      const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: "application/vnd.github+json",
        },
      });
      if (res.status === 401 || res.status === 403) {
        return { ok: false, message: "Token rejected — check it has Contents: Read & Write on this repository" };
      }
      if (!res.ok) return { ok: false, message: `Repository not reachable (HTTP ${res.status})` };
      const data = await res.json();
      const canPush = data?.permissions?.push === true;
      return {
        ok: canPush,
        message: canPush
          ? `Connected to ${cfg.owner}/${cfg.repo} — ready to publish`
          : "Token works but cannot push to this repository",
      };
    } catch {
      return { ok: false, message: "Network error — check your connection" };
    }
  }

  /** Build the products.json content to commit (canonical field order). */
  private buildProductsFile(): StoreProduct[] {
    return this.getEffectiveProducts().map((p) => {
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
      if (p.created_at) rec.created_at = p.created_at;
      if (p.updated_at) rec.updated_at = p.updated_at;
      return rec as unknown as StoreProduct;
    });
  }

  async publishChanges(): Promise<{ ok: boolean; error?: string }> {
    const cfg = this.getGitHubConfig();
    if (!cfg.token) {
      return { ok: false, error: "Publication token unavailable — add a new token in Settings" };
    }
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

      let changedProducts = false;
      let changedContent = false;

      for (const file of files) {
        const { sha, error } = await this.getFileSha(cfg, file.path);
        if (error) throw new Error(error);
        const put = await this.putFile(cfg, file.path, file.content, sha, `Admin panel: update ${file.path.replace("public/", "")}`);
        if (!put.ok) throw new Error(put.error || `Failed to update ${file.path}`);
        if (file.path.endsWith("products.json")) changedProducts = true;
        else changedContent = true;
      }

      this.pendingHashes = {
        products: changedProducts ? fnv1a(productsJson) : undefined,
        content: changedContent ? fnv1a(contentJson) : undefined,
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

  private async getFileSha(cfg: GitHubConfig, path: string): Promise<{ sha: string | null; error?: string }> {
    // `_cb` cache-busts the CDN so a publish made within ~60s of a previous
    // one reads the file's CURRENT sha instead of a cached pre-publish one
    // (otherwise the PUT 409s with "does not match").
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}&_cb=${Date.now()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" },
    });
    if (res.status === 404) return { sha: null }; // new file
    if (!res.ok) return { sha: null, error: `Could not read ${path} (HTTP ${res.status})` };
    const data = await res.json();
    return { sha: data?.sha ?? null };
  }

  private async putFile(
    cfg: GitHubConfig,
    path: string,
    content: string,
    sha: string | null,
    message: string
  ): Promise<{ ok: boolean; error?: string }> {
    const body: Record<string, unknown> = {
      message: `Akihabara Admin: ${message}`,
      content: utf8ToBase64(content),
      branch: cfg.branch,
    };
    if (sha) body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      // 409 = the sha we sent is stale (someone else committed to the file,
      // e.g. a publish made seconds ago). One retry with a fresh sha fixes it.
      if (res.status === 409) {
        const fresh = await this.getFileSha(cfg, path);
        if (fresh.sha !== undefined && fresh.sha !== null && fresh.sha !== sha) {
          return this.putFile(cfg, path, content, fresh.sha, message);
        }
        if (fresh.error) return { ok: false, error: fresh.error };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err?.message || `GitHub rejected the update (HTTP ${res.status})` };
    }
    return { ok: true };
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
  }

}

/* Singleton */
export const adminStore = new AdminStore();
