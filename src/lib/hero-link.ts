/* ────────────────────────────────────────────────────────────
   Hero slide → target resolution (shared by storefront + admin)

   The hero "Shop Now" button links each slide to the most relevant
   destination, fully automatic:

     1. Explicit link — slide.productId set from the admin panel
     2. Image match  — slide.image equals a product's image
     3. Set-code match — a series code in the slide title (OP-18,
        EB-04, PRB-02, M6a, SV11W, B32, FB12, SB02, ST17, HBP01…)
        matches product titles (word-boundary safe: OP-18 never
        matches OP-1)
     4. Category fallback — the slide text names a category
        ("ONE PIECE", "Pokémon", "Dragon Ball"…) → open that
        category in the shop
     5. null — keep the classic behaviour (scroll to products)

   Because matching runs at view time against the live catalog, a
   slide added by the admin links itself as soon as the matching
   product exists — no manual wiring needed.
   ──────────────────────────────────────────────────────────── */

import { slugify } from "./product-data";

export interface LinkableSlide {
  image?: string;
  title?: string;
  subtitle?: string;
  accent?: string;
  productId?: string | null;
}

export interface LinkableProduct {
  id: string;
  title: string;
  image: string;
  category?: string;
  categories?: string[];
  subcategory?: string;
  in_stock?: boolean;
  slug?: string;
}

export type SlideTarget =
  | { kind: "product"; product: LinkableProduct; slug: string }
  | { kind: "category"; category: string; subcategory?: string }
  | null;

/* ── Slug map (mirrors product-data.ts cleanProducts: deterministic
      slugs with -2/-3 collision suffixes, in catalog order) ── */
export function buildSlugMap(products: LinkableProduct[]): Map<string, string> {
  const seen = new Map<string, number>();
  const map = new Map<string, string>();
  for (const p of products) {
    let slug = slugify(p.title || "");
    const n = seen.get(slug) || 0;
    seen.set(slug, n + 1);
    if (n > 0) slug = `${slug}-${n + 1}`;
    map.set(p.id, slug);
  }
  return map;
}

/* ── Set-code extraction ──
   Matches codes like OP-01, OP18, EB-04, PRB-02, ST17, SV11W, PR-03,
   M6a, M6, HBP01, QBT, CB16, UA45BT, DBS-B32, B32, FB12, SB02.
   Capturing the full token keeps OP-18 from matching OP-1. */
const SET_CODE_RE =
  /\b(OP|EB|PRB|ST|SV|PR|M\d+[A-Za-z]?|HBP|QBT|CB|UA|DB|FS|B|FB|SB)[-‑–\s]?(\d+[A-Za-z]?)\b/gi;

