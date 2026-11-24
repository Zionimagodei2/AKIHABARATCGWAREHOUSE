/* ────────────────────────────────────────────────────────────
   Server-side site content service.

   Live state = the newest row of site_publications (content +
   products snapshot). Before the first publish, live state = the
   compiled defaults, which are the current live text — so the
   storefront looks identical until the admin actually changes and
   publishes something.

   The admin draft is a single admin_draft row (id = 1). It starts
   as a copy of the live state; Publish applies it in ONE
   transaction (products table rewritten from the draft catalog,
   snapshot inserted, publications pruned to the last 3); Rollback
   restores one of those snapshots and resets the draft to it.

   Everything fails soft: with no DATABASE_URL (or any DB error)
   the site serves the compiled defaults exactly as before.
   ──────────────────────────────────────────────────────────── */

import { cache } from "react";
import { rawQuery, withTransaction } from "./pg-db";
import { DEFAULT_CONTENT } from "./content-defaults";
import {
  SET_HUBS,
  SET_INDEX,
  GUIDES,
  CALENDAR_UPCOMING,
  CALENDAR_RECENT,
} from "./content-data";
import { allProducts, cleanProducts as cleanFileProducts, type Product } from "./product-data";
import { POSTS, POST_SLUGS } from "./blog-data";
import type {
  BlogPostData,
  CalendarContent,
  GuidesContent,
  SetsContent,
  SiteContent,
} from "./content-types";
import type { StoreProduct } from "./admin-store";

/* ── Defaults (compiled) ── */

const SETS_DEFAULT: SetsContent = {
  hubs: SET_HUBS,
  index: {
    metaTitle: SET_INDEX.metaTitle,
    metaDescription: SET_INDEX.metaDescription,
    eyebrow: "Editorial",
    title: "TCG Set Guides",
    intro:
      "In-depth guides to the sets that matter: release dates, box configurations, new rarities and chase cards — with links to buy authentic sealed product direct from Japan.",
  },
};

const GUIDES_DEFAULT: GuidesContent = {
  items: GUIDES,
  index: {
    metaTitle: "TCG Buying Guides: Fakes, Japanese vs English & More",
    metaDescription:
      "Practical TCG buying guides: spotting fake Japanese Pokémon cards, Japanese vs English compared, and buying One Piece cards safely online.",
    eyebrow: "Editorial",
    title: "TCG Buying Guides",
    intro:
      "Practical, no-nonsense guides for collectors: how to avoid fakes, what actually differs between Japanese and English product, and how to buy safely online.",
  },
};

const CALENDAR_DEFAULT: CalendarContent = {
  metaTitle: "TCG Release Calendar: Pokémon, One Piece, Dragon Ball",
  metaDescription:
    "Every upcoming Japanese & English TCG release: dates for Pokémon, One Piece Card Game and Dragon Ball Fusion World sets. Updated monthly.",
  ogTitle: "TCG Release Calendar 2026–2027",
  ogDescription:
    "Release dates for upcoming Pokémon, One Piece and Dragon Ball TCG sets — Japanese and English. Bookmark and check monthly.",
  articleDescription:
    "Release dates for upcoming Pokémon, One Piece Card Game and Dragon Ball Fusion World TCG sets.",
  eyebrow: "Editorial",
  title: "TCG Release Calendar 2026–2027",
  updatedLine:
    "Updated October 5, 2026 · Japanese & English releases · Bookmark this page — we update it monthly",
  intro:
    "Every confirmed upcoming release for Pokémon, the One Piece Card Game and Dragon Ball Super Card Game Fusion World. Dates are from official publisher announcements; anything unconfirmed is marked.",
  upcomingTitle: "Upcoming releases",
  recentTitle: "Recent releases",
  upcoming: CALENDAR_UPCOMING,
  recent: CALENDAR_RECENT,
  ctaTitle: "Never miss a release.",
  ctaText:
    "Pre-order sealed Japanese boxes direct from Japan — before allocation sells out.",
  faqs: [
    { q: "What is the next One Piece Card Game set?", a: "EB-05 Heroines Edition vol.2 on October 30, 2026, then OP-18 The Dominance of God on November 20, 2026." },
    { q: "What is the next Dragon Ball Fusion World set?", a: "FB11 Brightness of Hope (October 16, 2026), then FB12 Reach the God (December 18, 2026)." },
    { q: "When should I pre-order?", a: "As early as possible. Japanese allocation for hyped sets routinely sells through before street date — pre-ordering locks in release pricing instead of aftermarket pricing." },
  ],
  footnote:
    "Dates from official Bandai / Pokémon announcements; unconfirmed dates are marked and updated as announced.",
};

