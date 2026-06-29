#!/bin/bash
# Render startup script - ensures database is seeded, then starts the server

echo "=== Akihabara TCG Warehouse - Starting ==="

# Ensure db directory exists
mkdir -p ./db 2>/dev/null || true

# Push schema and seed if database is empty or missing
if [ ! -f ./db/custom.db ] || [ ! -s ./db/custom.db ]; then
  echo "Database not found or empty — creating and seeding..."
  npx prisma db push --skip-generate 2>&1
  bun run prisma/seed.ts 2>&1 || node prisma/seed.js 2>&1
  echo "Database seeded successfully!"
else
  echo "Database exists — checking if seeded..."
  # Check if products exist, if not, seed
  PRODUCT_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM Product;" 2>/dev/null || echo "0")
  if [ "$PRODUCT_COUNT" = "0" ] || [ -z "$PRODUCT_COUNT" ]; then
    echo "Database has no products — seeding..."
    bun run prisma/seed.ts 2>&1 || node prisma/seed.js 2>&1
    echo "Database seeded successfully!"
  else
    echo "Database already has data — skipping seed."
  fi
fi

# Start the Next.js production server
echo "Starting Next.js server on port ${PORT:-3000}..."
exec bun run start