export function extractSetCodes(text: string): string[] {
  const codes: string[] = [];
  const normalized = text.replace(/['’]/g, "");
  let m: RegExpExecArray | null;
  SET_CODE_RE.lastIndex = 0;
  while ((m = SET_CODE_RE.exec(normalized)) !== null) {
    const code = `${m[1]}-${m[2]}`.toUpperCase();
    // "Pokemon TCG 30th Celebration" style titles must not produce M6-style
    // false positives from random letter+digit pairs — require the code to
    // contain a digit (guaranteed by the regex) and skip pure noise words.
    if (code.length >= 3) codes.push(code);
  }
  return codes;
}

/** Does `title` contain the set code as a standalone token? (OP-18 ≠ OP-1) */
function titleHasCode(title: string, code: string): boolean {
  const [prefix, num] = code.split("-");
  const re = new RegExp(
    `(^|[^A-Za-z0-9])${prefix}[-‑–\\s]?${num.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^0-9A-Za-z]|$)`,
    "i"
  );
  return re.test(title.replace(/['’]/g, ""));
}

/* ── Category keyword fallback ── */
const CATEGORY_KEYWORDS: { re: RegExp; category: string; sub?: string }[] = [
  { re: /japanese[^a-z]*one\s*piece|one\s*piece[^a-z]*(japanese|jp)\b/i, category: "Japanese One Piece" },
  { re: /english[^a-z]*one\s*piece|one\s*piece[^a-z]*english\b/i, category: "English One Piece" },
  { re: /one\s*piece|\bOP-\d/i, category: "English One Piece" },
  { re: /pok[eé]mon|ポケモン/i, category: "Pokemon" },
  { re: /dragon\s*ball|\bDBS?\b/i, category: "Other TCG", sub: "Dragon Ball" },
  { re: /lorcana/i, category: "Other TCG", sub: "Lorcana" },
  { re: /union\s*arena/i, category: "Other TCG", sub: "Union Arena" },
  { re: /weiss\s*schwarz/i, category: "Other TCG", sub: "Weiss Schwarz" },
  { re: /gundam/i, category: "Other TCG", sub: "Gundam" },
  { re: /hololive/i, category: "Other TCG", sub: "hololive CG" },
];

/* ── Product preference scoring (lower = better) ── */
function productScore(p: LinkableProduct, preferEnglish: boolean): number {
  let s = 0;
  if (p.in_stock === false) s += 100;               // prefer in-stock
  const sub = (p.subcategory || (p.categories && p.categories[1]) || "").toLowerCase();
  if (sub === "booster boxes" || sub === "booster box") s -= 10; // flagship product first
  else if (sub === "sealed case") s -= 5;
  if (preferEnglish && /^english/i.test(String(p.category || ""))) s -= 20;
  if (!preferEnglish && /^japanese/i.test(String(p.category || ""))) s -= 20;
  return s;
}

/**
 * Resolve where a hero slide's "Shop Now" should take the customer.
 * `products` is the full live catalog (order matters for slug parity).
 */
export function resolveSlideTarget(
  slide: LinkableSlide,
  products: LinkableProduct[]
): SlideTarget {
  if (!products || products.length === 0) return null;
  const slugMap = buildSlugMap(products);
  const title = `${slide.title || ""}`;
  const slideText = `${slide.title || ""} ${slide.subtitle || ""} ${slide.accent || ""}`;
  const preferJapanese = /japanese|日本語|\bJP\b/i.test(slideText);
  const preferEnglish = !preferJapanese; // international default for One Piece

  /* 1. Explicit admin link */
  if (slide.productId) {
    const p = products.find((x) => x.id === slide.productId);
    if (p) return { kind: "product", product: p, slug: p.slug || slugMap.get(p.id) || slugify(p.title) };
  }

  /* 2. Image match (exact product artwork) */
  if (slide.image) {
    const byImage = products.filter((p) => p.image && p.image === slide.image);
    if (byImage.length > 0) {
      byImage.sort((a, b) => productScore(a, preferEnglish) - productScore(b, preferEnglish));
      const p = byImage[0];
      return { kind: "product", product: p, slug: p.slug || slugMap.get(p.id) || slugify(p.title) };
    }
  }

  /* 3. Set-code match from the slide title */
  const codes = extractSetCodes(title);
  for (const code of codes) {
    const hits = products.filter((p) => titleHasCode(p.title || "", code));
    if (hits.length > 0) {
      hits.sort((a, b) => productScore(a, preferEnglish) - productScore(b, preferEnglish));
      const p = hits[0];
      return { kind: "product", product: p, slug: p.slug || slugMap.get(p.id) || slugify(p.title) };
    }
  }

  /* 4. Category keyword fallback — open the category in the shop */
  for (const kw of CATEGORY_KEYWORDS) {
    if (kw.re.test(slideText)) {
      const exists = products.some(
        (p) =>
          (p.category || "").toLowerCase() === kw.category.toLowerCase() ||
          (p.categories || []).some((c) => c.toLowerCase() === kw.category.toLowerCase())
      );
      if (exists) return { kind: "category", category: kw.category, subcategory: kw.sub };
      // Subcategory keyword (e.g. Dragon Ball lives under Other TCG): the
      // category exists under a different parent — match by subcategory.
      if (kw.sub) {
        const viaSub = products.some((p) =>
          (p.categories || []).some((c) => c.toLowerCase() === (kw.sub || "").toLowerCase())
        );
        if (viaSub) {
          const parent = products.find((p) =>
            (p.categories || []).some((c) => c.toLowerCase() === (kw.sub || "").toLowerCase())
          );
          if (parent) return { kind: "category", category: parent.category || "Other TCG", subcategory: kw.sub };
        }
      }
    }
  }

  /* 5. No match — classic behaviour */
  return null;
}
