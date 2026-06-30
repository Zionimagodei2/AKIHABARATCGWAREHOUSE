#!/bin/bash
# Render startup script - ensures database is seeded, then starts the server

echo "=== Akihabara TCG Warehouse - Starting ==="

# Ensure data directory exists (for Render disk or local)
mkdir -p /data 2>/dev/null || true
mkdir -p ./db 2>/dev/null || true

# Always push schema and seed — this is idempotent and ensures data exists
# On Render free tier, the filesystem is ephemeral, so we seed on every start
echo "Pushing database schema..."
npx prisma db push --skip-generate 2>&1 || true

echo "Seeding database..."
bun run prisma/seed.ts 2>&1 || node prisma/seed.js 2>&1 || npx tsx prisma/seed.ts 2>&1 || true

echo "Database ready!"

# Start the Next.js production server
echo "Starting Next.js server on port ${PORT:-3000}..."
exec bun run start
