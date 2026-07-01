import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is set — fallback for environments where it's not configured
// (e.g., Render if env vars aren't passed through properly)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./db/akihabara.db'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db