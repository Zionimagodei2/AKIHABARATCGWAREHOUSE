import type { NextConfig } from "next";

/**
 * Two build modes:
 *
 *  1. Static export (default for free static hosting — Render Static Sites,
 *     Cloudflare Pages, Netlify, GitHub Pages):
 *        NEXT_OUTPUT=export next build   (or: npm run build:static)
 *     Produces a fully static site in ./out — every page (home, 3 category
 *     pages, 201 product pages, sitemap.xml, robots.txt) is pre-rendered at
 *     build time. No server required, so free static hosts serve it 24/7.
 *
 *  2. Standalone server (Node hosting with APIs — Render Web Service, VPS,
 *     Docker):
 *        next build                     (or: npm run build)
 *     Keeps the /api routes (orders, auth, admin) and the admin panel.
 *
 * The storefront itself is identical in both modes: the catalog is baked into
 * the HTML at build time, and cart/search/filters are client-side. Without a
 * backend, checkout gracefully falls back to live-chat/email confirmation.
 */
const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        // Static hosts serve directory/index.html — emit /product/x/ URLs so
        // every link resolves on any CDN/static file server.
        trailingSlash: true,
      }
    : { output: "standalone" as const }),
  // Keep build artifacts of a static export separate from the dev server's
  // .next directory so `npm run build:static` never clobbers a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Product images are pre-optimized WebP served from /public — skip the
    // image optimizer (also required for static export).
    unoptimized: true,
  },
};

export default nextConfig;