/** The full compiled default content (current live text). */
export function fullDefaultContent(): SiteContent {
  return {
    ...DEFAULT_CONTENT,
    sets: SETS_DEFAULT,
    guides: GUIDES_DEFAULT,
    calendar: CALENDAR_DEFAULT,
  };
}

/* ── Merging ── */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge stored content over the compiled defaults (per key). */
export function mergeContent(partial: unknown): SiteContent {
  const defaults = fullDefaultContent();
  if (!isPlainObject(partial)) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof SiteContent)[]) {
    const stored = (partial as Record<string, unknown>)[key];
    if (stored === undefined || stored === null) continue;
    const def = defaults[key];
    if (Array.isArray(def)) {
      if (Array.isArray(stored)) out[key] = stored;
    } else if (isPlainObject(def) && isPlainObject(stored)) {
      if (key === "categoryPages") {
        const merged: Record<string, unknown> = { ...def };
        for (const [catKey, catVal] of Object.entries(stored)) {
          merged[catKey] = isPlainObject(catVal)
            ? { ...(def as Record<string, unknown>)[catKey] as object, ...catVal }
            : catVal;
        }
        out[key] = merged;
      } else {
        out[key] = { ...def, ...stored };
      }
    } else {
      out[key] = stored;
    }
  }
  return out as unknown as SiteContent;
}

/* ── Live (published) state ── */

interface PublicationRow {
  id: number | string;
  published_at: string;
  note: string | null;
  content: unknown;
  products: unknown;
}

async function latestPublication(): Promise<PublicationRow | null> {
  const { rows } = await rawQuery<PublicationRow>(
    "select id, published_at, note, content, products from site_publications order by published_at desc, id desc limit 1",
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

/** The published content, merged over compiled defaults. */
export const getPublishedContent = cache(async (): Promise<SiteContent> => {
  try {
    const pub = await latestPublication();
    if (pub) return mergeContent(pub.content);
  } catch {
    /* fail soft to compiled defaults */
  }
  return fullDefaultContent();
});

/**
 * The live catalog in the server-page (file) shape: the newest
 * publication's product snapshot when one exists, otherwise the
 * compiled catalog (public/products.json).
 */
export const getPublishedCatalog = cache(async (): Promise<Product[]> => {
  try {
    const pub = await latestPublication();
    if (pub && Array.isArray(pub.products) && pub.products.length > 0) {
      return cleanFileProducts(pub.products);
    }
  } catch {
    /* fail soft */
  }
  return allProducts;
});

export async function getPublishedProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const catalog = await getPublishedCatalog();
  return catalog.find((p) => p.slug === slug);
}

/** relatedProducts(), but against an explicit catalog. */
export function relatedFromCatalog(
  catalog: Product[],
  p: Product,
  count = 4,
): Product[] {
  const sameCategory = catalog.filter(
    (x) => x.category === p.category && x.id !== p.id,
  );
  const sameSub = sameCategory.filter((x) => x.subcategory === p.subcategory);
  const pool = sameSub.length >= count ? sameSub : sameCategory;
  return pool.slice(0, count);
}

/* ── Products table <-> StoreProduct ── */

const PRODUCT_COLUMNS = new Set([
  "id", "title", "price", "original_price", "image", "images",
  "description", "category", "categories", "rating", "review_count",
  "in_stock", "featured", "source", "sku", "created_at", "updated_at",
]);

/** Split a StoreProduct into table columns + a `data` extras object.
 *  StoreProduct is the products.json shape (snake_case). */
export function productToRow(p: StoreProduct): {
  columns: Record<string, unknown>;
  data: Record<string, unknown>;
} {
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p as unknown as Record<string, unknown>)) {
    if (!PRODUCT_COLUMNS.has(k) && v !== undefined) data[k] = v;
  }
  return {
    columns: {
      id: p.id,
      title: p.title,
      price: p.price,
      original_price: p.original_price ?? null,
      image: p.image,
      images: p.images ?? [p.image],
      description: p.description ?? "",
      category: p.category,
      categories: p.categories ?? [p.category],
      rating: p.rating ?? 4.5,
      review_count: p.review_count ?? 0,
      in_stock: p.in_stock !== false,
      featured: p.featured === true,
      source: p.source ?? null,
      sku: p.sku ?? null,
    },
    data,
  };
}

const INSERT_PRODUCT_SQL = `insert into products
  (id, title, price, original_price, image, images, description, category,
   categories, rating, review_count, in_stock, featured, source, sku, data)
  values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`;

