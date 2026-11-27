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
  // Security headers (added Nov 27 2026, Nuclei scan fix wave). Applied by
  // the standalone server build; static export hosts ignore headers() and
  // must set these at the host level instead. CSP is a safe baseline tuned
  // to what the store actually loads: Next.js inline bootstrap scripts,
  // the Tawk.to chat widget (embed.tawk.to script, *.tawk.to iframe +
  // websocket), and admin media previews (blob:). Product images are
  // same-origin; img-src still allows https: for admin-entered remote
  // image URLs in page content.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://embed.tawk.to",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.tawk.to wss://*.tawk.to",
              "frame-src 'self' https://*.tawk.to",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
