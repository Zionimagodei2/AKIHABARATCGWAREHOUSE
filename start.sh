#!/bin/bash
# Render startup script - ensures database is seeded, then starts the server

echo "=== Akihabara TCG Warehouse - Starting ==="

# Get the absolute path of the project directory
PROJECT_DIR=$(pwd)
echo "Project directory: $PROJECT_DIR"

# Set DATABASE_URL with absolute path
# Render may set it as a relative path, so we convert to absolute
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:${PROJECT_DIR}/db/akihabara.db"
elif echo "$DATABASE_URL" | grep -q "^file:./"; then
  # Convert relative path to absolute
  REL_PATH=$(echo "$DATABASE_URL" | sed 's/^file://')
  export DATABASE_URL="file:${PROJECT_DIR}/${REL_PATH}"
fi

echo "Using DATABASE_URL: $DATABASE_URL"

# Also write .env file so Prisma can always find DATABASE_URL
echo "DATABASE_URL=\"${DATABASE_URL}\"" > .env
echo "ADMIN_EMAIL=${ADMIN_EMAIL:-admin@akihabara.com}" >> .env
echo "ADMIN_PASSWORD=${ADMIN_PASSWORD:-Akihabarat1\$}" >> .env
echo "NODE_ENV=production" >> .env
echo "Wrote .env file"

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
# Pass DATABASE_URL explicitly to ensure the child process inherits it
echo "Starting Next.js server on port ${PORT:-3000}..."
export PORT="${PORT:-3000}"
DATABASE_URL="$DATABASE_URL" PORT="$PORT" exec bun run start
