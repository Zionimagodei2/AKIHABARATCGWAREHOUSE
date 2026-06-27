#!/bin/bash
# Render startup script - seeds database if empty, then starts the server

echo "=== Akihabara TCG Warehouse - Starting ==="

# Ensure db directory exists
mkdir -p ./db 2>/dev/null || true

# Push schema and seed if database is empty or missing
if [ ! -f ./db/custom.db ] || [ ! -s ./db/custom.db ]; then
  echo "Database not found or empty — creating and seeding..."
  npx prisma db push --skip-generate 2>&1
  npx prisma db seed 2>&1 || bun run prisma/seed.ts 2>&1 || node prisma/seed.ts 2>&1
  echo "Database seeded successfully!"
else
  echo "Database exists — skipping seed."
fi

# Start the Next.js production server
echo "Starting Next.js server on port ${PORT:-3000}..."
exec node .next/standalone/server.js