function productInsertParams(p: StoreProduct): unknown[] {
  const { columns, data } = productToRow(p);
  return [
    columns.id, columns.title, columns.price, columns.original_price,
    columns.image, JSON.stringify(columns.images), columns.description,
    columns.category, JSON.stringify(columns.categories), columns.rating,
    columns.review_count, columns.in_stock, columns.featured,
    columns.source, columns.sku, JSON.stringify(data),
  ];
}

/** Rebuild a file-shape product from a products-table row — the exact
 *  transform /api/products serves, with the `data` extras column
 *  merged back in so admin-managed fields (sort_order, language,
 *  stock, …) round-trip through publish. */
export function rowToFileProduct(row: Record<string, unknown>): Record<string, unknown> {
  const data = isPlainObject(row.data) ? row.data : {};
  const parseArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v as string[];
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  return {
    ...data,
    id: row.id,
    title: row.title,
    price: row.price,
    original_price: row.original_price ?? null,
    image: row.image,
    images: parseArray(row.images),
    description: row.description ?? null,
    category: row.category,
    categories: parseArray(row.categories),
    rating: row.rating ?? 4.5,
    review_count: row.review_count ?? 0,
    in_stock: row.in_stock ?? true,
    featured: row.featured ?? false,
    source: row.source ?? null,
    sku: row.sku ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Light cleanup for StoreProduct arrays read back from jsonb. */
function cleanStoreProducts(raw: unknown): StoreProduct[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (p): p is StoreProduct =>
        isPlainObject(p) &&
        typeof (p as StoreProduct).id === "string" &&
        typeof (p as StoreProduct).title === "string" &&
        typeof (p as StoreProduct).price === "number" &&
        (p as StoreProduct).price > 0 &&
        typeof (p as StoreProduct).image === "string" &&
        typeof (p as StoreProduct).category === "string",
    )
    .map((p) => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      categories: p.categories && p.categories.length > 0 ? p.categories : [p.category],
      description: p.description ?? "",
      rating: p.rating ?? 4.5,
      review_count: p.review_count ?? 0,
      in_stock: p.in_stock !== false,
    }));
}

/* ── Draft ── */

export interface DraftState {
  products: StoreProduct[];
  content: SiteContent;
}

/** Read the admin draft, initializing it from live state if needed. */
export async function getOrInitDraft(): Promise<DraftState> {
  const { rows } = await rawQuery<{ products: unknown; content: unknown }>(
    "select products, content from admin_draft where id = 1",
  );
  if (rows && rows.length > 0) {
    const products = cleanStoreProducts(rows[0].products);
    return { products, content: mergeContent(rows[0].content) };
  }
  const pub = await latestPublication();
  const draft: DraftState = {
    products:
      pub && Array.isArray(pub.products) && pub.products.length > 0
        ? cleanStoreProducts(pub.products)
        : (allProducts as unknown as StoreProduct[]),
    content: pub ? mergeContent(pub.content) : fullDefaultContent(),
  };
  await rawQuery(
    `insert into admin_draft (id, products, content) values (1, $1, $2)
     on conflict (id) do nothing`,
    [JSON.stringify(draft.products), JSON.stringify(draft.content)],
  );
  return draft;
}

/** Overwrite the whole draft. */
export async function saveDraft(draft: DraftState): Promise<{ error: string | null }> {
  const { error } = await rawQuery(
    `insert into admin_draft (id, products, content) values (1, $1, $2)
     on conflict (id) do update set products = excluded.products,
       content = excluded.content, updated_at = now()`,
    [JSON.stringify(draft.products), JSON.stringify(draft.content)],
  );
  return { error };
}

/** Discard the draft (next read re-initializes it from live state). */
export async function deleteDraft(): Promise<{ error: string | null }> {
  const { error } = await rawQuery("delete from admin_draft where id = 1");
  return { error };
}

/* ── Publish / rollback ── */

/**
 * Apply the draft: rewrite the products table, snapshot content +
 * products as a new publication, prune publications to the last 3.
 * One transaction — either everything lands or nothing does.
 */
export async function publishDraft(
  note?: string,
): Promise<{ publicationId: number | null; error: string | null }> {
  const draft = await getOrInitDraft();
  const result = await withTransaction(async (q) => {
    await q("delete from products");
    for (const p of draft.products) {
      await q(INSERT_PRODUCT_SQL, productInsertParams(p));
    }
    const inserted = await q<{ id: number }>(
      "insert into site_publications (note, content, products) values ($1, $2, $3) returning id",
      [note ?? null, JSON.stringify(draft.content), JSON.stringify(draft.products)],
    );
    await q(
      `delete from site_publications where id not in
         (select id from site_publications order by published_at desc, id desc limit 3)`,
    );
    return Number(inserted[0]?.id ?? 0);
  });
  if (result.error) return { publicationId: null, error: result.error };
  return { publicationId: result.data, error: null };
}

