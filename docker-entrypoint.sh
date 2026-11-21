#!/bin/sh
# Akihabara standalone server — container entrypoint.
#
# 1. Run the first-boot bootstrap (create the database if needed, apply
#    db/schema.sql, one-time Supabase import). It is idempotent, exits 0
#    when DATABASE_URL is unset, and exits non-zero only when the schema
#    cannot be applied — in that case the API routes cannot work, so we
#    stop here instead of starting a broken server (the orchestrator
#    will restart the container and the bootstrap will retry).
# 2. Exec the Next.js standalone server, whether Next emitted it flat
#    (/app/server.js) or nested one directory deep (/app/<dir>/server.js).
set -u

node /app/bootstrap/bootstrap.mjs
boot_status=$?
if [ "$boot_status" -ne 0 ]; then
  echo "[entrypoint] bootstrap failed (exit $boot_status) — not starting the server" >&2
  exit "$boot_status"
fi

if [ -f /app/server.js ]; then
  exec node /app/server.js
fi

for dir in /app/*/; do
  case "$dir" in
    */node_modules/|*/bootstrap/) continue ;;
  esac
  if [ -f "${dir}server.js" ]; then
    exec node "${dir}server.js"
  fi
done

echo "[entrypoint] server.js not found under /app (flat or nested layout)" >&2
exit 1
