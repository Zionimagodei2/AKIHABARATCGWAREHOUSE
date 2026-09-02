#!/usr/bin/env bash
# Production preview: serve the static export (./out) on port 3000.
#
# This is what `npm run dev` / `bun run dev` runs, so the platform preview
# URL (Caddy → :3000) serves the real production build with gzip +
# immutable asset caching — the same performance profile as the deployed
# static site on Render (product pages, images, everything pre-rendered).
#
#   - Builds ./out on first run, or when sources are newer than the export.
#   - Restarts the static server if it ever exits (watchdog loop).
#   - Hot-reload development is still available via `npm run dev:next`.
set -uo pipefail
cd "$(dirname "$0")/.."

needs_build() {
  [ ! -f out/index.html ] && return 0
  [ -n "$(find src public next.config.ts package.json -type f -newer out/index.html -print -quit 2>/dev/null)" ]
}

if needs_build; then
  echo "▸ Static build missing or outdated — building (one-time)…"
  npx prisma generate >/dev/null 2>&1 || true  # types for src/lib/db.ts
  bash scripts/build-static.sh || exit 1
fi

# Watchdog: keep the static server alive no matter what.
while true; do
  node scripts/serve-static.mjs
  code=$?
  echo "▸ Static server exited (code $code) — restarting in 2s…" >&2
  sleep 2
done
