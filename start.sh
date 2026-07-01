#!/bin/bash
# Render startup script - ensures database is seeded, then starts the server

echo "=== Akihabara TCG Warehouse - Starting ==="

# Get the absolute path of the project directory
PROJECT_DIR=$(pwd)
echo "Project directory: $PROJECT_DIR"

# Set DATABASE_URL with absolute path if not already set or if it's relative
if [ -z "$DATABASE_URL" ] || echo "$DATABASE_URL" | grep -q "^file:./"; then
  export DATABASE_URL="file:${PROJECT_DIR}/db/akihabara.db"
fi

echo "Using DATABASE_URL: $DATABASE_URL"

# Ensure db directory exists
mkdir -p "${PROJECT_DIR}/db" 2>/dev/null || true

# Always push schema and seed — this is idempotent and ensures data exists
# On Render free tier, the filesystem is ephemeral, so we seed on every start
echo "Pushing database schema..."
npx prisma db push --accept-data-loss 2>&1 || npx prisma db push 2>&1 || true

echo "Seeding database..."
bun run prisma/seed.ts 2>&1 || npx tsx prisma/seed.ts 2>&1 || node prisma/seed.js 2>&1 || true

echo "Database ready!"

# Start the Next.js production server
echo "Starting Next.js server on port ${PORT:-3000}..."
export PORT="${PORT:-3000}"
exec bun run start
