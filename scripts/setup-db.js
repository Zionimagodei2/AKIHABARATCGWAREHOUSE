/**
 * Database setup script — runs before next start
 * Ensures database exists and is seeded
 * Uses plain Node.js (no TypeScript, no bun) for maximum compatibility on Render
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Database Setup ===');

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./db/akihabara.db';
  console.log('DATABASE_URL not set, using default:', process.env.DATABASE_URL);
}

// Write .env file so Prisma can find DATABASE_URL
const envContent = `DATABASE_URL="${process.env.DATABASE_URL}"\nNODE_ENV=production\n`;
fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
console.log('Wrote .env file with DATABASE_URL');

// Ensure db directory exists
const dbDir = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created db directory');
}

// Push schema
console.log('Pushing database schema...');
try {
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('Schema pushed successfully');
} catch (e) {
  console.error('Schema push failed (may be ok if already pushed):', e.message);
}

// Seed database
console.log('Seeding database...');
try {
  execSync('bun run prisma/seed.ts', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('Seed completed (bun)');
} catch (e) {
  console.log('Bun seed failed, trying tsx...');
  try {
    execSync('npx tsx prisma/seed.ts', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('Seed completed (tsx)');
  } catch (e2) {
    console.log('tsx seed failed, trying node directly...');
    try {
      execSync('node prisma/seed.js', {
        stdio: 'inherit',
        env: process.env,
      });
      console.log('Seed completed (node)');
    } catch (e3) {
      console.error('All seed methods failed:', e3.message);
      // Continue anyway — the app might still work with empty DB
    }
  }
}

console.log('=== Database Setup Complete ===');
