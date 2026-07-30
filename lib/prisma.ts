import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { resolveDatabaseUrl } from './database-url'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() })
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
