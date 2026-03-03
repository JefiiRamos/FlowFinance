import type { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }
  // Dynamic require to avoid loading pg/adapter during build (causes "Failed to collect page data")
  const { PrismaPg } = require('@prisma/adapter-pg')
  const { PrismaClient } = require('@prisma/client')
  const adapter = new PrismaPg({ connectionString })
  const client = new PrismaClient({ adapter })
  globalForPrisma.prisma = client
  return client
}

/** Lazy-initialized Prisma client - avoids DB connection during build */
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as Record<string | symbol, unknown>)[prop]
  },
})