export interface PublicationSummary {
  id: number;
  publishedAt: string;
  note: string | null;
  productCount: number;
}

export async function listPublications(): Promise<PublicationSummary[]> {
  const { rows } = await rawQuery<{
    id: number | string;
    published_at: string;
    note: string | null;
    product_count: number | string;
  }>(
    `select id, published_at, note, jsonb_array_length(products) as product_count
       from site_publications order by published_at desc, id desc limit 3`,
  );
  return (rows ?? []).map((r) => ({
    id: Number(r.id),
    publishedAt: new Date(r.published_at).toISOString(),
    note: r.note,
    productCount: Number(r.product_count),
  }));
}

/** Restore a publication: products table + live content + draft. */
export async function rollbackToPublication(
  publicationId: number,
): Promise<{ error: string | null }> {
  const { rows } = await rawQuery<PublicationRow>(
    "select id, published_at, note, content, products from site_publications where id = $1",
    [publicationId],
  );
  if (!rows || rows.length === 0) return { error: "Publication not found" };
  const target = rows[0];
  const products = Array.isArray(target.products)
    ? cleanStoreProducts(target.products)
    : [];
  const content = mergeContent(target.content);
  const result = await withTransaction(async (q) => {
    await q("delete from products");
    for (const p of products) {
      await q(INSERT_PRODUCT_SQL, productInsertParams(p));
    }
    await q(
      "insert into site_publications (note, content, products) values ($1, $2, $3)",
      [
        `Rollback to publication #${publicationId}`,
        JSON.stringify(content),
        JSON.stringify(products),
      ],
    );
    await q(
      `delete from site_publications where id not in
         (select id from site_publications order by published_at desc, id desc limit 3)`,
    );
    await q(
      `insert into admin_draft (id, products, content) values (1, $1, $2)
       on conflict (id) do update set products = excluded.products,
         content = excluded.content, updated_at = now()`,
      [JSON.stringify(products), JSON.stringify(content)],
    );
    return true;
  });
  return { error: result.error };
}

/* ── Blog posts (DB overlay over compiled blog-data.ts) ── */

interface BlogRow {
  slug: string;
  draft: BlogPostData | null;
  published: BlogPostData | null;
}

async function blogRow(slug: string): Promise<BlogRow | null> {
  const { rows } = await rawQuery<BlogRow>(
    "select slug, draft, published from blog_posts where slug = $1",
    [slug],
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

/** The post the public blog renders: DB-published wins, else compiled. */
export async function getPostForRender(
  slug: string,
): Promise<BlogPostData | undefined> {
  try {
    const row = await blogRow(slug);
    if (row?.published) return row.published;
  } catch {
    /* fail soft */
  }
  return POSTS[slug] as BlogPostData | undefined;
}

/** All blog slugs the sitemap / index should list (compiled ∪ DB). */
export async function getAllBlogSlugs(): Promise<string[]> {
  const slugs = new Set<string>(POST_SLUGS);
  try {
    const { rows } = await rawQuery<{ slug: string }>(
      "select slug from blog_posts where published is not null",
    );
    for (const r of rows ?? []) slugs.add(r.slug);
  } catch {
    /* fail soft */
  }
  return [...slugs];
}

/** Posts for the blog index, newest first (DB-published wins). */
export async function getBlogIndexPosts(): Promise<BlogPostData[]> {
  const bySlug = new Map<string, BlogPostData>();
  for (const slug of POST_SLUGS) {
    const p = POSTS[slug] as unknown as BlogPostData;
    if (p) bySlug.set(slug, p);
  }
  try {
    const { rows } = await rawQuery<BlogRow>(
      "select slug, draft, published from blog_posts where published is not null",
    );
    for (const r of rows ?? []) {
      if (r.published) bySlug.set(r.slug, r.published);
    }
  } catch {
    /* fail soft */
  }
  return [...bySlug.values()].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished),
  );
}

export interface AdminBlogSummary {
  slug: string;
  h1: string;
  datePublished: string;
  source: "compiled" | "imported" | "admin";
  hasDraft: boolean;
  isPublished: boolean;
}

