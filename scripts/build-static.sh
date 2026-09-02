#!/usr/bin/env bash
# Build a fully static export of Akihabara TCG Warehouse into ./out
#
# Usage:  npm run build:static     (or: bun run build:static)
#
# Static export cannot include server route handlers (/api/**), because a
# static host has no Node runtime. This script temporarily moves them out of
# the app tree for the duration of the build, then restores them, so the repo
# keeps full server capability for server deployments (npm run build).
#
# The storefront is unaffected:
#  - the product catalog is baked into the HTML at build time (SSR from
#    public/products.json via src/lib/product-data.ts),
#  - cart / search / filters / modals are client-side,
#  - checkout falls back to live-chat / email confirmation without the API,
#  - /admin is a client page that requires a backend and is robots-disallowed.
set -uo pipefail

cd "$(dirname "$0")/.."

STASH=".static-build-stash"
rm -rf "$STASH"
mkdir -p "$STASH"

# 1. Park the API routes (and their generated .next cache) outside the build
[ -d src/app/api ] && mv src/app/api "$STASH/api"

restore() {
  [ -d "$STASH/api" ] && mv "$STASH/api" src/app/api
  rm -rf "$STASH"
}
trap restore EXIT

# 2. Resolve the Next.js binary the same way on bun, npm and CI environments
if command -v next >/dev/null 2>&1; then
  NEXT_BIN="next"
elif command -v bunx >/dev/null 2>&1; then
  NEXT_BIN="bunx next"
else
  NEXT_BIN="npx --yes next"
fi

# 3. Static build (separate distDir so a running dev server is never clobbered;
#    with output: "export" the distDir becomes the export root)
echo "▸ Building static export (NEXT_OUTPUT=export)…"
NEXT_OUTPUT=export NEXT_DIST_DIR=.next-static $NEXT_BIN build
STATUS=$?

if [ $STATUS -eq 0 ] && [ -f .next-static/index.html ]; then
  rm -rf out
  mv .next-static out
  PAGES=$(find out -name index.html | wc -l)
  echo ""
  echo "✓ Static export complete → $(pwd)/out"
  echo "  HTML pages:            $PAGES"
  echo "  Sitemap:               out/sitemap.xml"
  echo "  robots.txt:            out/robots.txt"
  echo ""
  echo "  Deploy: point your static host's publish directory at ./out"
  echo "  (Render: Static Site → Build 'npm run build:static' → Publish 'out')"
else
  echo "✗ Static build failed (exit $STATUS)" >&2
fi

exit $STATUS
