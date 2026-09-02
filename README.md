# Akihabara TCG Warehouse

E-commerce storefront for authentic Japanese & English trading card games — Pokémon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam Card Game and Disney Lorcana. Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui**.

## Features

- **201 individual product pages** (`/product/[slug]`) with unique SEO metadata, Product + BreadcrumbList structured data (JSON-LD)
- **3 category landing pages** (`/pokemon-cards`, `/one-piece-cards`, `/japanese-tcg`) targeting head keywords
- **Fully server-rendered catalog** — all 201 products are in the initial HTML (search-engine crawlable, no client fetch needed)
- **Dynamic sitemap** (`/sitemap.xml`) covering all 205 URLs, plus `robots.txt`
- Client-side cart, search, filters, product quick-view and multi-currency display
- **Tawk.to live chat** on every page, loaded non-blocking with preconnect hints
- Checkout works with **or without** a backend (see below)
- Optimized WebP images throughout (logo 8 KB, product images ~20 KB, full catalog assets under 20 MB)

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
```

The product catalog lives in `public/products.json` (202 products) and is loaded at build/render time through `src/lib/product-data.ts` — the single source of truth shared by the home page, product pages, category pages and the sitemap.

## Build modes

| Mode | Command | Output | Use for |
|---|---|---|---|
| **Static export** | `npm run build:static` | `./out` | Free static hosting (Render Static Sites, Cloudflare Pages, Netlify, GitHub Pages) |
| **Standalone server** | `npm run build && npm start` | Node server | Server hosting with APIs (Render Web Service, VPS, Docker) |

### Static export (recommended for free 24/7 hosting)

```bash
npm run build:static
# → ./out  (all HTML pre-rendered: home, 3 category pages, 201 product pages,
#           sitemap.xml, robots.txt, 404.html, all images & assets)
```

Static hosting means true 24/7 uptime — there is no server process to sleep. The storefront is identical to the server build: catalog, cart, search, filters, product pages and live chat all work. Server-only features (order persistence, admin panel, accounts) require the standalone build with Supabase configured.

**Render (free):** New → Static Site → Build command `npm run build:static` → Publish directory `out`.

**Cloudflare Pages (free, unlimited bandwidth):** Build command `npm run build:static` → Output directory `out`.

### Server build with database (optional)

Set the Supabase environment variables to enable the API routes (orders, accounts, admin):

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...   (or SUPABASE_SERVICE_ROLE_KEY)
```

Without them, the site runs in catalog mode: checkout saves the order locally and guides the customer to confirm via Tawk.to live chat or email — no dead ends.

## Structure

```
src/
  app/
    page.tsx                    Home (SSR catalog + ItemList/FAQPage JSON-LD)
    product/[slug]/page.tsx     201 product pages (generateStaticParams)
    pokemon-cards/              Category landing pages
    one-piece-cards/
    japanese-tcg/
    sitemap.ts                  Dynamic sitemap (205 URLs)
    api/                        Server routes (excluded from static builds)
  components/
    tcg-store.tsx               Storefront (cart, filters, checkout, modals)
    category-landing.tsx        Category page template
    tawk-chat.tsx               Tawk.to widget loader (global)
  lib/
    product-data.ts             Catalog + slugs + SEO helpers (single source of truth)
public/
  products.json                 Product catalog (202 items)
  images/                       Optimized WebP assets
```

## Contact

- Live chat: Tawk.to widget (bottom-right on every page)
- WhatsApp: +81 80-2935-0455
- Email: support@akihabaratcgwarehouse.com