/** Admin post list: every compiled post plus DB-only posts. */
export async function listAdminBlogPosts(): Promise<AdminBlogSummary[]> {
  const bySlug = new Map<string, AdminBlogSummary>();
  for (const slug of POST_SLUGS) {
    const p = POSTS[slug];
    if (!p) continue;
    bySlug.set(slug, {
      slug,
      h1: p.h1,
      datePublished: p.datePublished,
      source: "compiled",
      hasDraft: false,
      isPublished: true,
    });
  }
  try {
    const { rows } = await rawQuery<BlogRow>("select slug, draft, published from blog_posts");
    for (const r of rows ?? []) {
      const existing = bySlug.get(r.slug);
      const effective = r.draft ?? r.published;
      bySlug.set(r.slug, {
        slug: r.slug,
        h1: effective?.h1 ?? existing?.h1 ?? r.slug,
        datePublished: effective?.datePublished ?? existing?.datePublished ?? "",
        source: existing ? "imported" : "admin",
        hasDraft: r.draft != null,
        isPublished: r.published != null || existing != null,
      });
    }
  } catch {
    /* fail soft */
  }
  return [...bySlug.values()].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished),
  );
}

/** The editable copy of a post: draft ?? published ?? compiled. */
export async function getAdminBlogPost(
  slug: string,
): Promise<{ post: BlogPostData; versions: { id: number; publishedAt: string }[] } | null> {
  const row = await blogRow(slug);
  const post = row?.draft ?? row?.published ?? (POSTS[slug] as BlogPostData | undefined);
  if (!post) return null;
  const { rows } = await rawQuery<{ id: number | string; published_at: string }>(
    "select id, published_at from blog_post_versions where slug = $1 order by id desc limit 3",
    [slug],
  );
  return {
    post,
    versions: (rows ?? []).map((v) => ({
      id: Number(v.id),
      publishedAt: new Date(v.published_at).toISOString(),
    })),
  };
}

/** Import every compiled post into blog_posts.published (idempotent). */
export async function importCompiledBlogPosts(): Promise<{ imported: number; error: string | null }> {
  let imported = 0;
  for (const slug of POST_SLUGS) {
    const post = POSTS[slug];
    if (!post) continue;
    const { error } = await rawQuery(
      `insert into blog_posts (slug, published) values ($1, $2)
       on conflict (slug) do nothing`,
      [slug, JSON.stringify(post)],
    );
    if (error) return { imported, error };
    imported++;
  }
  return { imported, error: null };
}

export async function saveBlogDraft(
  slug: string,
  post: BlogPostData,
): Promise<{ error: string | null }> {
  const { error } = await rawQuery(
    `insert into blog_posts (slug, draft) values ($1, $2)
     on conflict (slug) do update set draft = excluded.draft, updated_at = now()`,
    [slug, JSON.stringify({ ...post, slug })],
  );
  return { error };
}

export async function publishBlogPost(
  slug: string,
): Promise<{ error: string | null }> {
  const row = await blogRow(slug);
  const post = row?.draft ?? row?.published ?? (POSTS[slug] as BlogPostData | undefined);
  if (!post) return { error: "Post not found" };
  const result = await withTransaction(async (q) => {
    await q("insert into blog_post_versions (slug, post) values ($1, $2)", [
      slug,
      JSON.stringify(post),
    ]);
    await q(
      `delete from blog_post_versions where slug = $1 and id not in
         (select id from blog_post_versions where slug = $1 order by id desc limit 3)`,
      [slug],
    );
    await q(
      `insert into blog_posts (slug, draft, published) values ($1, $2, $2)
       on conflict (slug) do update set draft = excluded.draft,
         published = excluded.published, updated_at = now()`,
      [slug, JSON.stringify(post)],
    );
    return true;
  });
  return { error: result.error };
}

export async function rollbackBlogPost(
  slug: string,
  versionId: number,
): Promise<{ error: string | null }> {
  const { rows } = await rawQuery<{ post: BlogPostData }>(
    "select post from blog_post_versions where id = $1 and slug = $2",
    [versionId, slug],
  );
  if (!rows || rows.length === 0) return { error: "Version not found" };
  const post = rows[0].post;
  const result = await withTransaction(async (q) => {
    await q("insert into blog_post_versions (slug, post) values ($1, $2)", [
      slug,
      JSON.stringify(post),
    ]);
    await q(
      `delete from blog_post_versions where slug = $1 and id not in
         (select id from blog_post_versions where slug = $1 order by id desc limit 3)`,
      [slug],
    );
    await q(
      `insert into blog_posts (slug, draft, published) values ($1, $2, $2)
       on conflict (slug) do update set draft = excluded.draft,
         published = excluded.published, updated_at = now()`,
      [slug, JSON.stringify(post)],
    );
    return true;
  });
  return { error: result.error };
}
